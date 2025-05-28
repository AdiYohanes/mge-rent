"use client";

import { useState, useEffect, useCallback } from "react";
import { format, isToday, startOfDay, addHours } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Clock,
  CalendarIcon,
  Clock3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMounted } from "@/hooks/use-mounted";
import useBookingItemStore from "@/store/BookingItemStore";
import { getProcessedAvailableTimes } from "@/api/booking/datePublicApi";

// Define types for time slots and hour slots
interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface MinuteSlot {
  label: string;
  value: string;
  available: boolean;
}

interface HourSlot {
  hour: number;
  label: string;
  available: boolean;
  minutes: MinuteSlot[];
}

// Main component
export default function DateTimeSelection() {
  const [today, setToday] = useState<Date | null>(null);
  const { selectedDate, setSelectedDate } = useBookingItemStore();
  const { selectedTime, setSelectedTime } = useBookingItemStore();
  const { duration, setDuration } = useBookingItemStore();
  const { setEndTime } = useBookingItemStore();
  // Get selected console and unit from BookingItemStore
  const { selectedConsole } = useBookingItemStore();
  const { selectedUnitName } = useBookingItemStore();

  const [hourSlots, setHourSlots] = useState<HourSlot[]>([]);
  const [rawTimeSlots, setRawTimeSlots] = useState<TimeSlot[]>([]);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false);
  const [timeSlotError, setTimeSlotError] = useState<string | null>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (mounted) {
      const now = new Date();
      const currentDate = now;
      setToday(currentDate);
      if (selectedDate === undefined) {
        setSelectedDate(currentDate);
      }
    }
  }, [mounted, setSelectedDate, selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedTime && duration > 0) {
      try {
        const [hoursStr, minutesStr] = selectedTime.split(":");
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (!isNaN(hours) && !isNaN(minutes)) {
          const startDate = new Date(selectedDate);
          startDate.setHours(hours, minutes, 0, 0);

          const calculatedEndTime = addHours(startDate, duration);
          setEndTime(calculatedEndTime);

          // Check if this booking has conflicts
          if (rawTimeSlots && rawTimeSlots.length > 0) {
            // The duration check would happen here when booking
            console.log(
              `Selected time ${selectedTime} with ${duration}h duration, ending at ${format(
                calculatedEndTime,
                "HH:mm"
              )}`
            );
          }
        } else {
          setEndTime(null);
        }
      } catch (error) {
        console.error("Error calculating end time:", error);
        setEndTime(null);
      }
    } else {
      setEndTime(null);
    }
  }, [selectedDate, selectedTime, duration, setEndTime, rawTimeSlots]);

  // Process raw time slots into hour/minute structure
  const processTimeSlots = useCallback((slots: TimeSlot[]) => {
    console.log("Processing time slots:", slots.length);

    if (!slots || slots.length === 0) {
      console.log("No slots to process");
      return [];
    }

    const hours: HourSlot[] = [];
    const processedHours = new Set<number>();

    // First, display all the slot data for debugging
    console.log("First 5 slots:", slots.slice(0, 5));

    // Process slots in order
    slots.forEach((slot) => {
      // Skip invalid slots
      if (!slot.startTime) {
        console.log("Skipping invalid slot:", slot);
        return;
      }

      const [hourStr, minuteStr] = slot.startTime.split(":");
      if (!hourStr || !minuteStr) {
        console.log("Invalid time format:", slot.startTime);
        return;
      }

      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour) || isNaN(minute)) {
        console.log("Invalid time numbers:", hourStr, minuteStr);
        return;
      }

      // Skip if not on the hour or half-hour
      if (minute !== 0 && minute !== 30) return;

      // Create hour slot if it doesn't exist
      if (!processedHours.has(hour)) {
        const timeDate = new Date();
        timeDate.setHours(hour, 0);
        const hourLabel = format(timeDate, "HH:mm");

        hours.push({
          hour,
          label: hourLabel,
          available: false, // Will update based on minutes
          minutes: [],
        });

        processedHours.add(hour);
      }

      // Find the hour slot
      const hourSlot = hours.find((h) => h.hour === hour);
      if (!hourSlot) return;

      // Create minute slot
      const timeDate = new Date();
      timeDate.setHours(hour, minute);
      const label = format(timeDate, "HH:mm");
      const value = slot.startTime;

      // Use the slot's available status directly
      const slotAvailable = slot.available;

      hourSlot.minutes.push({
        label,
        value,
        available: slotAvailable,
      });

      // Update hour availability if any minute is available
      if (slotAvailable) {
        hourSlot.available = true;
      }
    });

    console.log(`Processed ${hours.length} hour slots`);

    // Sort hours with special handling for midnight and early morning hours
    hours.sort((a, b) => {
      // For hours after midnight (0, 1), add 24 to make them sort after all other hours
      const adjustedHourA = a.hour < 2 ? a.hour + 24 : a.hour;
      const adjustedHourB = b.hour < 2 ? b.hour + 24 : b.hour;
      return adjustedHourA - adjustedHourB;
    });

    // Sort minutes within each hour
    hours.forEach((hour) => {
      hour.minutes.sort((a, b) => {
        const [aHour, aMin] = a.value.split(":").map(Number);
        const [bHour, bMin] = b.value.split(":").map(Number);

        // For minutes in hours after midnight, add 24 to the hour for sorting
        const adjustedAHour = aHour < 2 ? aHour + 24 : aHour;
        const adjustedBHour = bHour < 2 ? bHour + 24 : bHour;

        return adjustedAHour === adjustedBHour
          ? aMin - bMin
          : adjustedAHour - adjustedBHour;
      });
    });

    return hours;
  }, []);

  // Generate time slots based on business hours
  const generateTimeSlots = useCallback(
    (date: Date) => {
      console.log("Generating time slots for", format(date, "EEEE, MMMM d"));
      const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

      // Define business hours for each day
      const businessHours: { [key: number]: { start: number; end: number } } = {
        0: { start: 10, end: 24 }, // Sunday (Minggu): 10 AM - 00:00 (midnight)
        1: { start: 10, end: 24 }, // Monday (Senin): 10 AM - 00:00 (midnight)
        2: { start: 10, end: 24 }, // Tuesday (Selasa): 10 AM - 00:00 (midnight)
        3: { start: 10, end: 24 }, // Wednesday (Rabu): 10 AM - 00:00 (midnight)
        4: { start: 10, end: 24 }, // Thursday (Kamis): 10 AM - 00:00 (midnight)
        5: { start: 14, end: 25 }, // Friday (Jumat): 2 PM - 01:00 (1 AM next day)
        6: { start: 10, end: 25 }, // Saturday (Sabtu): 10 AM - 01:00 (1 AM next day)
      };

      // Get business hours for the selected day
      const { start: startHour, end: endHour } = businessHours[dayOfWeek];

      const mockTimeSlots: TimeSlot[] = [];

      // Generate time slots every 30 minutes
      for (let hour = startHour; hour <= endHour; hour++) {
        for (const minute of [0, 30]) {
          // Skip the 1:30 AM slot if we're going up to 1 AM
          if (hour === endHour && minute === 30) continue;

          // Handle hours > 23 for next day slots (after midnight)
          const displayHour = hour > 23 ? hour - 24 : hour;
          const startHourFormatted = displayHour.toString().padStart(2, "0");
          const startMinuteFormatted = minute.toString().padStart(2, "0");

          // Calculate end time (30 minutes later)
          let endHourVal = hour;
          let endMinuteVal = minute + 30;

          if (endMinuteVal >= 60) {
            endHourVal += 1;
            endMinuteVal -= 60;
          }

          // Handle hours > 23 for next day slots (after midnight)
          const displayEndHour = endHourVal > 23 ? endHourVal - 24 : endHourVal;
          const endHourFormatted = displayEndHour.toString().padStart(2, "0");
          const endMinuteFormatted = endMinuteVal.toString().padStart(2, "0");

          // Create time slot
          const startTime = `${startHourFormatted}:${startMinuteFormatted}`;
          const endTime = `${endHourFormatted}:${endMinuteFormatted}`;

          // Check if slot is in the past for today
          let available = true;
          if (isToday(date)) {
            const now = new Date();
            const slotDate = new Date(date);

            // Special handling for midnight (00:00) to prevent it from being marked as past time incorrectly
            if (displayHour === 0 && minute === 0) {
              // For midnight, we need to set it to the next day to compare correctly
              slotDate.setDate(slotDate.getDate() + 1);
              slotDate.setHours(0, 0, 0, 0);
            } else {
              slotDate.setHours(displayHour, minute);
            }

            if (slotDate <= now) {
              available = false;
            }
          }

          mockTimeSlots.push({
            startTime,
            endTime,
            available,
          });
        }
      }

      console.log("Generated time slots:", mockTimeSlots.length);
      setRawTimeSlots(mockTimeSlots);

      // Process the mock time slots
      const processedHours = processTimeSlots(mockTimeSlots);
      setHourSlots(processedHours);
    },
    [processTimeSlots]
  );

  const fetchTimeSlots = useCallback(
    async (date: Date | undefined) => {
      if (!date || !mounted) return;

      setIsLoadingTimeSlots(true);
      setTimeSlotError(null);
      setSelectedTime("");

      try {
        // Format date as YYYY-MM-DD for API
        const formattedDate = format(date, "yyyy-MM-dd");

        // Get unitId from selectedUnitName if available
        let unitId: number | undefined;

        // If we have a selectedUnitName, extract unit ID
        if (selectedUnitName && selectedUnitName !== "all") {
          // For now, let's use a mock unit ID of 21 for testing
          unitId = 21; // This is just a placeholder
        } else if (selectedConsole) {
          // If no specific unit is selected but console is, use console ID
          unitId = selectedConsole.id;
        } else {
          // No unit or console selected yet
          console.log("No unit or console selected");
          setHourSlots([]);
          setRawTimeSlots([]);
          setIsLoadingTimeSlots(false);
          return;
        }

        console.log(`Fetching times for unit ${unitId} on ${formattedDate}`);

        try {
          // Fetch available times from API
          const response = await getProcessedAvailableTimes(
            unitId,
            formattedDate
          );

          console.log("API response received");

          // Store raw time slots
          const apiTimeSlots = response.timeSlots || [];
          console.log(`Got ${apiTimeSlots.length} time slots from API`);

          if (apiTimeSlots.length === 0) {
            console.log("No slots returned from API, using fallback");
            generateTimeSlots(date);
            return;
          }

          // Get the day of week to determine business hours
          const dayOfWeek = date.getDay();
          const businessHours: {
            [key: number]: { start: number; end: number };
          } = {
            0: { start: 10, end: 24 }, // Sunday (Minggu): 10 AM - 00:00 (midnight)
            1: { start: 10, end: 24 }, // Monday (Senin): 10 AM - 00:00 (midnight)
            2: { start: 10, end: 24 }, // Tuesday (Selasa): 10 AM - 00:00 (midnight)
            3: { start: 10, end: 24 }, // Wednesday (Rabu): 10 AM - 00:00 (midnight)
            4: { start: 10, end: 24 }, // Thursday (Kamis): 10 AM - 00:00 (midnight)
            5: { start: 14, end: 25 }, // Friday (Jumat): 2 PM - 01:00 (1 AM next day)
            6: { start: 10, end: 25 }, // Saturday (Sabtu): 10 AM - 01:00 (1 AM next day)
          };

          // Get business hours for the selected day
          const { start: startHour, end: endHour } = businessHours[dayOfWeek];

          // Generate all possible time slots based on business hours
          const allTimeSlots: TimeSlot[] = [];

          for (let hour = startHour; hour <= endHour; hour++) {
            for (const minute of [0, 30]) {
              // Skip the 1:30 AM slot if we're going up to 1 AM
              if (hour === endHour && minute === 30) continue;

              // Handle hours > 23 for next day slots (after midnight)
              const displayHour = hour > 23 ? hour - 24 : hour;
              const startHourFormatted = displayHour
                .toString()
                .padStart(2, "0");
              const startMinuteFormatted = minute.toString().padStart(2, "0");

              // Calculate end time (30 minutes later)
              let endHourVal = hour;
              let endMinuteVal = minute + 30;

              if (endMinuteVal >= 60) {
                endHourVal += 1;
                endMinuteVal -= 60;
              }

              // Handle hours > 23 for next day slots (after midnight)
              const displayEndHour =
                endHourVal > 23 ? endHourVal - 24 : endHourVal;
              const endHourFormatted = displayEndHour
                .toString()
                .padStart(2, "0");
              const endMinuteFormatted = endMinuteVal
                .toString()
                .padStart(2, "0");

              // Create time slot
              const startTime = `${startHourFormatted}:${startMinuteFormatted}`;
              const endTime = `${endHourFormatted}:${endMinuteFormatted}`;

              // Check if slot is in the past for today
              let available = true;
              if (isToday(date)) {
                const now = new Date();
                const slotDate = new Date(date);

                // Special handling for midnight (00:00) to prevent it from being marked as past time incorrectly
                if (displayHour === 0 && minute === 0) {
                  // For midnight, we need to set it to the next day to compare correctly
                  slotDate.setDate(slotDate.getDate() + 1);
                  slotDate.setHours(0, 0, 0, 0);
                } else {
                  slotDate.setHours(displayHour, minute);
                }

                if (slotDate <= now) {
                  available = false;
                }
              }

              // Now check against API time slots to determine availability
              // The API returns hourly time slots, so we need to check if our 30-min slot falls within an hour that's marked unavailable
              const apiStartHour = parseInt(startHourFormatted);

              // Find the matching API time slot
              const matchingApiSlot = apiTimeSlots.find((slot) => {
                const apiSlotHour = parseInt(slot.startTime.split(":")[0]);
                return apiSlotHour === apiStartHour;
              });

              // If we have a matching API slot, use its availability
              if (matchingApiSlot) {
                available = available && matchingApiSlot.available;
              }

              allTimeSlots.push({
                startTime,
                endTime,
                available,
              });
            }
          }

          console.log(
            `Generated ${allTimeSlots.length} time slots with API availability`
          );
          setRawTimeSlots(allTimeSlots);

          // Process the time slots
          const processedHours = processTimeSlots(allTimeSlots);
          setHourSlots(processedHours);
        } catch (apiError) {
          console.error("API error:", apiError);
          // Fallback to generating time slots locally
          console.log("Falling back to local time slot generation");
          generateTimeSlots(date);
        }
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setTimeSlotError("Failed to load available time slots");
        generateTimeSlots(date);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    },
    [
      mounted,
      selectedUnitName,
      selectedConsole,
      processTimeSlots,
      generateTimeSlots,
    ]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, fetchTimeSlots, selectedUnitName, selectedConsole]);

  // Effect to update availability when duration changes
  useEffect(() => {
    if (rawTimeSlots && rawTimeSlots.length > 0) {
      console.log(
        "Recalculating availability due to duration change:",
        duration
      );
      const processedHours = processTimeSlots(rawTimeSlots);
      setHourSlots(processedHours);
    }
  }, [duration, rawTimeSlots, processTimeSlots]);

  // Function to disable past dates
  const getDisabledDays = () => {
    if (!today) return undefined;
    return { before: startOfDay(today) };
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
      setSelectedTime("");
    }
  };

  const handleTimeSelect = (time: string) => {
    console.log("Time selected:", time);
    setSelectedTime(time);

    // Additional debugging for selected time
    if (rawTimeSlots && rawTimeSlots.length > 0) {
      const selectedSlot = rawTimeSlots.find((slot) => slot.startTime === time);
      if (selectedSlot) {
        console.log("Selected slot data:", selectedSlot);
      } else {
        console.log("Warning: Selected time not found in available slots");
      }
    }
  };

  // Simplified function to return all hour slots
  const getAvailableHourSlots = () => {
    return hourSlots;
  };

  // Render a loading skeleton while hydrating for consistent SSR and CSR
  const renderSkeleton = () => (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="h-[600px] flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-8 mx-auto"></div>
            <div className="h-64 w-full max-w-md bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // For consistent server-side and client-side rendering
  return (
    <>
      {!mounted && renderSkeleton()}
      {mounted && (
        <div className="p-4 md:p-8 bg-gradient-to-b from-[#B99733]/5 to-white min-h-screen">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-[#B99733]">
                Book Your Appointment
              </h1>
              <p className="text-[#B99733]/80 mt-2">
                Select a date and time that works for you
              </p>

              {/* Selected unit info */}
              {selectedUnitName ? (
                <Badge
                  variant="outline"
                  className="bg-[#B99733]/10 border-[#B99733]/20 text-[#B99733] mt-3"
                >
                  {selectedUnitName === "all"
                    ? "All Units"
                    : `Selected Unit: ${selectedUnitName}`}
                </Badge>
              ) : selectedConsole ? (
                <Badge
                  variant="outline"
                  className="bg-[#B99733]/10 border-[#B99733]/20 text-[#B99733] mt-3"
                >
                  {`Selected Console: ${selectedConsole.name}`}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-100 border-red-200 text-red-600 mt-3"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Please select a unit first
                </Badge>
              )}
            </header>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Date Selection - Mobile View */}
              <Card className="shadow-md border border-[#B99733]/20 md:hidden">
                <CardHeader className="pb-2 border-b border-[#B99733]/10">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#B99733]">
                    <CalendarIcon className="h-5 w-5 text-[#B99733]/80" />
                    <span>Selected Date</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center border-[#B99733]/20 hover:bg-[#B99733]/10"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#B99733]" />
                      <span>
                        {selectedDate
                          ? format(selectedDate, "EEEE, MMMM d, yyyy")
                          : "Select date"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-[#B99733] transition-transform ${
                        showCalendar ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {showCalendar && (
                    <div className="mt-4 border border-[#B99733]/20 rounded-md overflow-hidden">
                      {today && (
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateChange}
                          disabled={getDisabledDays()}
                          defaultMonth={today}
                          className="rounded-md border-[#B99733]/20"
                          classNames={{
                            day_selected:
                              "bg-[#B99733] text-white hover:bg-[#B99733]/90 hover:text-white focus:bg-[#B99733] focus:text-white",
                            day_today: "bg-[#B99733]/10 text-[#B99733]",
                            day_outside: "text-[#B99733]/30",
                            day: "hover:bg-[#B99733]/10 cursor-pointer",
                          }}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date Selection - Desktop View */}
              <Card className="shadow-md border border-red md:col-span-2 hidden md:block">
                <CardHeader className="pb-2 border-b border-[#B99733]/10">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#B99733]">
                    <CalendarIcon className="h-5 w-5 text-[#B99733]/80" />
                    <span>Select Date</span>
                  </CardTitle>
                  <CardDescription className="text-[#B99733]/70">
                    Choose a date for your booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="calendar-container w-full h-full">
                    {today && (
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        disabled={getDisabledDays()}
                        defaultMonth={today}
                        className="rounded-md border-[#B99733]/20 w-full h-full"
                        classNames={{
                          day_selected:
                            "bg-[#B99733] text-white hover:bg-[#B99733]/90 hover:text-white focus:bg-[#B99733] focus:text-white flex justify-center items-center", // Menambahkan flexbox untuk centering
                          day_today: "bg-[#B99733]/10 text-[#B99733]",
                          day_outside: "text-[#B99733]/30",
                          day: "hover:bg-[#B99733]/10 cursor-pointer",
                        }}
                        style={{
                          fontSize: "1.5rem", // Menyesuaikan ukuran font
                          height: "100%", // Pastikan kalender mengisi seluruh tinggi kontainer
                          width: "100%", // Pastikan kalender mengisi seluruh lebar kontainer
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Time Slot Selection */}
              <div className="space-y-6 md:col-span-3">
                <Card className="shadow-md border border-[#B99733]/20 transition-opacity duration-300">
                  <CardHeader className="pb-2 border-b border-[#B99733]/10">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2 text-lg text-[#B99733]">
                        <Clock className="h-5 w-5 text-[#B99733]/80" />
                        <span>Select Time</span>
                      </CardTitle>

                      {selectedDate && (
                        <Badge
                          variant="outline"
                          className="text-[#B99733] bg-[#B99733]/10 border-[#B99733]/20 hidden md:flex"
                        >
                          {format(selectedDate, "EEEE, MMMM d")}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[#B99733]/70">
                      {!selectedConsole && !selectedUnitName
                        ? "Please select a unit first"
                        : selectedDate
                        ? `Available times for your booking`
                        : "Please select a date first"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Loading state */}
                    {isLoadingTimeSlots && (
                      <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[#B99733] mr-3" />
                        <span>Loading available times...</span>
                      </div>
                    )}

                    {/* Error state */}
                    {timeSlotError && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                        <p className="text-red-500 mb-4">{timeSlotError}</p>
                        <Button
                          variant="outline"
                          onClick={() => fetchTimeSlots(selectedDate)}
                          className="border-[#B99733]/20 hover:bg-[#B99733]/10"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}

                    {/* No unit selected message */}
                    {!isLoadingTimeSlots &&
                      !timeSlotError &&
                      !selectedConsole &&
                      !selectedUnitName && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                          <p className="text-amber-500">
                            Please select a console or unit first to view
                            available times
                          </p>
                        </div>
                      )}

                    {/* Time slots */}
                    {!isLoadingTimeSlots &&
                      !timeSlotError &&
                      (selectedConsole || selectedUnitName) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[220px] overflow-y-auto pr-2">
                          {getAvailableHourSlots().length > 0 ? (
                            getAvailableHourSlots().map((hourSlot) => (
                              <Popover key={hourSlot.hour}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    disabled={!hourSlot.available}
                                    className={cn(
                                      "w-full justify-between h-10 sm:h-12 px-3 py-2 border-[#B99733]/20 hover:bg-[#B99733]/10 cursor-pointer text-xs sm:text-sm",
                                      !hourSlot.available &&
                                        "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <Clock3 className="h-3 w-3 sm:h-4 sm:w-4 text-[#B99733]" />
                                      <span className="text-[#B99733]">
                                        {hourSlot.label}
                                      </span>
                                    </div>
                                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-[#B99733]/70" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-2">
                                  <div className="grid grid-cols-2 gap-1">
                                    {hourSlot.minutes.map((minute) => (
                                      <Button
                                        key={minute.value}
                                        variant={
                                          selectedTime === minute.value
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        disabled={!minute.available}
                                        onClick={() => {
                                          console.log(
                                            "Clicking time:",
                                            minute.value,
                                            "Available:",
                                            minute.available
                                          );
                                          handleTimeSelect(minute.value);
                                        }}
                                        className={cn(
                                          "justify-center h-8 sm:h-9 text-xs sm:text-sm cursor-pointer",
                                          selectedTime === minute.value
                                            ? "bg-[#B99733] text-white hover:bg-[#B99733]/90"
                                            : "border-[#B99733]/20 hover:bg-[#B99733]/10",
                                          !minute.available &&
                                            "opacity-50 cursor-not-allowed"
                                        )}
                                      >
                                        {minute.label.split(" ")[0]}
                                      </Button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ))
                          ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                              <Clock className="h-10 w-10 text-gray-300 mb-2" />
                              <p className="text-gray-500">
                                No available time slots for this selection
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Time slot info */}
                    {selectedDate && isToday(selectedDate) && (
                      <p className="text-xs text-[#B99733]/70 mt-4 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-[#B99733]/30 rounded-full"></span>
                        Time slots before current time are unavailable
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md border border-[#B99733]/20 transition-opacity duration-300">
                  <CardHeader className="pb-2 border-b border-[#B99733]/10">
                    <CardTitle className="text-lg text-[#B99733] flex items-center gap-2">
                      <Clock3 className="h-5 w-5 text-[#B99733]/80" />
                      <span>Duration</span>
                    </CardTitle>
                    <CardDescription className="text-[#B99733]/70">
                      How long do you need?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((hours) => (
                        <Button
                          key={hours}
                          variant={duration === hours ? "default" : "outline"}
                          className={cn(
                            "py-2 cursor-pointer h-10 sm:h-12 text-xs sm:text-sm",
                            duration === hours
                              ? "bg-[#B99733] hover:bg-[#B99733]/90 text-white"
                              : "border-[#B99733]/20 hover:bg-[#B99733]/10 text-[#B99733]"
                          )}
                          onClick={() => setDuration(hours)}
                        >
                          {hours}h
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 flex justify-between items-center border-t border-[#B99733]/10 mt-4">
                    <div className="text-xs sm:text-sm text-[#B99733]/80">
                      {selectedDate && selectedTime ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>
                            {format(selectedDate, "MMM d")} at {selectedTime}
                          </span>
                        </div>
                      ) : (
                        <span>Select date and time to continue</span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

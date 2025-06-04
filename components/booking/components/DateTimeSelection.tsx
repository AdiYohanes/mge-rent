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
import {
  getAvailableTimes,
  TimeSlot as ApiTimeSlot,
} from "@/api/booking/datePublicApi";

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

interface BusinessHours {
  open: string;
  close: string;
  rest_time: string;
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
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(
    null
  );
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

      // Set default duration to 1 hour if not already set
      if (duration === undefined || duration <= 0) {
        setDuration(1);
        console.log("Setting default duration to 1 hour");
      }
    }
  }, [mounted, setSelectedDate, selectedDate, duration, setDuration]);

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

  // Process raw time slots into hour/minute structure with duration support
  const processTimeSlots = useCallback(
    (apiSlots: ApiTimeSlot[], businessHours: BusinessHours | null) => {
      console.log("Processing time slots:", apiSlots.length);

      if (!apiSlots || apiSlots.length === 0) {
        console.log("No slots to process");
        return [];
      }

      // Parse rest time if available
      let restStartHour = -1;
      let restEndHour = -1;

      if (businessHours?.rest_time) {
        const [restStart, restEnd] = businessHours.rest_time.split(" - ");
        restStartHour = parseInt(restStart.split(":")[0], 10);
        restEndHour = parseInt(restEnd.split(":")[0], 10);
        console.log(`Rest time: ${restStartHour}:00 - ${restEndHour}:00`);
      }

      // Build a map of available hours based on API response
      const availabilityMap = new Map<string, boolean>();

      apiSlots.forEach((slot) => {
        // Store availability status keyed by start_time (e.g. "10:00")
        availabilityMap.set(slot.start_time, slot.available);

        // Extract hour from start_time
        const hour = parseInt(slot.start_time.split(":")[0], 10);

        // Mark rest hours as unavailable
        if (hour === restStartHour) {
          availabilityMap.set(slot.start_time, false);
        }
      });

      // Create hours and minutes structure
      const hours: HourSlot[] = [];
      const processedHours = new Set<number>();

      // First, display some slots for debugging
      console.log("First 5 slots:", apiSlots.slice(0, 5));

      // Process slots in order to create hour/minute structure
      for (const slot of apiSlots) {
        // Split start_time into hour and minute
        const [hourStr, minuteStr] = slot.start_time.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (isNaN(hour) || isNaN(minute)) {
          console.log("Invalid time format:", slot.start_time);
          continue;
        }

        // Create hour slot if it doesn't exist
        if (!processedHours.has(hour)) {
          const timeDate = new Date();
          timeDate.setHours(hour, 0);
          const hourLabel = format(timeDate, "HH:mm");

          hours.push({
            hour,
            label: hourLabel,
            available: false, // Will update based on available minutes
            minutes: [],
          });
          processedHours.add(hour);
        }

        // Find the hour slot
        const hourSlot = hours.find((h) => h.hour === hour);
        if (!hourSlot) continue;

        // Only process slots at :00 and :30 minutes
        if (minute === 0 || minute === 30) {
          const timeDate = new Date();
          timeDate.setHours(hour, minute);
          const label = format(timeDate, "HH:mm");

          // Get availability from map or default to true
          const isAvailable = availabilityMap.get(slot.start_time) ?? false;

          // Special handling for rest time slots
          const isRestTime = hour === restStartHour;

          hourSlot.minutes.push({
            label,
            value: slot.start_time,
            available: isRestTime ? false : isAvailable,
          });

          // Update hour availability if any minute is available
          if (!isRestTime && isAvailable) {
            hourSlot.available = true;
          }
        }
      }

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
          // Extract minutes from the time values
          const minuteA = parseInt(a.value.split(":")[1], 10);
          const minuteB = parseInt(b.value.split(":")[1], 10);
          return minuteA - minuteB;
        });
      });

      return hours;
    },
    []
  );

  // Generate time slots based on business hours
  const generateTimeSlots = useCallback(
    (date: Date) => {
      console.log("Generating time slots for", format(date, "EEEE, MMMM d"));
      const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

      // Define business hours for each day
      const businessHoursMap: {
        [key: number]: { start: number; end: number };
      } = {
        0: { start: 10, end: 24 }, // Sunday
        1: { start: 10, end: 24 }, // Monday
        2: { start: 10, end: 24 }, // Tuesday
        3: { start: 10, end: 24 }, // Wednesday
        4: { start: 10, end: 24 }, // Thursday
        5: { start: 14, end: 25 }, // Friday (ends at 1 AM)
        6: { start: 10, end: 25 }, // Saturday (ends at 1 AM)
      };

      // Get business hours for the selected day
      const { start: startHour, end: endHour } = businessHoursMap[dayOfWeek];

      // Create a rest time for fallback scenario (18:00 - 19:00)
      const restStartHour = 18;
      const restEndHour = 19;

      // Convert to API TimeSlot format for consistency
      const mockApiTimeSlots: ApiTimeSlot[] = [];

      // Generate time slots every hour as per API
      for (let hour = startHour; hour < endHour; hour++) {
        const displayHour = hour >= 24 ? hour - 24 : hour;
        const hourStr = displayHour.toString().padStart(2, "0");

        // Check if this hour is in the past for today
        let isAvailable = true;
        if (isToday(date)) {
          const now = new Date();
          const hourDate = new Date(date);
          hourDate.setHours(displayHour, 0, 0, 0);

          if (hourDate <= now) {
            isAvailable = false;
          }
        }

        // Check if this is rest time
        if (hour === restStartHour) {
          isAvailable = false;
        }

        // Add slot for the hour itself
        mockApiTimeSlots.push({
          start_time: `${hourStr}:00`,
          end_time: `${hourStr}:00`,
          available: isAvailable,
        });

        // Add slot for hour to next hour
        const nextHour = hour + 1;
        const nextDisplayHour = nextHour >= 24 ? nextHour - 24 : nextHour;
        const nextHourStr = nextDisplayHour.toString().padStart(2, "0");

        mockApiTimeSlots.push({
          start_time: `${hourStr}:00`,
          end_time: `${nextHourStr}:00`,
          available: isAvailable,
        });

        // Also add slots for half hours (for minute-level representation)
        mockApiTimeSlots.push({
          start_time: `${hourStr}:30`,
          end_time: `${hourStr}:30`,
          available: isAvailable,
        });
      }

      console.log("Generated API-format time slots:", mockApiTimeSlots.length);

      // Create a mock business hours object
      const mockBusinessHours: BusinessHours = {
        open: `${startHour}:00`,
        close: `${endHour}:00`,
        rest_time: `${restStartHour}:00 - ${restEndHour}:00`,
      };

      setBusinessHours(mockBusinessHours);

      // Process the time slots and update the UI
      const processedHours = processTimeSlots(
        mockApiTimeSlots,
        mockBusinessHours
      );
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
          // Fetch available times directly from API
          const apiResponse = await getAvailableTimes(unitId, formattedDate);
          console.log("API response received:", apiResponse.status);

          if (apiResponse.status === "success" && apiResponse.data) {
            const apiTimeSlots = apiResponse.data.time_slots || [];
            console.log(`Got ${apiTimeSlots.length} time slots from API`);

            if (apiTimeSlots.length === 0) {
              console.log("No slots returned from API, using fallback");
              generateTimeSlots(date);
              return;
            }

            // Store the business hours from API
            const apiBusinessHours = apiResponse.data.business_hours;
            setBusinessHours(apiBusinessHours);

            // Process the API time slots
            const processedHours = processTimeSlots(
              apiTimeSlots,
              apiBusinessHours
            );
            setHourSlots(processedHours);

            // Convert API slots to our internal format for other calculations
            const timeSlots = apiTimeSlots.map((slot) => ({
              startTime: slot.start_time,
              endTime: slot.end_time,
              available: slot.available,
            }));

            setRawTimeSlots(timeSlots);
          } else {
            console.error("Invalid API response format:", apiResponse);
            generateTimeSlots(date);
          }
        } catch (apiError) {
          console.error("API error:", apiError);
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

              {/* Rest time info */}
              {businessHours?.rest_time && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 border-amber-200 text-amber-600 mt-2 ml-2"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Rest time: {businessHours.rest_time}
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
                            "bg-[#B99733] text-white hover:bg-[#B99733]/90 hover:text-white focus:bg-[#B99733] focus:text-white flex justify-center items-center",
                          day_today: "bg-[#B99733]/10 text-[#B99733]",
                          day_outside: "text-[#B99733]/30",
                          day: "hover:bg-[#B99733]/10 cursor-pointer",
                        }}
                        style={{
                          fontSize: "1.5rem",
                          height: "100%",
                          width: "100%",
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

                    {/* Rest time info */}
                    {businessHours?.rest_time && (
                      <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-amber-400 rounded-full"></span>
                        Rest time ({businessHours.rest_time}) slots are
                        unavailable
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

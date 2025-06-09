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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMounted } from "@/hooks/use-mounted";
import useBookingItemStore from "@/store/BookingItemStore";
import { getAvailableTimes } from "@/api/booking/datePublicApi";

// Define interfaces for type safety
interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

interface BusinessHours {
  open: string;
  close: string;
  rest_time: string;
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

interface InternalTimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// Main component
export default function DateTimeSelection() {
  const mounted = useMounted();
  const [today, setToday] = useState<Date | null>(null);
  const [hourSlots, setHourSlots] = useState<HourSlot[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rawTimeSlots, setRawTimeSlots] = useState<InternalTimeSlot[]>([]); // Used for potential future conflict checking
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(
    null
  );
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false);
  const [timeSlotError, setTimeSlotError] = useState<string | null>(null);

  // Access store
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    duration,
    setDuration,
    setEndTime,
    selectedConsole,
    selectedUnitName,
    endTime,
  } = useBookingItemStore();

  // Initialize date and duration only after hydration
  useEffect(() => {
    if (mounted) {
      const now = new Date();
      setToday(now);

      if (!selectedDate) {
        setSelectedDate(now);
      }

      // Set default duration to 1 hour if not already set
      if (!duration || duration <= 0) {
        setDuration(1);
      }
    }
  }, [mounted, setSelectedDate, selectedDate, duration, setDuration]);

  // Calculate end time based on selected date, time and duration
  useEffect(() => {
    if (!mounted) return;

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
        } else {
          setEndTime(null);
        }
      } catch {
        // Suppress error - just reset end time
        setEndTime(null);
      }
    } else {
      setEndTime(null);
    }
  }, [mounted, selectedDate, selectedTime, duration, setEndTime]);

  // Process raw time slots into hour/minute structure with duration support
  const processTimeSlots = useCallback(
    (apiSlots: TimeSlot[], businessHours: BusinessHours | null) => {
      if (!apiSlots || apiSlots.length === 0) {
        return [];
      }

      // Parse rest time if available
      let restStartHour = -1;

      if (businessHours?.rest_time) {
        const [restStart] = businessHours.rest_time.split(" - ");
        restStartHour = parseInt(restStart.split(":")[0], 10);
      }

      // Build a map of available hours based on API response
      const availabilityMap = new Map<string, boolean>();
      const processedMinutes = new Set<string>();

      // Get current time for today's date comparison
      const now = new Date();
      const isToday =
        selectedDate &&
        format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

      apiSlots.forEach((slot: TimeSlot) => {
        // Check if the time slot is in the past for today
        let isAvailable = slot.available;

        if (isToday) {
          const [hoursStr, minutesStr] = slot.start_time.split(":");
          const slotHour = parseInt(hoursStr, 10);
          const slotMinute = parseInt(minutesStr, 10);

          // Create a date object for the slot time
          const slotTime = new Date(selectedDate);
          slotTime.setHours(slotHour, slotMinute, 0, 0);

          // If the slot time is before current time, mark as unavailable
          if (slotTime <= now) {
            isAvailable = false;
          }
        }

        // Store availability status
        availabilityMap.set(slot.start_time, isAvailable);

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

      // Process slots in order to create hour/minute structure
      for (const slot of apiSlots) {
        const [hourStr, minuteStr] = slot.start_time.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (isNaN(hour) || isNaN(minute)) {
          continue;
        }

        const minuteKey = `${hour}:${minute}`;
        if (processedMinutes.has(minuteKey)) continue;
        processedMinutes.add(minuteKey);

        if (!processedHours.has(hour)) {
          const timeDate = new Date();
          timeDate.setHours(hour, 0);
          // Convert 00:00 to 24:00 for display
          const displayHour = hour === 0 ? 24 : hour;
          const hourLabel = `${displayHour.toString().padStart(2, "0")}:00`;

          hours.push({
            hour,
            label: hourLabel,
            available: false,
            minutes: [],
          });
          processedHours.add(hour);
        }

        const hourSlot = hours.find((h) => h.hour === hour);
        if (!hourSlot) continue;

        if (minute === 0 || minute === 30) {
          const timeDate = new Date();
          timeDate.setHours(hour, minute);
          // Convert 00:00 to 24:00 for display
          const displayHour = hour === 0 ? 24 : hour;
          const label = `${displayHour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

          const isAvailable = availabilityMap.get(slot.start_time) ?? false;
          const isRestTime = hour === restStartHour;

          hourSlot.minutes.push({
            label,
            value: slot.start_time,
            available: isRestTime ? false : isAvailable,
          });

          if (!isRestTime && isAvailable) {
            hourSlot.available = true;
          }
        }
      }

      // Sort hours with special handling for midnight and early morning hours
      hours.sort((a, b) => {
        // Convert midnight (0) to 24 for sorting
        const adjustedHourA = a.hour === 0 ? 24 : a.hour;
        const adjustedHourB = b.hour === 0 ? 24 : b.hour;
        return adjustedHourA - adjustedHourB;
      });

      // Sort minutes within each hour
      hours.forEach((hour) => {
        hour.minutes.sort((a, b) => {
          const minuteA = parseInt(a.value.split(":")[1], 10);
          const minuteB = parseInt(b.value.split(":")[1], 10);
          return minuteA - minuteB;
        });
      });

      return hours;
    },
    [selectedDate]
  );

  // Generate time slots based on business hours
  const generateTimeSlots = useCallback(
    (date: Date) => {
      const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

      // Define business hours for each day
      const businessHoursMap = {
        0: { start: 10, end: 24 }, // Sunday
        1: { start: 10, end: 24 }, // Monday
        2: { start: 10, end: 24 }, // Tuesday
        3: { start: 10, end: 24 }, // Wednesday
        4: { start: 10, end: 24 }, // Thursday
        5: { start: 14, end: 25 }, // Friday (ends at 1 AM)
        6: { start: 10, end: 25 }, // Saturday (ends at 1 AM)
      };

      // Get business hours for the selected day
      const { start: startHour, end: endHour } =
        businessHoursMap[dayOfWeek as keyof typeof businessHoursMap];

      // Create a rest time for fallback scenario (18:00 - 19:00)
      const restStartHour = 18;
      const restEndHour = 19;

      // Convert to API TimeSlot format for consistency
      const mockApiTimeSlots: TimeSlot[] = [];

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

      // Convert API slots to our internal format for other calculations
      const timeSlots = mockApiTimeSlots.map((slot) => ({
        startTime: slot.start_time,
        endTime: slot.end_time,
        available: slot.available,
      }));

      setRawTimeSlots(timeSlots);
    },
    [processTimeSlots]
  );

  const fetchTimeSlots = useCallback(
    async (date: Date) => {
      if (!date || !mounted) return;

      setIsLoadingTimeSlots(true);
      setTimeSlotError(null);
      setSelectedTime("");

      try {
        // Format date as YYYY-MM-DD for API
        const formattedDate = format(date, "yyyy-MM-dd");

        // Get unitId from selectedUnitName if available
        let unitId;

        // If we have a selectedUnitName, extract unit ID
        if (selectedUnitName && selectedUnitName !== "all") {
          // TODO: Replace this with actual unit ID lookup
          unitId = 21; // This is a placeholder and should be replaced
        } else if (selectedConsole) {
          // If no specific unit is selected but console is, use console ID
          unitId = selectedConsole.id;
        } else {
          // No unit or console selected yet
          setHourSlots([]);
          setRawTimeSlots([]);
          setIsLoadingTimeSlots(false);
          return;
        }

        try {
          // Fetch available times directly from API
          const apiResponse = await getAvailableTimes(unitId, formattedDate);

          if (apiResponse.status === "success" && apiResponse.data) {
            const apiTimeSlots = apiResponse.data.time_slots || [];

            if (apiTimeSlots.length === 0) {
              generateTimeSlots(date);
              return;
            }

            // For now the API doesn't return business hours, use a default one
            const defaultHours: BusinessHours = {
              open: "10:00",
              close: "23:00",
              rest_time: "18:00 - 19:00",
            };

            setBusinessHours(defaultHours);

            // Process the API time slots
            const processedHours = processTimeSlots(apiTimeSlots, defaultHours);
            setHourSlots(processedHours);

            // Convert API slots to our internal format for other calculations
            const timeSlots = apiTimeSlots.map((slot: TimeSlot) => ({
              startTime: slot.start_time,
              endTime: slot.end_time,
              available: slot.available,
            }));

            setRawTimeSlots(timeSlots);
          } else {
            // Fallback to local generation if API format is invalid
            generateTimeSlots(date);
          }
        } catch (error) {
          // Fallback to local time slot generation on API error
          console.error("API error:", error);
          generateTimeSlots(date);
        }
      } catch (error) {
        // Set error and use fallback
        console.error("Error loading time slots:", error);
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
      setSelectedTime,
    ]
  );

  // Fetch time slots when date or unit selection changes
  useEffect(() => {
    if (mounted && selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [
    mounted,
    selectedDate,
    fetchTimeSlots,
    selectedUnitName,
    selectedConsole,
  ]);

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
      console.log(
        "Date selected:",
        format(date, "yyyy-MM-dd"),
        "| Time:",
        selectedTime,
        "| Duration:",
        duration
      );
    }
  };

  const handleTimeSelect = (time: string) => {
    try {
      // Validate that time is in correct format (HH:MM) including 24:00
      const timeRegex = /^([01]?[0-9]|2[0-3]|24):[0-5][0-9]$/;

      if (time && timeRegex.test(time)) {
        setSelectedTime(time);
        console.log(
          "Date:",
          selectedDate ? format(selectedDate, "yyyy-MM-dd") : "none",
          "| Time selected:",
          time,
          "| Duration:",
          duration
        );
      } else {
        console.error("Invalid time format:", time);
        // Don't update state with invalid format
      }
    } catch (error) {
      console.error("Error selecting time:", error);
    }
  };

  // Add function to get max duration based on selected time
  const getMaxDuration = (
    selectedTime: string | undefined,
    closingHour: number
  ) => {
    if (!selectedTime) return 5; // Default max duration

    const [hoursStr] = selectedTime.split(":");
    const selectedHour = parseInt(hoursStr, 10);

    // Convert 24:00 to 0 for calculation
    const normalizedHour = selectedHour === 24 ? 0 : selectedHour;

    // Calculate hours until closing
    const hoursUntilClosing = closingHour - normalizedHour;

    // Return the minimum between hours until closing and max duration (5)
    return Math.min(hoursUntilClosing, 5);
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

  // Add effect to log complete state when all selections are made
  useEffect(() => {
    if (selectedDate && selectedTime && duration > 0) {
      const calculatedEndTime = endTime ? format(endTime, "HH:mm") : "unknown";
      console.log("BOOKING STATE - Complete selection:", {
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        duration: duration,
        endTime: calculatedEndTime,
        console: selectedConsole?.name || "none",
        unit: selectedUnitName || "none",
      });
    }
  }, [
    selectedDate,
    selectedTime,
    duration,
    endTime,
    selectedConsole,
    selectedUnitName,
  ]);

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
                  {/* Selected date display */}
                  {selectedDate && (
                    <div className="flex items-center justify-between p-3 bg-[#B99733]/5 rounded-lg border border-[#B99733]/20 mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-[#B99733]" />
                        <span className="text-[#B99733] font-medium">
                          Selected Date:
                        </span>
                        <span className="text-[#B99733]">
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="text-[#B99733] hover:bg-[#B99733]/10"
                      >
                        {showCalendar ? "Hide" : "Change"}
                      </Button>
                    </div>
                  )}

                  <Button
                    variant={selectedDate ? "default" : "outline"}
                    className={cn(
                      "w-full flex justify-between items-center border-[#B99733]/20 hover:bg-[#B99733]/10 cursor-pointer",
                      selectedDate &&
                        "bg-[#B99733] text-white hover:bg-[#B99733]/90"
                    )}
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        {selectedDate
                          ? format(selectedDate, "EEEE, MMMM d, yyyy")
                          : "Select date"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showCalendar ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {showCalendar && (
                    <div className="mt-4 border border-[#B99733]/20 rounded-md overflow-hidden">
                      {today && (
                        <Calendar
                          mode="single"
                          selected={selectedDate || undefined}
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
                            head_cell: "text-[#B99733] font-medium",
                            cell: "text-[#B99733]",
                            nav_button: "text-[#B99733] hover:bg-[#B99733]/10",
                            nav_button_previous: "text-[#B99733]",
                            nav_button_next: "text-[#B99733]",
                            button: "hover:bg-[#B99733]/10",
                            caption: "text-[#B99733] font-medium",
                          }}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date Selection - Desktop View */}
              <Card className="shadow-md border border-[#B99733]/20 md:col-span-2 hidden md:block">
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
                  {/* Selected date display */}
                  {selectedDate && (
                    <div className="flex items-center justify-between p-3 bg-[#B99733]/5 rounded-lg border border-[#B99733]/20 mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-[#B99733]" />
                        <span className="text-[#B99733] font-medium">
                          Selected Date:
                        </span>
                        <span className="text-[#B99733]">
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="calendar-container w-full h-full">
                    {today && (
                      <Calendar
                        mode="single"
                        selected={selectedDate || undefined}
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
                          head_cell: "text-[#B99733] font-medium",
                          cell: "text-[#B99733]",
                          nav_button: "text-[#B99733] hover:bg-[#B99733]/10",
                          nav_button_previous: "text-[#B99733]",
                          nav_button_next: "text-[#B99733]",
                          button: "hover:bg-[#B99733]/10",
                          caption: "text-[#B99733] font-medium",
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
                          onClick={() => {
                            if (selectedDate) {
                              fetchTimeSlots(selectedDate);
                            }
                          }}
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
                        <div className="space-y-4">
                          {/* Selected time display */}
                          {selectedTime && (
                            <div className="flex items-center justify-between p-3 bg-[#B99733]/5 rounded-lg border border-[#B99733]/20">
                              <div className="flex items-center gap-2">
                                <Clock3 className="h-5 w-5 text-[#B99733]" />
                                <span className="text-[#B99733] font-medium">
                                  Selected Time:
                                </span>
                                <span className="text-[#B99733]">
                                  {selectedTime}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTime("")}
                                className="text-[#B99733] hover:bg-[#B99733]/10"
                              >
                                Change
                              </Button>
                            </div>
                          )}

                          {/* Time slots grid */}
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-h-[220px] overflow-y-auto pr-2">
                            {getAvailableHourSlots().length > 0 ? (
                              getAvailableHourSlots().map((hourSlot) => (
                                <div
                                  key={`hour-${hourSlot.hour}`}
                                  className="space-y-2"
                                >
                                  {hourSlot.minutes.map(
                                    (minute, minuteIndex) => (
                                      <Button
                                        key={`${hourSlot.hour}-${minute.value}-${minuteIndex}`}
                                        variant={
                                          selectedTime === minute.value
                                            ? "default"
                                            : "outline"
                                        }
                                        disabled={
                                          !minute.available || !selectedDate
                                        }
                                        onClick={() => {
                                          if (minute && minute.value) {
                                            handleTimeSelect(minute.value);
                                          }
                                        }}
                                        className={cn(
                                          "w-full justify-center h-10 sm:h-12 text-xs sm:text-sm transition-all duration-200",
                                          selectedTime === minute.value
                                            ? "bg-[#B99733] text-white hover:bg-[#B99733]/90"
                                            : "border-[#B99733]/20 hover:bg-[#B99733]/10 hover:border-[#B99733]/30 active:bg-[#B99733]/20",
                                          (!minute.available ||
                                            !selectedDate) &&
                                            "opacity-50 cursor-not-allowed hover:bg-transparent hover:border-[#B99733]/20"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Clock3 className="h-4 w-4" />
                                          <span>{minute.label}</span>
                                        </div>
                                      </Button>
                                    )
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                                <Clock className="h-10 w-10 text-gray-300 mb-2" />
                                <p className="text-gray-500">
                                  {!selectedDate
                                    ? "Please select a date first"
                                    : "No available time slots for this selection"}
                                </p>
                              </div>
                            )}
                          </div>
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
                      {!selectedDate
                        ? "Please select a date first"
                        : !selectedTime
                        ? "Please select a time first"
                        : "How long do you need?"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((hours) => {
                        const maxDuration = getMaxDuration(selectedTime, 24); // Using 24 as closing hour
                        const isDisabled = hours > maxDuration;

                        return (
                          <Button
                            key={hours}
                            variant={duration === hours ? "default" : "outline"}
                            className={cn(
                              "py-2 cursor-pointer h-10 sm:h-12 text-xs sm:text-sm",
                              duration === hours
                                ? "bg-[#B99733] hover:bg-[#B99733]/90 text-white"
                                : "border-[#B99733]/20 hover:bg-[#B99733]/10 text-[#B99733]",
                              (!selectedDate || !selectedTime || isDisabled) &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            disabled={
                              !selectedDate || !selectedTime || isDisabled
                            }
                            onClick={() => {
                              setDuration(hours);
                              console.log(
                                "Date:",
                                selectedDate
                                  ? format(selectedDate, "yyyy-MM-dd")
                                  : "none",
                                "| Time:",
                                selectedTime,
                                "| Duration selected:",
                                hours
                              );
                            }}
                          >
                            {hours}h
                            {isDisabled && (
                              <span className="ml-1 text-[10px] text-red-500">
                                (closed)
                              </span>
                            )}
                          </Button>
                        );
                      })}
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

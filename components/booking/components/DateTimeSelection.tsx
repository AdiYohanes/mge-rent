"use client";

import { useState, useEffect, useCallback } from "react";
import { format, isToday, startOfDay } from "date-fns";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define types for time slots and hour slots
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

type TimeOfDay = "all" | "morning" | "afternoon" | "evening";

// Main component
export default function DateTimeSelection() {
  // Using null as initial value but will store a Date object
  const [today, setToday] = useState<Date | null>(null);
  // Using undefined as initial value but will store a Date object
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [hourSlots, setHourSlots] = useState<HourSlot[]>([]);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("all");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // Set today and initial selected date after component mounts
  useEffect(() => {
    const now = new Date();
    // Use a temporary variable to convert to Date type before setting state
    const currentDate = now;
    setToday(currentDate);
    setSelectedDate(currentDate);
    setIsClient(true);
  }, []);

  const fetchTimeSlots = useCallback(
    (date: Date) => {
      if (date && isClient) {
        const isWeekend = [0, 6].includes(date.getDay()); // 0 is Sunday, 6 is Saturday
        const startHour = isWeekend ? 9 : 8; // 9AM for weekends, 8AM for weekdays
        const endHour = isWeekend ? 22 : 21; // 10PM for weekends, 9PM for weekdays

        const hours: HourSlot[] = [];

        for (let hour = startHour; hour < endHour; hour++) {
          const hourFormatted = hour.toString().padStart(2, "0");
          const timeDate = new Date();
          timeDate.setHours(hour, 0);
          const hourLabel = format(timeDate, "h a");

          const minuteSlots: MinuteSlot[] = [];

          for (let minute = 0; minute < 60; minute += 10) {
            const minuteFormatted = minute.toString().padStart(2, "0");
            const value = `${hourFormatted}:${minuteFormatted}`;

            timeDate.setMinutes(minute);
            const label = format(timeDate, "h:mm a");

            minuteSlots.push({
              label,
              value,
              available: true,
            });
          }

          // Check if any minute slots are available for today
          let hourAvailable = true;
          if (isToday(date)) {
            const now = new Date();
            if (hour < now.getHours()) {
              hourAvailable = false;
              minuteSlots.forEach((slot) => {
                slot.available = false;
              });
            } else if (hour === now.getHours()) {
              minuteSlots.forEach((slot) => {
                const minute = parseInt(slot.value.split(":")[1], 10);
                if (minute < now.getMinutes()) {
                  slot.available = false;
                }
              });
              // Check if any minute slots are available in this hour
              hourAvailable = minuteSlots.some((slot) => slot.available);
            }
          }

          hours.push({
            hour,
            label: hourLabel,
            available: hourAvailable,
            minutes: minuteSlots,
          });
        }

        setHourSlots(hours);
        setSelectedTime("");
      }
    },
    [isClient]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, fetchTimeSlots]);

  // Function to disable past dates
  const getDisabledDays = () => {
    if (!today) return undefined;
    return { before: startOfDay(today) };
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const getTimeOfDay = (hour: number): TimeOfDay => {
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    return "evening";
  };

  const filterTimeSlots = (filter: TimeOfDay) => {
    setTimeOfDay(filter);
  };

  const getFilteredHourSlots = () => {
    if (timeOfDay === "all") return hourSlots;

    return hourSlots.filter((slot) => {
      return getTimeOfDay(slot.hour) === timeOfDay;
    });
  };

  if (!isClient) {
    return (
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
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-b from-[#B99733]/5 to-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#B99733]">
            Book Your Appointment
          </h1>
          <p className="text-[#B99733]/80 mt-2">
            Select a date and time that works for you
          </p>
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
              <div className="calendar-container">
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
                  {selectedDate
                    ? `Available times for your booking`
                    : "Please select a date first"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => filterTimeSlots("all")}
                    className={cn(
                      "border-[#B99733]/20 hover:bg-[#B99733]/10 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none",
                      timeOfDay === "all" &&
                        "bg-[#B99733] text-white hover:bg-[#B99733]/90 hover:text-white"
                    )}
                  >
                    All times
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => filterTimeSlots("morning")}
                    className={cn(
                      "border-[#B99733]/20 hover:bg-[#B99733]/10 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none",
                      timeOfDay === "morning" &&
                        "bg-[#B99733] text-white hover:bg-[#B99733]/90 hover:text-white"
                    )}
                  >
                    Morning
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => filterTimeSlots("afternoon")}
                    className={cn(
                      "border-[#B99733]/20 hover:bg-[#B99733]/10 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none",
                      timeOfDay === "afternoon" &&
                        "bg-[#B99733] text-white hover:bg-[#B99733]/90 hover:text-white"
                    )}
                  >
                    Afternoon
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => filterTimeSlots("evening")}
                    className={cn(
                      "border-[#B99733]/20 hover:bg-[#B99733]/10 cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none",
                      timeOfDay === "evening" &&
                        "bg-[#B99733] text-white hover:bg-[#B99733]/90 hover:text-white"
                    )}
                  >
                    Evening
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[220px] overflow-y-auto pr-2">
                  {getFilteredHourSlots().map((hourSlot) => (
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
                              onClick={() => handleTimeSelect(minute.value)}
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
                  ))}
                </div>

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
                        {format(selectedDate, "MMM d")} at{" "}
                        {parseInt(selectedTime.split(":")[0]) > 12
                          ? `${parseInt(selectedTime.split(":")[0]) - 12}:${
                              selectedTime.split(":")[1]
                            } PM`
                          : `${selectedTime} AM`}
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
  );
}

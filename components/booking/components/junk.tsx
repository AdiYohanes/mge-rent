import { useState, useEffect, useCallback } from "react";
import { format, isToday, startOfDay, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeSlot = {
  label: string;
  value: string;
  available: boolean;
};

export default function DateTimeSelection() {
  const [today, setToday] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set today and initial selected date after component mounts
  useEffect(() => {
    const now = new Date();
    setToday(now);
    setSelectedDate(now);
    setIsClient(true);
  }, []);

  const fetchTimeSlots = useCallback(
    (date: Date) => {
      if (date && isClient) {
        const isWeekend = [0, 6].includes(date.getDay()); // 0 is Sunday, 6 is Saturday
        const startHour = isWeekend ? 9 : 8; // 9AM for weekends, 8AM for weekdays
        const endHour = isWeekend ? 22 : 21; // 10PM for weekends, 9PM for weekdays

        const slots: TimeSlot[] = [];

        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 10) {
            const hourFormatted = hour.toString().padStart(2, "0");
            const minuteFormatted = minute.toString().padStart(2, "0");
            const value = `${hourFormatted}:${minuteFormatted}`;

            const date = new Date();
            date.setHours(hour, minute);
            const label = format(date, "h:mm a");

            slots.push({
              label,
              value,
              available: true,
            });
          }
        }

        if (isToday(date)) {
          const now = new Date();
          slots.forEach((slot) => {
            const [hours, minutes] = slot.value.split(":").map(Number);
            if (
              hours < now.getHours() ||
              (hours === now.getHours() && minutes < now.getMinutes())
            ) {
              slot.available = false;
            }
          });
        }

        setTimeSlots(slots);
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
    }
  };

  const handleQuickDateSelect = (daysToAdd: number) => {
    if (today) {
      setSelectedDate(addDays(today, daysToAdd));
    }
  };

  if (!isClient) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
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
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-minecraft text-[#B99733]">
            Book Your Appointment
          </h1>
          <p className="text-slate-600 mt-2">
            Select a date and time for your booking❗️
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-[#B99733]">
                <CalendarIcon className="h-5 w-5" />
                <span>Select Date</span>
              </CardTitle>
              <CardDescription>
                Choose a date for your booking (today and future dates only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                {today && (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={getDisabledDays()}
                    defaultMonth={today}
                    initialFocus
                    fromDate={today}
                    className="rounded-md border mx-auto p-3"
                    classNames={{
                      day_today: "bg-amber-100 text-amber-900 font-medium",
                      day_selected:
                        "bg-amber-500 text-white hover:bg-amber-600 hover:text-white focus:bg-amber-500 focus:text-white",
                      day_disabled:
                        "text-gray-300 opacity-40 hover:bg-transparent",
                      nav_button_previous:
                        "text-amber-500 hover:text-amber-600",
                      nav_button_next: "text-amber-500 hover:text-amber-600",
                      head_cell: "text-amber-800 font-medium",
                      cell: "text-center p-0 relative [&:has([aria-selected])]:bg-amber-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-11 w-11 p-0 font-normal aria-selected:opacity-100",
                    }}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => today && setSelectedDate(today)}
                  className="border-amber-200 hover:bg-amber-50"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDateSelect(1)}
                  className="border-amber-200 hover:bg-amber-50"
                >
                  Tomorrow
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDateSelect(2)}
                  className="border-amber-200 hover:bg-amber-50"
                >
                  {today ? format(addDays(today, 2), "EEE") : ""}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDateSelect(7)}
                  className="border-amber-200 hover:bg-amber-50"
                >
                  Next {today ? format(addDays(today, 7), "EEE") : ""}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Time Slot Selection */}
          <div className="space-y-6">
            <Card className="shadow-md border border-gray-200 transition-opacity duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-[#B99733]">
                  <Clock className="h-5 w-5" />
                  <span>Select Time</span>
                </CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Available times for ${format(
                        selectedDate,
                        "EEEE, MMMM d, yyyy"
                      )}`
                    : "Please select a date first"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate}
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option
                      key={slot.value}
                      value={slot.value}
                      disabled={!slot.available}
                    >
                      {slot.label}
                      {!slot.available ? " (Unavailable)" : ""}
                    </option>
                  ))}
                </select>

                {selectedDate && isToday(selectedDate) && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⓘ Time slots before current time are unavailable
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border border-gray-200 transition-opacity duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#B99733]">
                  Duration
                </CardTitle>
                <CardDescription>How long do you need?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((hours) => (
                    <Button
                      key={hours}
                      variant={duration === hours ? "default" : "outline"}
                      className={cn(
                        "flex-1 py-2",
                        duration === hours
                          ? "bg-amber-500 hover:bg-amber-600"
                          : ""
                      )}
                      onClick={() => setDuration(hours)}
                    >
                      {hours}h
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

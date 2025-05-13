"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaSearch,
  FaChevronDown,
  FaGamepad,
  FaTimes,
  FaArrowRight,
  FaChevronRight,
} from "react-icons/fa";
import { IoFastFood, IoIceCream } from "react-icons/io5";

interface Booking {
  id: string;
  type: "game" | "food" | "dessert";
  title: string;
  date: string;
  time: string;
  price: number;
  status: "active" | "past";
  details?: {
    console?: string;
    roomType?: string;
    duration?: string;
    extraHours?: number;
    extraHoursTime?: string;
    foodItems?: string[];
    ppnPercentage?: number;
    voucher?: string;
    voucherPercentage?: number;
    totalPrice?: number;
    createdAt?: Date;
  };
}

interface BookingSummaryProps {
  booking: Booking;
  onClose: () => void;
}

interface CancelRescheduleModalProps {
  booking: Booking;
  onClose: () => void;
  onReschedule: (booking: Booking) => void;
}

interface RescheduleBookingModalProps {
  booking: Booking;
  onClose: () => void;
}

function RescheduleBookingModal({
  booking,
  onClose,
}: RescheduleBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    "Saturday, 22nd February 2025"
  );
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [duration, setDuration] = useState("3");
  const [reason, setReason] = useState("Sudden urgent");
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isWeekend, setIsWeekend] = useState(true); // Default to weekend since initial date is Saturday
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  // Calculate end time based on selected time and duration
  const calculateEndTime = () => {
    if (!selectedTime) return "";
    const [hours, minutes] = selectedTime.split(":").map(Number);

    let endHours = hours + parseInt(duration);
    const startMinutes = minutes || 0;

    if (endHours >= 24) {
      endHours = endHours - 24;
    }

    return `${selectedTime} - ${endHours}:${
      startMinutes < 10 ? "0" + startMinutes : startMinutes
    }`;
  };

  // Generate week days starting from booking date
  const generateWeekDays = () => {
    const days = [];
    const startDate = new Date("2025-02-21"); // Using the example date from booking

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(currentDate);

      days.push({
        value: formattedDate,
        label: formattedDate,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6, // 0 is Sunday, 6 is Saturday
        date: currentDate,
      });
    }

    return days;
  };

  const weekDays = generateWeekDays();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const selectedDayInfo = weekDays.find((day) => day.value === date);
    setIsWeekend(selectedDayInfo ? selectedDayInfo.isWeekend : false);

    // Reset selected time when switching between weekday and weekend
    setSelectedTime(isWeekend ? "10:00" : "09:00");
    setOpenDropdownIndex(null);
  };

  const handleTimeSlotClick = (index) => {
    if ((isWeekend ? weekendTimeSlots : weekdayTimeSlots)[index].disabled)
      return;

    // Toggle dropdown
    if (openDropdownIndex === index) {
      setOpenDropdownIndex(null);
    } else {
      setOpenDropdownIndex(index);
    }
  };

  const handleIntervalSelect = (hour, minute) => {
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    setSelectedTime(`${hour}:${formattedMinute}`);
    setOpenDropdownIndex(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdownIndex !== null &&
        event.target.closest(".time-dropdown-container") === null
      ) {
        // Close dropdown when clicking outside
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownIndex]);

  const handleReschedule = () => {
    // Show confirmation modal instead of immediately closing
    setShowConfirmation(true);
  };

  const handleConfirmReschedule = () => {
    console.log(
      `Rescheduling booking ${booking.id} to ${selectedDate} at ${selectedTime} for ${duration} hours. Reason: ${reason}`
    );
    setShowConfirmation(false);
    // Navigate to success page
    router.push("/userBookings-success");
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // Generate time slots with AM/PM format for weekdays (Monday-Friday)
  const weekdayTimeSlots = [
    { hour: 9, display: "9 AM" },
    { hour: 10, display: "10 AM" },
    { hour: 11, display: "11 AM" },
    { hour: 12, display: "12 PM" },
    { hour: 13, display: "1 PM" },
    { hour: 14, display: "2 PM", disabled: true },
    { hour: 15, display: "3 PM" },
    { hour: 16, display: "4 PM" },
    { hour: 17, display: "5 PM" },
    { hour: 18, display: "6 PM" },
    { hour: 19, display: "7 PM" },
    { hour: 20, display: "8 PM" },
  ];

  // Generate time slots with AM/PM format for weekends (Saturday-Sunday)
  const weekendTimeSlots = [
    { hour: 8, display: "8 AM" },
    { hour: 9, display: "9 AM" },
    { hour: 10, display: "10 AM" },
    { hour: 11, display: "11 AM" },
    { hour: 12, display: "12 PM" },
    { hour: 13, display: "1 PM" },
    { hour: 14, display: "2 PM", disabled: true },
    { hour: 15, display: "3 PM" },
    { hour: 16, display: "4 PM" },
    { hour: 17, display: "5 PM" },
    { hour: 18, display: "6 PM" },
    { hour: 19, display: "7 PM" },
    { hour: 20, display: "8 PM" },
    { hour: 21, display: "9 PM" },
    { hour: 22, display: "10 PM" },
  ];

  // Minutes intervals for dropdowns
  const minuteIntervals = [0, 10, 20, 30, 40, 50];

  // Get the visually displayed time range
  const displayTimeRange = calculateEndTime();

  // Check if time is selected
  const isTimeSelected = (hour, minute) => {
    const selectedHour = parseInt(selectedTime.split(":")[0]);
    const selectedMinute = parseInt(selectedTime.split(":")[1]);
    return selectedHour === hour && selectedMinute === minute;
  };

  // Format time for display
  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";

    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return `${hour}:${minutes} ${ampm}`;
  };

  // Display hours notice based on weekday/weekend
  const operatingHoursNotice = isWeekend
    ? "Weekend Hours: 8 AM - 10 PM"
    : "Weekday Hours: 9 AM - 8 PM";

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      {showConfirmation ? (
        <div
          className="bg-[#FFFCEB] max-w-md w-full relative shadow-xl rounded-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/images/ask.png"
                  alt="Question Mark"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>

            <h2 className="mb-4 text-xl font-funnel">
              Are you sure you want to
              <br />
              <span className="text-black font-bold">reschedule</span> your
              booking to:
            </h2>

            <p className="mb-6 font-bold">
              {selectedDate}
              <br />
              {selectedTime.replace(":", ".")} -{" "}
              {parseInt(selectedTime.split(":")[0]) + parseInt(duration)}.
              {selectedTime.split(":")[1]}
            </p>

            <button
              className="w-full py-3 bg-[#B99733] text-white font-semibold mb-3"
              onClick={handleConfirmReschedule}
            >
              Reschedule Booking
            </button>

            <button
              className="w-full text-gray-800 font-medium"
              onClick={handleCancelConfirmation}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFCEB] max-w-lg w-full relative shadow-xl rounded-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-minecraft text-[#B99733]">
                Reschedule Booking
              </h2>
              <button
                onClick={onClose}
                className="text-gray-700 hover:text-black"
              >
                <FaTimes />
              </button>
            </div>

            {/* Current and New Date Display */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-center">
                <p className="text-gray-600">{booking.date}</p>
                <p className="font-bold">{booking.time.replace("-", " - ")}</p>
              </div>
              <FaArrowRight className="text-[#B99733] mx-4" />
              <div className="text-center">
                <p className="text-gray-600">{selectedDate}</p>
                <p className="font-bold">
                  {formatTimeDisplay(
                    selectedTime.split(":")[0] +
                      ":" +
                      selectedTime.split(":")[1]
                  )}{" "}
                  -{" "}
                  {formatTimeDisplay(
                    parseInt(selectedTime.split(":")[0]) +
                      parseInt(duration) +
                      ":" +
                      selectedTime.split(":")[1]
                  )}
                </p>
              </div>
            </div>

            {/* Change Booking Day */}
            <div className="mb-6">
              <label className="block mb-2">Change Booking Day</label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 py-2 px-3 appearance-none bg-white pr-8"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label} {day.isWeekend ? "(Weekend)" : "(Weekday)"}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FaChevronDown className="text-xs" />
                </div>
              </div>
              <p className="text-xs text-[#B99733] mt-1">
                {operatingHoursNotice}
              </p>
            </div>

            {/* Start Booking Hour */}
            <div className="mb-4">
              <label className="block mb-2">Start Booking Hour</label>
              <div className="grid grid-cols-3 gap-2">
                {(isWeekend ? weekendTimeSlots : weekdayTimeSlots).map(
                  (slot, index) => (
                    <div
                      key={index}
                      className="relative time-dropdown-container"
                    >
                      <button
                        className={`w-full py-2 px-4 border flex justify-between items-center ${
                          selectedTime.startsWith(`${slot.hour}:`)
                            ? "bg-[#B99733] text-white border-[#B99733]"
                            : slot.disabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          !slot.disabled && handleTimeSlotClick(index)
                        }
                        disabled={slot.disabled}
                      >
                        <div className="flex items-center">
                          <span className="mr-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                          {slot.display}
                        </div>
                        <FaChevronRight className="text-xs" />
                      </button>

                      {/* Dropdown menu for minutes */}
                      {openDropdownIndex === index && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-20 rounded-sm time-dropdown">
                          <div className="grid grid-cols-2 p-1">
                            {minuteIntervals.map((minute) => {
                              const formattedHour = slot.hour;
                              const formattedMinute =
                                minute < 10 ? `0${minute}` : minute;
                              const displayTime = `${formattedHour}:${formattedMinute}`;

                              return (
                                <button
                                  key={minute}
                                  className={`py-2 px-3 text-sm ${
                                    isTimeSelected(slot.hour, minute)
                                      ? "bg-[#B99733] text-white"
                                      : "hover:bg-gray-100"
                                  }`}
                                  onClick={() =>
                                    handleIntervalSelect(slot.hour, minute)
                                  }
                                >
                                  {displayTime}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              <p className="text-sm mt-4 text-gray-600">
                *Default booking duration is{" "}
                <span className="font-bold">1 hour</span>.
              </p>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block mb-2">Duration</label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 py-2 px-3 appearance-none bg-white pr-8"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FaChevronDown className="text-xs" />
                </div>
              </div>
            </div>

            {/* Reason for rescheduling */}
            <div className="mb-6">
              <label className="block mb-2">Reason of rescheduling</label>
              <input
                type="text"
                className="w-full border border-gray-300 py-2 px-3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Reschedule Button */}
            <div className="flex justify-end">
              <button
                onClick={handleReschedule}
                className="px-6 py-2 bg-[#B99733] text-white hover:bg-[#A88722] transition-colors"
              >
                Reschedule Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CancelRescheduleModal({
  booking,
  onClose,
  onReschedule,
}: CancelRescheduleModalProps) {
  const [option, setOption] = useState("Reschedule");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("Sudden urgent");
  const router = useRouter();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContinue = () => {
    if (option === "Reschedule") {
      onReschedule(booking);
    } else {
      // Show cancellation form
      setShowCancelForm(true);
    }
  };

  const handleCancelBooking = () => {
    console.log(`Cancelling booking ${booking.id}. Reason: ${cancelReason}`);
    // In a real app, you would make an API call here to cancel the booking
    onClose();
    // Navigate to cancellation success page
    router.push("/userBookings-cancelled");
  };

  if (showCancelForm) {
    return (
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-xs flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-[#FFFCEB] max-w-md w-full relative shadow-xl rounded-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-minecraft text-[#B99733]">
                Cancel Booking
              </h2>
              <button
                onClick={onClose}
                className="text-gray-700 hover:text-black"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-6">
              <label className="block mb-2">Reason of cancellation</label>
              <input
                type="text"
                className="w-full border border-gray-300 py-2 px-3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <p className="text-sm mb-6 flex items-center">
              <span className="text-[#B99733] mr-2">*</span>
              <span>
                Refund will be processed within{" "}
                <strong>7 business days.</strong>
              </span>
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleCancelBooking}
                className="px-6 py-2 bg-[#B99733] text-white hover:bg-[#A88722] transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#FFFCEB] max-w-md w-full relative shadow-xl rounded-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-minecraft text-[#B99733]">
              Booking Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-700 hover:text-black"
            >
              <FaTimes />
            </button>
          </div>

          <p className="mb-6">Do you want to reschedule/cancel your booking?</p>

          <div className="mb-4">
            <div className="relative">
              <select
                className="w-full border border-gray-300 py-2 px-3 appearance-none bg-white pr-8"
                value={option}
                onChange={(e) => setOption(e.target.value)}
              >
                <option value="Reschedule">Reschedule</option>
                <option value="Cancel">Cancel booking</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <FaChevronDown className="text-xs" />
              </div>
            </div>
          </div>

          <p className="text-sm mb-6">
            *Reschedule can be done 1x with max. 2 hours before your scheduled
            booking time.
          </p>

          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-[#B99733] text-white hover:bg-[#A88722] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingSummary({ booking, onClose }: BookingSummaryProps) {
  if (!booking.details) return null;

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

  const handleBackdropClick = (e) => {
    // Only close if the backdrop itself is clicked, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#FFFCEB] max-w-lg w-full relative font-funnel shadow-xl rounded-sm">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              <span className="text-[#B99733] font-minecraft">
                Booking Summary
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-700 hover:text-black"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-gray-600 mt-1">{booking.date}</p>

          <table className="w-full mt-6 border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 w-1/4">Type</th>
                <th className="text-left py-2 w-2/4">Description</th>
                <th className="text-center py-2 w-1/12">Quantity</th>
                <th className="text-right py-2 w-1/6">Total</th>
              </tr>
            </thead>
            <tbody>
              {booking.details.console && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-bold">Console</td>
                  <td className="py-2">{booking.details.console}</td>
                  <td className="py-2 text-center">1</td>
                  <td className="py-2 text-right">{formatPrice(120000)}</td>
                </tr>
              )}

              {booking.details.roomType && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-bold">Room Type</td>
                  <td className="py-2">{booking.details.roomType}</td>
                  <td className="py-2 text-center">1</td>
                  <td className="py-2 text-right">{formatPrice(5000)}</td>
                </tr>
              )}

              {booking.details.duration && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-bold">Duration</td>
                  <td className="py-2">{booking.details.duration}</td>
                  <td className="py-2 text-center">1</td>
                  <td className="py-2 text-right">FREE!</td>
                </tr>
              )}

              {booking.details.extraHours && booking.details.extraHoursTime && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-bold"></td>
                  <td className="py-2">
                    Extra hour
                    <br />
                    {booking.details.extraHoursTime}
                  </td>
                  <td className="py-2 text-center">
                    {booking.details.extraHours}
                  </td>
                  <td className="py-2 text-right">{formatPrice(10000)}</td>
                </tr>
              )}

              {booking.details.foodItems &&
                booking.details.foodItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 font-bold">
                      {index === 0 ? "Food & Drinks" : ""}
                    </td>
                    <td className="py-2">{item}</td>
                    <td className="py-2 text-center">1</td>
                    <td className="py-2 text-right">
                      {formatPrice(index === 0 ? 10000 : 5000)}
                    </td>
                  </tr>
                ))}

              {booking.details.ppnPercentage && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-bold" colSpan={3}>
                    PPN {booking.details.ppnPercentage}%
                  </td>
                  <td className="py-2 text-right">{formatPrice(10000)}</td>
                </tr>
              )}

              {booking.details.voucher && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 font-bold" colSpan={3}>
                    Voucher {booking.details.voucher}{" "}
                    {booking.details.voucherPercentage}%
                  </td>
                  <td className="py-2 text-right">- {formatPrice(10000)}</td>
                </tr>
              )}

              <tr className="border-b border-gray-200">
                <td className="py-2 font-bold" colSpan={3}>
                  Subtotal
                </td>
                <td className="py-2 text-right font-bold">
                  {formatPrice(booking.details.totalPrice || booking.price)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#B99733] text-white hover:bg-[#A88722] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserBookings() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "room" | "food" | "newest" | "oldest"
  >("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToModify, setBookingToModify] = useState<Booking | null>(null);
  const [bookingToReschedule, setBookingToReschedule] =
    useState<Booking | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/signin");
    }

    // Mock bookings data with details
    const mockBookings: Booking[] = [
      {
        id: "1",
        type: "game",
        title: "PlayStation 4 - VIP Unit B",
        date: "Friday, 21st February 2025",
        time: "10:00-13:00",
        price: 150000,
        status: "active",
        details: {
          console: "Playstation 4",
          roomType: "Regular Unit A (6)",
          duration: "1 hour\n(10.00 -11.00)",
          extraHours: 2,
          extraHoursTime: "(11.00 - 13.00)",
          foodItems: ["Blackpepper Ricebowl", "Air Putih"],
          ppnPercentage: 10,
          voucher: "MGEPERTAMA",
          voucherPercentage: 10,
          totalPrice: 150000,
          createdAt: new Date("2025-02-21T10:00:00"),
        },
      },
      {
        id: "2",
        type: "food",
        title: "Nasi Goreng Kimchi, Salad, Milkshake V.",
        date: "20 April 2025",
        time: "10:00-13:00",
        price: 50000,
        status: "active",
        details: {
          foodItems: ["Nasi Goreng Kimchi", "Salad", "Milkshake V."],
          ppnPercentage: 10,
          totalPrice: 50000,
          createdAt: new Date("2025-04-20T10:00:00"),
        },
      },
      {
        id: "3",
        type: "dessert",
        title: "Ice Cream Vanilla",
        date: "20 April 2025",
        time: "10:00-13:00",
        price: 20000,
        status: "active",
        details: {
          foodItems: ["Ice Cream Vanilla"],
          ppnPercentage: 10,
          totalPrice: 20000,
          createdAt: new Date("2025-04-20T10:00:00"),
        },
      },
      {
        id: "4",
        type: "dessert",
        title: "Ice Cream Vanilla",
        date: "20 April 2025",
        time: "10:00-13:00",
        price: 20000,
        status: "active",
        details: {
          foodItems: ["Ice Cream Vanilla"],
          ppnPercentage: 10,
          totalPrice: 20000,
          createdAt: new Date("2025-04-19T10:00:00"),
        },
      },
      {
        id: "5",
        type: "game",
        title: "PlayStation 5 - VIP Unit A",
        date: "15 April 2025",
        time: "14:00-17:00",
        price: 150000,
        status: "past",
        details: {
          console: "Playstation 5",
          roomType: "VIP Unit A",
          duration: "3 hours\n(14.00 -17.00)",
          ppnPercentage: 10,
          totalPrice: 150000,
          createdAt: new Date("2025-04-15T14:00:00"),
        },
      },
    ];

    setBookings(mockBookings);
  }, [router]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    setBookingToModify(null);
    setBookingToReschedule(null);
  };

  const handleCancelReschedule = (booking: Booking) => {
    setBookingToModify(booking);
  };

  const handleOpenReschedule = (booking: Booking) => {
    setBookingToModify(null);
    setBookingToReschedule(booking);
  };

  const filteredBookings = bookings
    .filter((booking) => {
      // First filter by active/past tab
      const matchesTab = booking.status === activeTab;

      // Then filter by search query
      const matchesSearch = booking.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Then apply the type filter
      let matchesFilter = true;

      switch (filterType) {
        case "room":
          matchesFilter = booking.type === "game";
          break;
        case "food":
          matchesFilter = booking.type === "food" || booking.type === "dessert";
          break;
        case "all":
          matchesFilter = true;
          break;
      }

      return matchesTab && matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort by date if newest or oldest filter is applied
      if (
        filterType === "newest" &&
        a.details?.createdAt &&
        b.details?.createdAt
      ) {
        return b.details.createdAt.getTime() - a.details.createdAt.getTime();
      }
      if (
        filterType === "oldest" &&
        a.details?.createdAt &&
        b.details?.createdAt
      ) {
        return a.details.createdAt.getTime() - b.details.createdAt.getTime();
      }
      return 0;
    });

  const getIconForBookingType = (type: string) => {
    switch (type) {
      case "game":
        return <FaGamepad className="text-[#B99733] text-xl" />;
      case "food":
        return <IoFastFood className="text-[#B99733] text-xl" />;
      case "dessert":
        return <IoIceCream className="text-[#B99733] text-xl" />;
      default:
        return <FaGamepad className="text-[#B99733] text-xl" />;
    }
  };

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-funnel">
      <h1 className="text-5xl font-bold mb-8 text-center">
        <span className="text-black font-minecraft">Booking </span>
        <span className="text-[#B99733] font-minecraft">History</span>
      </h1>

      <div className="text-center mb-10">
        <div className="flex justify-center items-center space-x-4">
          <div className="text-[#B99733] text-4xl">•</div>
          <div className="text-black text-4xl">•</div>
          <div className="text-[#B99733] text-4xl">•</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          className={`py-3 font-bold transition-colors duration-300 ${
            activeTab === "active"
              ? "bg-[#B99733] text-white"
              : "bg-white border border-[#B99733] text-black hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active Booking
        </button>
        <button
          className={`py-3 font-bold transition-colors duration-300 ${
            activeTab === "past"
              ? "bg-[#B99733] text-white"
              : "bg-white border border-[#B99733] text-black hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("past")}
        >
          Past Booking
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full border border-gray-300 py-2 pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="relative ml-2">
          <button
            className="border border-gray-300 bg-white py-2 px-4 flex items-center"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Filter <FaChevronDown className="ml-2" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 shadow-lg z-10 w-48">
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filterType === "all" ? "text-[#B99733]" : "text-black"
                }`}
                onClick={() => {
                  setFilterType("all");
                  setIsFilterOpen(false);
                }}
              >
                All
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filterType === "room" ? "text-[#B99733]" : "text-black"
                }`}
                onClick={() => {
                  setFilterType("room");
                  setIsFilterOpen(false);
                }}
              >
                Room
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filterType === "food" ? "text-[#B99733]" : "text-black"
                }`}
                onClick={() => {
                  setFilterType("food");
                  setIsFilterOpen(false);
                }}
              >
                Food & Drinks
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filterType === "newest" ? "text-[#B99733]" : "text-black"
                }`}
                onClick={() => {
                  setFilterType("newest");
                  setIsFilterOpen(false);
                }}
              >
                Newest
              </button>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filterType === "oldest" ? "text-[#B99733]" : "text-black"
                }`}
                onClick={() => {
                  setFilterType("oldest");
                  setIsFilterOpen(false);
                }}
              >
                Oldest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-10 border border-[#B99733] bg-gray-50">
          <p className="text-lg text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-[#B99733] p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex">
                  <div className="mr-3 mt-1">
                    {getIconForBookingType(booking.type)}
                  </div>
                  <div>
                    <h3 className="font-bold">{booking.title}</h3>
                    <p className="text-gray-500 text-sm">
                      {booking.date}, {booking.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(booking.price)}</p>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => handleViewDetails(booking)}
                  className="px-4 py-1 text-sm border border-[#B99733] text-[#B99733] hover:bg-[#B99733] hover:text-white transition-colors duration-300"
                >
                  View Details
                </button>

                {booking.status === "active" && (
                  <button
                    onClick={() => handleCancelReschedule(booking)}
                    className="px-4 py-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  >
                    Cancel/Reschedule
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingSummary booking={selectedBooking} onClose={handleCloseModal} />
      )}

      {/* Cancel/Reschedule Modal */}
      {bookingToModify && (
        <CancelRescheduleModal
          booking={bookingToModify}
          onClose={handleCloseModal}
          onReschedule={handleOpenReschedule}
        />
      )}

      {/* Reschedule Booking Modal */}
      {bookingToReschedule && (
        <RescheduleBookingModal
          booking={bookingToReschedule}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

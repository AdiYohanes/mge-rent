"use client";

import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "../BookingTable";

// Status badge component
export const StatusBadge = ({ status }: { status: BookingStatus }) => {
  switch (status) {
    case "booking_success":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Booking Success
        </Badge>
      );
    case "booking_ongoing":
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
          Ongoing
        </Badge>
      );
    case "booking_finish":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Finished
        </Badge>
      );
    case "booking_canceled":
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          Canceled
        </Badge>
      );
    case "return":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
          Refunded
        </Badge>
      );
    case "booking_reschedule":
      return (
        <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
          Reschedule
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

// Pagination buttons generator
export const generatePaginationButtons = (
  currentPage: number,
  totalPages: number,
  setCurrentPage: (page: number) => void
) => {
  // Implemented in each component based on the original code
  // This is a placeholder to show the structure
  return [];
};

// Generate years for filter (2023-2025)
export const years = ["2023", "2024", "2025"];

// Generate months for filter
export const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

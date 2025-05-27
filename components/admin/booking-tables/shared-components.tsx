"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  CalendarCheck,
  ArrowLeftRight,
  Ban,
} from "lucide-react";

// Status Booking Types
export type BookingStatus =
  | "success"
  | "cancelled"
  | "refunded"
  | "completed"
  | "rescheduled";

// Array untuk dropdown bulan
export const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Array untuk dropdown tahun (tahun sekarang + 2 tahun sebelumnya + 2 tahun berikutnya)
const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 5 }, (_, i) =>
  (currentYear - 2 + i).toString()
);

// Status Badge Component
export const StatusBadge = ({ status }: { status: BookingStatus }) => {
  switch (status) {
    case "success":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Success
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>
      );
    case "refunded":
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Refunded
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 flex items-center gap-1">
          <CalendarCheck className="h-3 w-3" /> Completed
        </Badge>
      );
    case "rescheduled":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 flex items-center gap-1">
          <ArrowLeftRight className="h-3 w-3" /> Rescheduled
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 flex items-center gap-1">
          <Ban className="h-3 w-3" /> Unknown
        </Badge>
      );
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

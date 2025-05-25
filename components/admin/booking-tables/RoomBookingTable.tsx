"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Clock,
  RefreshCw,
  RotateCcw,
  CalendarCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { BookingTableBaseProps, RoomBooking, formatCurrency } from "./types";
import { bookingData } from "./dummy-data";
import { StatusBadge, months, years } from "./shared-components";
import { BookingStatus } from "../BookingTable";

const RoomBookingTable: React.FC<BookingTableBaseProps> = ({
  filterStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [selectedMonth, setSelectedMonth] = useState<string>("all_months");
  const [selectedYear, setSelectedYear] = useState<string>("all_years");
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] =
    useState<boolean>(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(
    null
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<string>("");
  const [isOTSBookingModalOpen, setIsOTSBookingModalOpen] =
    useState<boolean>(false);

  // Filter data for room bookings only using TypeScript type guard
  const isRoomBooking = (booking: any): booking is RoomBooking => {
    return booking && !booking.eventName; // Simple check to differentiate
  };

  const roomBookings = bookingData.filter(isRoomBooking);

  // Filter data based on search term, status, and date
  const filteredData = roomBookings.filter((booking) => {
    // Filter by search term
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.transactionNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status if filterStatus is provided
    let matchesStatus = true;
    if (filterStatus) {
      if (Array.isArray(filterStatus)) {
        matchesStatus = filterStatus.includes(booking.status);
      } else {
        matchesStatus = booking.status === filterStatus;
      }
    }

    // Filter by month and year if selected
    let matchesDate = true;
    if (selectedYear !== "all_years" && selectedMonth !== "all_months") {
      const bookingDate = new Date(booking.date);
      const bookingMonth = String(bookingDate.getMonth() + 1).padStart(2, "0");
      const bookingYear = String(bookingDate.getFullYear());
      matchesDate =
        bookingMonth === selectedMonth && bookingYear === selectedYear;
    } else if (selectedYear !== "all_years") {
      const bookingDate = new Date(booking.date);
      const bookingYear = String(bookingDate.getFullYear());
      matchesDate = bookingYear === selectedYear;
    } else if (selectedMonth !== "all_months") {
      const bookingDate = new Date(booking.date);
      const bookingMonth = String(bookingDate.getMonth() + 1).padStart(2, "0");
      matchesDate = bookingMonth === selectedMonth;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Reset filters function
  const resetFilters = () => {
    setSelectedMonth("all_months");
    setSelectedYear("all_years");
    setCurrentPage(1);
  };

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "amount") {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    } else {
      const aValue = a[sortField as keyof RoomBooking];
      const bValue = b[sortField as keyof RoomBooking];

      // Type guard to ensure we're comparing strings
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Generate pagination buttons
  const paginationButtons = () => {
    const buttons = [];

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="mr-1"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page buttons
    const maxButtons = 5;
    const startPage = Math.max(
      1,
      Math.min(
        currentPage - Math.floor(maxButtons / 2),
        totalPages - maxButtons + 1
      )
    );
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(1)}
          className="mx-0.5"
        >
          1
        </Button>
      );

      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="mx-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className="mx-0.5"
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="mx-1">
            ...
          </span>
        );
      }

      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          className="mx-0.5"
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="ml-1"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  // Get action buttons based on status
  const getActionButtons = (status: BookingStatus, booking: RoomBooking) => {
    switch (status) {
      case "booking_success":
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsRescheduleModalOpen(true);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reschedule</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case "booking_ongoing":
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Clock className="h-4 w-4 text-amber-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ongoing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case "booking_finish":
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <CalendarCheck className="h-4 w-4 text-green-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Finished</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case "booking_canceled":
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsRefundModalOpen(true);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refund</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case "return":
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <RotateCcw className="h-4 w-4 text-purple-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Return</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case "booking_reschedule":
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-4 w-4 text-indigo-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rescheduled</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>List Booking Room</CardTitle>
            <CardDescription>
              {filterStatus
                ? `Showing ${filterStatus} room bookings`
                : `Manage and view all room bookings`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Show:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                entries
              </span>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Date:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_months">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_years">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedMonth !== "all_months" ||
              selectedYear !== "all_years") && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-8"
              >
                Reset
              </Button>
            )}
          </div>

          {selectedMonth !== "all_months" && selectedYear !== "all_years" && (
            <Badge variant="outline" className="ml-2">
              Filtering: {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </Badge>
          )}

          {/* Add OTS Booking Button */}
          <div className="ml-auto">
            <Button
              className="bg-[#B99733] hover:bg-[#a38429] text-white"
              onClick={() => setIsOTSBookingModalOpen(true)}
            >
              Add OTS Booking
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 w-[150px]"
                  onClick={() => handleSort("transactionNumber")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    No. Transaction
                    {sortField === "transactionNumber" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("customerName")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Customer
                    {sortField === "customerName" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Phone Number
                </TableHead>
                <TableHead className="whitespace-nowrap">Console</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("roomType")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Room Type
                    {sortField === "roomType" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap">Unit</TableHead>
                <TableHead className="whitespace-nowrap">
                  Total Person
                </TableHead>
                <TableHead className="whitespace-nowrap">Start Time</TableHead>
                <TableHead className="whitespace-nowrap">Duration</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Date
                    {sortField === "date" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Total Payment
                    {sortField === "amount" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Payment Method
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((booking, index) => (
                  <TableRow key={booking.id} className="hover:bg-gray-50">
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.transactionNumber}
                    </TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.phoneNumber}</TableCell>
                    <TableCell>{booking.console}</TableCell>
                    <TableCell>{booking.roomType}</TableCell>
                    <TableCell>{booking.unitNumber}</TableCell>
                    <TableCell>{booking.totalPerson}</TableCell>
                    <TableCell>{booking.startTime}</TableCell>
                    <TableCell>{booking.duration}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{formatCurrency(booking.amount)}</TableCell>
                    <TableCell>{booking.paymentMethod}</TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {getActionButtons(booking.status, booking)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-6">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Showing{" "}
            {Math.min(
              filteredData.length,
              (currentPage - 1) * itemsPerPage + 1
            )}
            -{Math.min(filteredData.length, currentPage * itemsPerPage)} of{" "}
            {filteredData.length} entries
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center">{paginationButtons()}</div>
        )}
      </CardFooter>

      {/* Modal dialogs would be implemented here */}
      {/* For brevity, I'm omitting the implementation of the modals */}
    </Card>
  );
};

export default RoomBookingTable;

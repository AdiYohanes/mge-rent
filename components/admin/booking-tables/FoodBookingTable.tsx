"use client";

import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { BookingTableBaseProps, FoodBooking, formatCurrency } from "./types";
import { bookingData } from "./dummy-data";
import { StatusBadge, months, years } from "./shared-components";

const FoodBookingTable: React.FC<BookingTableBaseProps> = ({
  filterStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [selectedMonth, setSelectedMonth] = useState<string>("all_months");
  const [selectedYear, setSelectedYear] = useState<string>("all_years");

  // Type guard for food bookings
  const isFoodBooking = (booking: any): booking is FoodBooking => {
    return booking && booking.foodItems && !booking.eventName; // Simple check to differentiate
  };

  const foodBookings = bookingData.filter(isFoodBooking);

  // Filter data based on search term, status, and date
  const filteredData = foodBookings.filter((booking) => {
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
      const aValue = a[sortField as keyof FoodBooking];
      const bValue = b[sortField as keyof FoodBooking];

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

    // Page buttons with logic similar to the original component
    // ...simplified for brevity

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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Food & Drink Orders</CardTitle>
            <CardDescription>
              {filterStatus
                ? `Showing ${filterStatus} food orders`
                : `Manage and view all food & drink orders`}
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
                placeholder="Search orders..."
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
                  <div className="flex items-center">
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
                  <div className="flex items-center">
                    Name
                    {sortField === "customerName" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Order Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Tanggal Booking
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
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center">
                    Total Pembayaran
                    {sortField === "amount" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status Booking
                    {sortField === "status" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
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
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {booking.foodTypes?.map((type, i) => (
                          <span key={i} className="text-sm">
                            {type}
                          </span>
                        )) ||
                          booking.foodItems?.map((_, i) => (
                            <span key={i} className="text-sm">
                              {i % 2 === 0 ? "Food" : "Drink"}
                            </span>
                          )) || <span className="text-sm">N/A</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {booking.foodItems?.map((item, i) => (
                          <span key={i} className="text-sm">
                            {item}
                          </span>
                        )) || <span className="text-sm">N/A</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {booking.foodItems?.map((_, i) => (
                          <span key={i} className="text-sm">
                            1
                          </span>
                        )) || <span className="text-sm">0</span>}
                      </div>
                    </TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{formatCurrency(booking.amount)}</TableCell>
                    <TableCell>{booking.paymentMethod}</TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6">
                    No food orders found
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
    </Card>
  );
};

export default FoodBookingTable;

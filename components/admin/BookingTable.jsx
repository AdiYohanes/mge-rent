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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Search,
    Eye,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    CalendarIcon,
    FilterIcon,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    RotateCcw,
    CalendarCheck
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Dummy data untuk tabel booking
const bookingData = [
    {
        id: "B001",
        transactionNumber: "TRX-20250310-001",
        customerName: "John Doe",
        phoneNumber: "081234567890",
        roomType: "VVIP",
        consoleUnit: "PlayStation 5",
        unitNumber: "PS5-001",
        totalPerson: 4,
        date: "2025-03-10",
        time: "13:00 - 15:00",
        startTime: "13:00",
        duration: "2 hours",
        status: "booking_success",
        amount: 150000,
        paymentMethod: "BCA Transfer",
        foodItems: ["Mineral Water", "Snack Combo", "Coffee"],
        eventType: "Birthday Party",
        eventName: "John's 25th Birthday",
    },
    {
        id: "B002",
        transactionNumber: "TRX-20250310-002",
        customerName: "Jane Smith",
        phoneNumber: "081298765432",
        roomType: "VIP",
        consoleUnit: "PlayStation 5",
        unitNumber: "PS5-002",
        totalPerson: 2,
        date: "2025-03-10",
        time: "16:00 - 18:00",
        startTime: "16:00",
        duration: "2 hours",
        status: "booking_ongoing",
        amount: 120000,
        paymentMethod: "QRIS",
        foodItems: ["Cola", "Popcorn"],
        eventType: "Gathering",
        eventName: "Team Building",
    },
    {
        id: "B003",
        transactionNumber: "TRX-20250311-001",
        customerName: "Robert Johnson",
        phoneNumber: "081345678901",
        roomType: "Regular",
        consoleUnit: "PlayStation 4",
        unitNumber: "PS4-001",
        totalPerson: 3,
        date: "2025-03-11",
        time: "10:00 - 12:00",
        startTime: "10:00",
        duration: "2 hours",
        status: "booking_finish",
        amount: 80000,
        paymentMethod: "Cash",
        foodItems: ["Tea", "Sandwich"],
        eventType: "Tournament",
        eventName: "FIFA Championship",
    },
    {
        id: "B004",
        transactionNumber: "TRX-20250311-002",
        customerName: "Emily Davis",
        phoneNumber: "081456789012",
        roomType: "VVIP",
        consoleUnit: "PlayStation 5",
        unitNumber: "PS5-003",
        totalPerson: 5,
        date: "2025-03-11",
        time: "14:00 - 16:00",
        startTime: "14:00",
        duration: "2 hours",
        status: "booking_canceled",
        amount: 150000,
        paymentMethod: "BRI Transfer",
        foodItems: ["Juice Pack", "Chips"],
        eventType: "Corporate",
        eventName: "Product Launch",
    },
    {
        id: "B005",
        transactionNumber: "TRX-20250312-001",
        customerName: "Michael Wilson",
        phoneNumber: "081567890123",
        roomType: "VIP",
        consoleUnit: "PlayStation 5",
        unitNumber: "PS5-004",
        totalPerson: 3,
        date: "2025-03-12",
        time: "11:00 - 13:00",
        startTime: "11:00",
        duration: "2 hours",
        status: "return",
        amount: 120000,
        paymentMethod: "Debit Card",
        foodItems: ["Energy Drink", "Burger"],
        eventType: "Birthday Party",
        eventName: "Mike's Birthday",
    },
    {
        id: "B006",
        transactionNumber: "TRX-20250312-002",
        customerName: "Sarah Brown",
        phoneNumber: "081678901234",
        roomType: "Regular",
        consoleUnit: "PlayStation 4",
        unitNumber: "PS4-002",
        totalPerson: 2,
        date: "2025-03-12",
        time: "17:00 - 19:00",
        startTime: "17:00",
        duration: "2 hours",
        status: "booking_reschedule",
        amount: 80000,
        paymentMethod: "QRIS",
        foodItems: ["Iced Tea", "Fries"],
        eventType: "Casual",
        eventName: "Game Night",
    },
    {
        id: "B007",
        transactionNumber: "TRX-20250313-001",
        customerName: "David Miller",
        phoneNumber: "081789012345",
        roomType: "VVIP",
        consoleUnit: "PlayStation 5",
        unitNumber: "PS5-005",
        totalPerson: 4,
        date: "2025-03-13",
        time: "12:00 - 14:00",
        startTime: "12:00",
        duration: "2 hours",
        status: "booking_success",
        amount: 150000,
        paymentMethod: "Credit Card",
        foodItems: ["Coffee", "Cake"],
        eventType: "Corporate",
        eventName: "Team Meeting",
    },
    {
        id: "B008",
        transactionNumber: "TRX-20250313-002",
        customerName: "Lisa Taylor",
        phoneNumber: "081890123456",
        roomType: "Regular",
        consoleUnit: "PlayStation 4",
        unitNumber: "PS4-003",
        totalPerson: 2,
        date: "2025-03-13",
        time: "15:00 - 17:00",
        startTime: "15:00",
        duration: "2 hours",
        status: "booking_ongoing",
        amount: 80000,
        paymentMethod: "QRIS",
        foodItems: ["Soda", "Pizza"],
        eventType: "Tournament",
        eventName: "Racing Championship",
    },
];

export function BookingTable({ filterStatus = null, bookingType = "room" }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    // Generate years for filter (2023-2025)
    const years = ["2023", "2024", "2025"];

    // Generate months for filter
    const months = [
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
        { value: "12", label: "December" }
    ];

    // Filter data berdasarkan search term, status, dan date jika diperlukan
    const filteredData = bookingData.filter(
        (booking) => {
            // Filter berdasarkan search term
            const matchesSearch =
                booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.id.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter berdasarkan status jika filterStatus ada
            const matchesStatus = filterStatus ? booking.status === filterStatus : true;

            // Filter berdasarkan bulan dan tahun jika dipilih
            let matchesDate = true;

            // Only apply date filtering if not set to "all_months" or "all_years"
            if (selectedYear !== "all_years" && selectedMonth !== "all_months") {
                const bookingDate = new Date(booking.date);
                const bookingMonth = String(bookingDate.getMonth() + 1).padStart(2, '0');
                const bookingYear = String(bookingDate.getFullYear());
                matchesDate = bookingMonth === selectedMonth && bookingYear === selectedYear;
            } else if (selectedYear !== "all_years") {
                const bookingDate = new Date(booking.date);
                const bookingYear = String(bookingDate.getFullYear());
                matchesDate = bookingYear === selectedYear;
            } else if (selectedMonth !== "all_months") {
                const bookingDate = new Date(booking.date);
                const bookingMonth = String(bookingDate.getMonth() + 1).padStart(2, '0');
                matchesDate = bookingMonth === selectedMonth;
            }

            return matchesSearch && matchesStatus && matchesDate;
        }
    );

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
            return sortDirection === "asc"
                ? a[sortField].localeCompare(b[sortField])
                : b[sortField].localeCompare(a[sortField]);
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Fungsi untuk menampilkan status dengan warna yang sesuai
    const getStatusBadge = (status) => {
        switch (status) {
            case "booking_success":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Booking Success</Badge>;
            case "booking_ongoing":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Ongoing</Badge>;
            case "booking_finish":
                return <Badge className="bg-green-500 hover:bg-green-600">Finished</Badge>;
            case "booking_canceled":
                return <Badge className="bg-red-500 hover:bg-red-600">Canceled</Badge>;
            case "return":
                return <Badge className="bg-purple-500 hover:bg-purple-600">Return</Badge>;
            case "booking_reschedule":
                return <Badge className="bg-indigo-500 hover:bg-indigo-600">Reschedule</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Format angka ke format rupiah
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
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
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="mr-1"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
        );

        // Page buttons
        const maxButtons = 5;
        const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxButtons / 2), totalPages - maxButtons + 1));
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
                buttons.push(<span key="ellipsis1" className="mx-1">...</span>);
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
                buttons.push(<span key="ellipsis2" className="mx-1">...</span>);
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-1"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        );

        return buttons;
    };

    // Render kolom tabel berdasarkan tipe booking
    const renderTableHeaders = () => {
        const commonHeaders = (
            <>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead
                    className="cursor-pointer hover:bg-gray-50 w-[150px]"
                    onClick={() => handleSort("transactionNumber")}
                >
                    <div className="flex items-center">
                        No. Transaction
                        {sortField === "transactionNumber" && (
                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("customerName")}
                >
                    <div className="flex items-center">
                        Customer
                        {sortField === "customerName" && (
                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                    </div>
                </TableHead>
            </>
        );

        // Kolom spesifik berdasarkan tipe booking
        switch (bookingType) {
            case "food":
                return (
                    <>
                        {commonHeaders}
                        <TableHead>Food & Drink</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("date")}
                        >
                            <div className="flex items-center">
                                Date
                                {sortField === "date" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("status")}
                        >
                            <div className="flex items-center">
                                Status
                                {sortField === "status" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("amount")}
                        >
                            <div className="flex items-center">
                                Amount
                                {sortField === "amount" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </>
                );
            case "event":
                return (
                    <>
                        {commonHeaders}
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("eventType")}
                        >
                            <div className="flex items-center">
                                Event Type
                                {sortField === "eventType" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead>Event Name</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("date")}
                        >
                            <div className="flex items-center">
                                Date
                                {sortField === "date" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("status")}
                        >
                            <div className="flex items-center">
                                Status
                                {sortField === "status" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("amount")}
                        >
                            <div className="flex items-center">
                                Amount
                                {sortField === "amount" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </>
                );
            default: // room
                return (
                    <>
                        <TableHead className="w-[50px]">No</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50 w-[150px]"
                            onClick={() => handleSort("transactionNumber")}
                        >
                            <div className="flex items-center whitespace-nowrap">
                                No. Transaction
                                {sortField === "transactionNumber" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
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
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Phone Number</TableHead>
                        <TableHead className="whitespace-nowrap">Console</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort("roomType")}
                        >
                            <div className="flex items-center whitespace-nowrap">
                                Room Type
                                {sortField === "roomType" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Unit</TableHead>
                        <TableHead className="whitespace-nowrap">Total Person</TableHead>
                        <TableHead className="whitespace-nowrap">Start Time</TableHead>
                        <TableHead className="whitespace-nowrap">Duration</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort("date")}
                        >
                            <div className="flex items-center whitespace-nowrap">
                                Date
                                {sortField === "date" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
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
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => handleSort("status")}
                        >
                            <div className="flex items-center whitespace-nowrap">
                                Status
                                {sortField === "status" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </>
                );
        }
    };

    // Render baris tabel berdasarkan tipe booking
    const renderTableRow = (booking, index) => {
        const commonCells = (
            <>
                <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="font-medium">{booking.transactionNumber}</TableCell>
                <TableCell>{booking.customerName}</TableCell>
            </>
        );

        // Get action buttons based on status
        const getActionButtons = (status) => {
            switch (status) {
                case "booking_success":
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Booking Success</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
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
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
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
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
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
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Canceled</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
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
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
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
                                        <p>Reschedule</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                default:
                    return (
                        <Button variant="outline" size="sm">
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                        </Button>
                    );
            }
        };

        switch (bookingType) {
            case "food":
                return (
                    <>
                        {commonCells}
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                {booking.foodItems.map((item, index) => (
                                    <span key={index} className="text-sm">{item}</span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>{formatCurrency(booking.amount)}</TableCell>
                        <TableCell className="text-right">
                            {getActionButtons(booking.status)}
                        </TableCell>
                    </>
                );
            case "event":
                return (
                    <>
                        {commonCells}
                        <TableCell>{booking.eventType}</TableCell>
                        <TableCell>{booking.eventName}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>{formatCurrency(booking.amount)}</TableCell>
                        <TableCell className="text-right">
                            {getActionButtons(booking.status)}
                        </TableCell>
                    </>
                );
            default: // room
                return (
                    <>
                        <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                        <TableCell className="font-medium">{booking.transactionNumber}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.phoneNumber}</TableCell>
                        <TableCell>{booking.consoleUnit}</TableCell>
                        <TableCell>{booking.roomType}</TableCell>
                        <TableCell>{booking.unitNumber}</TableCell>
                        <TableCell>{booking.totalPerson}</TableCell>
                        <TableCell>{booking.startTime}</TableCell>
                        <TableCell>{booking.duration}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{formatCurrency(booking.amount)}</TableCell>
                        <TableCell>{booking.paymentMethod}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                            {getActionButtons(booking.status)}
                        </TableCell>
                    </>
                );
        }
    };

    // Hitung jumlah kolom untuk empty row
    const getColSpan = () => {
        switch (bookingType) {
            case "food":
                return 9;
            case "event":
                return 9;
            default: // room
                return 15;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>
                            {bookingType === "food" ? "Food & Drink Orders" :
                                bookingType === "event" ? "Event Bookings" : "List Booking Room"}
                        </CardTitle>
                        <CardDescription>
                            {filterStatus
                                ? `Showing ${filterStatus} ${bookingType} bookings`
                                : `Manage and view all ${bookingType} bookings`}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Show:</span>
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
                            <span className="text-sm text-gray-500 whitespace-nowrap">entries</span>
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

                        {(selectedMonth !== "all_months" || selectedYear !== "all_years") && (
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
                            Filtering: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {renderTableHeaders()}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((booking, index) => (
                                    <TableRow key={booking.id} className="hover:bg-gray-50">
                                        {renderTableRow(booking, index)}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={getColSpan()} className="text-center py-6">
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
                        Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
                    </span>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center">
                        {paginationButtons()}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
} 
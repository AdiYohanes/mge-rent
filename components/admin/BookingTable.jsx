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
    CalendarCheck,
    AlertCircle,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
        foodTypes: ["Food", "Drink", "Food"],
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
        foodTypes: ["Food", "Drink"],
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
        foodTypes: ["Food", "Drink"],
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
        foodTypes: ["Food", "Drink"],
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
        foodTypes: ["Food", "Drink"],
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
        foodTypes: ["Food", "Drink"],
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
        foodTypes: ["Food", "Drink"],
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
        foodTypes: ["Food", "Drink"],
        eventType: "Tournament",
        eventName: "Racing Championship",
    },
    {
        id: "E001",
        transactionNumber: "TRX0001239",
        customerName: "Event Customer",
        phoneNumber: "081234567890",
        eventName: "Gathering A",
        eventDescription: "Lorem Ipsum",
        console: "PlayStation 4",
        room: "VIP",
        unit: "Unit A",
        totalPerson: 10,
        date: "12/08/2025",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2",
        status: "booking_ongoing",
    },
    {
        id: "E002",
        transactionNumber: "TRX0001399",
        customerName: "Event Customer",
        phoneNumber: "081234567890",
        eventName: "Gathering B",
        eventDescription: "Lorem Ipsum",
        console: "PlayStation 4",
        room: "VIP",
        unit: "Unit B",
        totalPerson: 15,
        date: "12/08/2025",
        startTime: "10:00",
        endTime: "13:00",
        duration: "3",
        status: "booking_canceled",
    },
    {
        id: "E003",
        transactionNumber: "TRX0001239",
        customerName: "Event Customer",
        phoneNumber: "081234567890",
        eventName: "Gathering C",
        eventDescription: "Lorem Ipsum",
        console: "PlayStation 5",
        room: "Regular",
        unit: "Unit C",
        totalPerson: 20,
        date: "12/08/2025",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2",
        status: "booking_finish",
    },
    {
        id: "E004",
        transactionNumber: "TRX0002369",
        customerName: "Event Customer",
        phoneNumber: "081234567890",
        eventName: "Gathering D",
        eventDescription: "Lorem Ipsum",
        console: "PlayStation 5",
        room: "Regular",
        unit: "Unit C",
        totalPerson: 10,
        date: "12/08/2025",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2",
        status: "booking_ongoing",
    },
    {
        id: "E005",
        transactionNumber: "TRX0006548",
        customerName: "Event Customer",
        phoneNumber: "081234567890",
        eventName: "Gathering E",
        eventDescription: "Lorem Ipsum",
        console: "PlayStation 4",
        room: "VIP",
        unit: "Unit A",
        totalPerson: 15,
        date: "12/08/2025",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2",
        status: "booking_reschedule",
    },
    {
        id: "E006",
        transactionNumber: "TRX0006548",
        customerName: "Event Customer",
        phoneNumber: "081234567890",
        eventName: "Gathering F",
        eventDescription: "Lorem Ipsum",
        console: "PlayStation 5",
        room: "VIP",
        unit: "Unit D",
        totalPerson: 12,
        date: "12/08/2025",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2",
        status: "booking_success",
    },
    {
        id: "E007",
        transactionNumber: "TRX0006479",
        customerName: "Event Customer",
        phoneNumber: "081234567890",
        eventName: "Gathering G",
        eventDescription: "Lorem Ipsum",
        console: "PlayStation 5",
        room: "VIP",
        unit: "Unit A",
        totalPerson: 16,
        date: "12/08/2025",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2",
        status: "booking_success",
    },
];

export function BookingTable({ filterStatus = null, bookingType = "room" }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedMonth, setSelectedMonth] = useState("all_months");
    const [selectedYear, setSelectedYear] = useState("all_years");
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState("");

    // State variables for event booking actions
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editedBooking, setEditedBooking] = useState(null);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        transactionNumber: `TRX${Math.floor(Math.random() * 10000000)}`,
        eventName: "",
        eventDescription: "",
        console: "PlayStation 5",
        room: "VIP",
        unit: "Unit A",
        totalPerson: 10,
        date: "",
        startTime: "",
        endTime: "",
        duration: "",
        status: "booking_success"
    });

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
            let matchesStatus = true;
            if (filterStatus) {
                // If filterStatus is an array, check if booking status is in the array
                if (Array.isArray(filterStatus)) {
                    matchesStatus = filterStatus.includes(booking.status);
                } else {
                    // If filterStatus is a single string, check if booking status matches it
                    matchesStatus = booking.status === filterStatus;
                }
            }

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
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Booking Success</Badge>;
            case "booking_ongoing":
                return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Ongoing</Badge>;
            case "booking_finish":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">Finished</Badge>;
            case "booking_canceled":
                return <Badge className="bg-red-500 hover:bg-red-600 text-white">Canceled</Badge>;
            case "return":
                return <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Refunded</Badge>;
            case "booking_reschedule":
                return <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">Reschedule</Badge>;
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
                        Name
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
                                Name
                                {sortField === "customerName" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
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
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
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
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
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
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                    </>
                );
            case "event":
                return (
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
                        <TableHead>Event Name</TableHead>
                        <TableHead>Event Description</TableHead>
                        <TableHead>Console</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Total Person</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("date")}
                        >
                            <div className="flex items-center">
                                Tanggal Booking
                                {sortField === "date" && (
                                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                )}
                            </div>
                        </TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Duration (Jam)</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("status")}
                        >
                            <div className="flex items-center">
                                Status Booking
                                {sortField === "status" && (
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

    // Get action buttons based on status
    const getActionButtons = (status, booking) => {
        // Special case for event bookings
        if (bookingType === "event") {
            if (status === "booking_canceled") {
                return (
                    <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDeleteBooking(booking)}
                                    >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            } else {
                return (
                    <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEditBooking(booking)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDeleteBooking(booking)}
                                    >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            }
        }

        // For other booking types
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
                                        <XCircle className="h-4 w-4 text-red-500" />
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

    // Render baris tabel berdasarkan tipe booking
    const renderTableRow = (booking, index) => {
        const commonCells = (
            <>
                <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="font-medium">{booking.transactionNumber}</TableCell>
                <TableCell>{booking.customerName}</TableCell>
            </>
        );

        switch (bookingType) {
            case "food":
                return (
                    <>
                        <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                        <TableCell className="font-medium">{booking.transactionNumber}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.phoneNumber}</TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                {booking.foodTypes?.map((type, i) => (
                                    <span key={i} className="text-sm">{type}</span>
                                )) || booking.foodItems.map((_, i) => (
                                    <span key={i} className="text-sm">{i % 2 === 0 ? "Food" : "Drink"}</span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                {booking.foodItems.map((item, i) => (
                                    <span key={i} className="text-sm">{item}</span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                {booking.foodItems.map((_, i) => (
                                    <span key={i} className="text-sm">1</span>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{formatCurrency(booking.amount)}</TableCell>
                        <TableCell>{booking.paymentMethod}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    </>
                );
            case "event":
                return (
                    <>
                        <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                        <TableCell className="font-medium">{booking.transactionNumber}</TableCell>
                        <TableCell>{booking.eventName}</TableCell>
                        <TableCell>{booking.eventDescription}</TableCell>
                        <TableCell>{booking.console}</TableCell>
                        <TableCell>{booking.room}</TableCell>
                        <TableCell>{booking.unit}</TableCell>
                        <TableCell>{booking.totalPerson}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.startTime}</TableCell>
                        <TableCell>{booking.endTime}</TableCell>
                        <TableCell>{booking.duration}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                            {getActionButtons(booking.status, booking)}
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
                            {getActionButtons(booking.status, booking)}
                        </TableCell>
                    </>
                );
        }
    };

    // Hitung jumlah kolom untuk empty row
    const getColSpan = () => {
        switch (bookingType) {
            case "food":
                return 11;
            case "event":
                return 14;
            default: // room
                return 15;
        }
    };

    // Function to handle editing an event booking
    const handleEditBooking = (booking) => {
        setEditedBooking({ ...booking });
        setIsEditModalOpen(true);
    };

    // Function to handle deleting an event booking
    const handleDeleteBooking = (booking) => {
        setSelectedBooking(booking);
        setIsDeleteModalOpen(true);
    };

    // Function to save edited booking
    const saveEditedBooking = () => {
        // In a real app, this would call an API to update the booking
        // For this demo, we'll just simulate a successful update
        setIsEditModalOpen(false);
        setConfirmAction("edit");
        setIsConfirmDialogOpen(true);
    };

    // Function to delete booking
    const deleteBooking = () => {
        // In a real app, this would call an API to delete the booking
        // For this demo, we'll just simulate a successful deletion
        setIsDeleteModalOpen(false);

        // Use toast notification instead of confirmation dialog
        toast.success("Booking deleted successfully!", {
            description: `Booking ID: ${selectedBooking?.id || 'N/A'} has been permanently removed from the system.`,
            duration: 5000,
            icon: <XCircle className="h-5 w-5 text-green-500" />,
            className: "border-l-4 border-green-500 p-3 rounded-md shadow-md",
            style: {
                backgroundColor: "#f0fdf4",
                color: "#166534"
            }
        });
    };

    // Calculate duration based on start and end time
    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return "";

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        let hours = endHour - startHour;
        let minutes = endMinute - startMinute;

        if (minutes < 0) {
            hours -= 1;
            minutes += 60;
        }

        if (hours < 0) {
            hours += 24; // Handle cases where end time is on the next day
        }

        return minutes > 0 ? `${hours}.${minutes}` : `${hours}`;
    };

    // Function to handle adding a new event
    const handleAddEvent = () => {
        // Set default date to today if not provided
        if (!newEvent.date) {
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            setNewEvent({
                ...newEvent,
                date: formattedDate
            });
        }

        setIsAddEventModalOpen(true);
    };

    // Function to save new event
    const saveNewEvent = () => {
        // In a real app, this would call an API to create the booking
        // For this demo, we'll just simulate a successful creation
        setIsAddEventModalOpen(false);

        toast.success("Event booking created successfully!", {
            description: `New event "${newEvent.eventName}" has been added.`,
            duration: 5000,
        });

        // Reset form for next use
        setNewEvent({
            transactionNumber: `TRX${Math.floor(Math.random() * 10000000)}`,
            eventName: "",
            eventDescription: "",
            console: "PlayStation 5",
            room: "VIP",
            unit: "Unit A",
            totalPerson: 10,
            date: "",
            startTime: "",
            endTime: "",
            duration: "",
            status: "booking_success"
        });
    };

    // Function to generate time options with 10-minute intervals
    const generateTimeOptions = (date) => {
        const options = [];
        const isWeekend = date ? new Date(date).getDay() === 0 || new Date(date).getDay() === 6 : false;

        // Weekend: 8am to 8pm
        // Weekday: 7am to 7pm
        const startHour = isWeekend ? 8 : 7;
        const endHour = isWeekend ? 20 : 19;

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 10) {
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                const timeString = `${formattedHour}:${formattedMinute}`;
                options.push(
                    <SelectItem key={timeString} value={timeString}>
                        {timeString}
                    </SelectItem>
                );
            }
        }

        return options;
    };

    // Get current date in YYYY-MM-DD format
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
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
                        {bookingType === "event" && (
                            <Button
                                className="bg-[#B99733] hover:bg-[#a38429]"
                                onClick={handleAddEvent}
                            >
                                + Add Event
                            </Button>
                        )}
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

            {/* Reschedule Modal */}
            <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Reschedule Details</DialogTitle>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="transactionNumber" className="text-sm font-medium block mb-1">
                                        No. Transaction <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="transactionNumber"
                                        value={selectedBooking.transactionNumber}
                                        className="bg-gray-100"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label htmlFor="previousDate" className="text-sm font-medium block mb-1">
                                        Previous Date <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="previousDate"
                                        value={`Monday, ${selectedBooking.date.split('-')[2]} April ${selectedBooking.date.split('-')[0]}`}
                                        className="bg-gray-100"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label htmlFor="newDate" className="text-sm font-medium block mb-1">
                                        New Date <span className="text-red-500">*</span>
                                    </label>
                                    <Select>
                                        <SelectTrigger id="newDate" className="w-full">
                                            <SelectValue placeholder="Add Date" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(() => {
                                                // Generate dates for the next 7 days after the previous date
                                                const dates = [];
                                                const prevDate = new Date(selectedBooking.date);
                                                const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                                                for (let i = 1; i <= 7; i++) {
                                                    const nextDate = new Date(prevDate);
                                                    nextDate.setDate(prevDate.getDate() + i);

                                                    const dayName = dayNames[nextDate.getDay()];
                                                    const day = nextDate.getDate();
                                                    const month = monthNames[nextDate.getMonth()];
                                                    const year = nextDate.getFullYear();

                                                    const formattedDate = `${year}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                    const displayDate = `${dayName}, ${day} ${month} ${year}`;

                                                    dates.push(
                                                        <SelectItem key={formattedDate} value={formattedDate}>
                                                            {displayDate}
                                                        </SelectItem>
                                                    );
                                                }

                                                return dates;
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="previousStartTime" className="text-sm font-medium block mb-1">
                                        Previous Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="previousStartTime"
                                        value={selectedBooking.startTime}
                                        className="bg-gray-100"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label htmlFor="newStartTime" className="text-sm font-medium block mb-1">
                                        New Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <Select>
                                        <SelectTrigger id="newStartTime" className="w-full">
                                            <SelectValue placeholder="Select Start Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="08:00">08:00</SelectItem>
                                            <SelectItem value="09:00">09:00</SelectItem>
                                            <SelectItem value="10:00">10:00</SelectItem>
                                            <SelectItem value="11:00">11:00</SelectItem>
                                            <SelectItem value="12:00">12:00</SelectItem>
                                            <SelectItem value="13:00">13:00</SelectItem>
                                            <SelectItem value="14:00">14:00</SelectItem>
                                            <SelectItem value="15:00">15:00</SelectItem>
                                            <SelectItem value="16:00">16:00</SelectItem>
                                            <SelectItem value="17:00">17:00</SelectItem>
                                            <SelectItem value="18:00">18:00</SelectItem>
                                            <SelectItem value="19:00">19:00</SelectItem>
                                            <SelectItem value="20:00">20:00</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="previousDuration" className="text-sm font-medium block mb-1">
                                        Previous Duration <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="previousDuration"
                                        value={selectedBooking.duration.split(' ')[0]}
                                        className="bg-gray-100"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label htmlFor="newDuration" className="text-sm font-medium block mb-1">
                                        New Duration <span className="text-red-500">*</span>
                                    </label>
                                    <Select>
                                        <SelectTrigger id="newDuration" className="w-full">
                                            <SelectValue placeholder="Select Duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 hour</SelectItem>
                                            <SelectItem value="2">2 hours</SelectItem>
                                            <SelectItem value="3">3 hours</SelectItem>
                                            <SelectItem value="4">4 hours</SelectItem>
                                            <SelectItem value="5">5 hours</SelectItem>
                                            <SelectItem value="6">6 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-2">
                        <Button
                            className="w-full bg-[#B99733] hover:bg-[#a38429]"
                            onClick={() => {
                                setConfirmAction("reschedule");
                                setIsConfirmDialogOpen(true);
                            }}
                        >
                            Reschedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Refund Modal */}
            <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Refund Details</DialogTitle>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="customerName" className="text-sm font-medium block mb-1">
                                        Customer Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="customerName"
                                        defaultValue={selectedBooking.customerName}
                                        placeholder="Customer Name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="totalAmount" className="text-sm font-medium block mb-1">
                                        Total Refund <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="totalAmount"
                                        defaultValue={selectedBooking.amount}
                                        placeholder="Total Refund"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="refundPercentage" className="text-sm font-medium block mb-1">
                                        Refund Percentage <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        defaultValue="100"
                                        onValueChange={(value) => {
                                            const percentage = parseInt(value);
                                            const totalAmount = selectedBooking.amount;
                                            const refundAmount = (totalAmount * percentage) / 100;

                                            const refundElement = document.getElementById('calculatedRefund');
                                            if (refundElement) {
                                                refundElement.value = refundAmount;
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="refundPercentage" className="w-full">
                                            <SelectValue placeholder="Refund Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="100">100%</SelectItem>
                                            <SelectItem value="80">80%</SelectItem>
                                            <SelectItem value="50">50%</SelectItem>
                                            <SelectItem value="30">30%</SelectItem>
                                            <SelectItem value="0">0%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="calculatedRefund" className="text-sm font-medium block mb-1">
                                        Total Refund <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="calculatedRefund"
                                        defaultValue={selectedBooking.amount}
                                        placeholder="Total Refund"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <Input
                                        id="noTax"
                                        value="No Tax"
                                        className="bg-gray-100"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-2">
                        <Button
                            className="w-full bg-[#B99733] hover:bg-[#a38429]"
                            onClick={() => {
                                setConfirmAction("refund");
                                setIsConfirmDialogOpen(true);
                            }}
                        >
                            Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Event Booking Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Event Booking</DialogTitle>
                    </DialogHeader>

                    {editedBooking && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="edit-transactionNumber" className="text-sm font-medium block mb-1">
                                        No. Transaction <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="edit-transactionNumber"
                                        value={editedBooking.transactionNumber}
                                        className="bg-gray-100"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-eventName" className="text-sm font-medium block mb-1">
                                        Event Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="edit-eventName"
                                        value={editedBooking.eventName}
                                        onChange={(e) => setEditedBooking({ ...editedBooking, eventName: e.target.value })}
                                        placeholder="Event Name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-eventDescription" className="text-sm font-medium block mb-1">
                                        Event Description <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="edit-eventDescription"
                                        value={editedBooking.eventDescription}
                                        onChange={(e) => setEditedBooking({ ...editedBooking, eventDescription: e.target.value })}
                                        placeholder="Event Description"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-console" className="text-sm font-medium block mb-1">
                                        Console <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={editedBooking.console}
                                        onValueChange={(value) => setEditedBooking({ ...editedBooking, console: value })}
                                    >
                                        <SelectTrigger id="edit-console" className="w-full">
                                            <SelectValue placeholder="Select Console" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PlayStation 4">PlayStation 4</SelectItem>
                                            <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
                                            <SelectItem value="Xbox One">Xbox One</SelectItem>
                                            <SelectItem value="Xbox Series X">Xbox Series X</SelectItem>
                                            <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="edit-room" className="text-sm font-medium block mb-1">
                                        Room <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={editedBooking.room}
                                        onValueChange={(value) => setEditedBooking({ ...editedBooking, room: value })}
                                    >
                                        <SelectTrigger id="edit-room" className="w-full">
                                            <SelectValue placeholder="Select Room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="VVIP">VVIP</SelectItem>
                                            <SelectItem value="VIP">VIP</SelectItem>
                                            <SelectItem value="Regular">Regular</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="edit-unit" className="text-sm font-medium block mb-1">
                                        Unit <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={editedBooking.unit}
                                        onValueChange={(value) => setEditedBooking({ ...editedBooking, unit: value })}
                                    >
                                        <SelectTrigger id="edit-unit" className="w-full">
                                            <SelectValue placeholder="Select Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unit A">Unit A</SelectItem>
                                            <SelectItem value="Unit B">Unit B</SelectItem>
                                            <SelectItem value="Unit C">Unit C</SelectItem>
                                            <SelectItem value="Unit D">Unit D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="edit-totalPerson" className="text-sm font-medium block mb-1">
                                        Total Person <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="edit-totalPerson"
                                        type="number"
                                        value={editedBooking.totalPerson}
                                        onChange={(e) => setEditedBooking({ ...editedBooking, totalPerson: parseInt(e.target.value) })}
                                        placeholder="Total Person"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-date" className="text-sm font-medium block mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="edit-date"
                                        type="date"
                                        min={getCurrentDate()}
                                        value={editedBooking.date}
                                        onChange={(e) => setEditedBooking({ ...editedBooking, date: e.target.value })}
                                        placeholder="Date (YYYY-MM-DD)"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(editedBooking.date).getDay() === 0 || new Date(editedBooking.date).getDay() === 6
                                            ? "Weekend: Available 8:00 AM - 8:00 PM"
                                            : "Weekday: Available 7:00 AM - 7:00 PM"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-startTime" className="text-sm font-medium block mb-1">
                                            Start Time <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={editedBooking.startTime}
                                            onValueChange={(value) => {
                                                const duration = calculateDuration(value, editedBooking.endTime);
                                                setEditedBooking({
                                                    ...editedBooking,
                                                    startTime: value,
                                                    duration
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="edit-startTime" className="w-full">
                                                <SelectValue placeholder="Select Start Time" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {generateTimeOptions(editedBooking.date)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="edit-endTime" className="text-sm font-medium block mb-1">
                                            End Time <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={editedBooking.endTime}
                                            onValueChange={(value) => {
                                                const duration = calculateDuration(editedBooking.startTime, value);
                                                setEditedBooking({
                                                    ...editedBooking,
                                                    endTime: value,
                                                    duration
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="edit-endTime" className="w-full">
                                                <SelectValue placeholder="Select End Time" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {generateTimeOptions(editedBooking.date)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="edit-duration" className="text-sm font-medium block mb-1">
                                        Duration (Hours) <span className="text-muted-foreground text-xs">(Auto-calculated)</span>
                                    </label>
                                    <Input
                                        id="edit-duration"
                                        value={editedBooking.duration}
                                        className="bg-gray-100"
                                        readOnly
                                        placeholder="Duration will be calculated automatically"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-status" className="text-sm font-medium block mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={editedBooking.status}
                                        onValueChange={(value) => setEditedBooking({ ...editedBooking, status: value })}
                                    >
                                        <SelectTrigger id="edit-status" className="w-full">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="booking_success">Booking Success</SelectItem>
                                            <SelectItem value="booking_ongoing">Ongoing</SelectItem>
                                            <SelectItem value="booking_finish">Finished</SelectItem>
                                            <SelectItem value="booking_canceled">Canceled</SelectItem>
                                            <SelectItem value="booking_reschedule">Reschedule</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#B99733] hover:bg-[#a38429]"
                            onClick={saveEditedBooking}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Event Booking Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px] p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete Confirmation</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                            Are you sure want to delete this event?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            This action cannot be undone. This will permanently delete the booking.
                        </p>
                        <div className="flex w-full gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                onClick={deleteBooking}
                            >
                                Yes, Delete Booking
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Confirmation</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-[#B99733] bg-opacity-20 flex items-center justify-center mb-4">
                            <img src="/images/sure.png" alt="Sure" className="h-16 w-16" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                            {confirmAction === "edit" ? "Booking updated successfully!" :
                                "Are you sure you want to confirm?"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {confirmAction === "edit" ? "The booking has been updated with the new information." :
                                "You won't be able to revert this!"}
                        </p>
                        <div className="flex w-full gap-3">
                            {(confirmAction === "edit") ? (
                                <Button
                                    className="w-full bg-[#B99733] hover:bg-[#a38429]"
                                    onClick={() => setIsConfirmDialogOpen(false)}
                                >
                                    OK
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsConfirmDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-[#B99733] hover:bg-[#a38429]"
                                        onClick={() => {
                                            setIsConfirmDialogOpen(false);
                                            if (confirmAction === "reschedule") {
                                                setIsRescheduleModalOpen(false);
                                                // Process reschedule
                                            } else if (confirmAction === "refund") {
                                                setIsRefundModalOpen(false);
                                                // Process refund
                                            }
                                        }}
                                    >
                                        {confirmAction === "reschedule" ? "Yes, Confirm Booking" : "Yes, Confirm Refund"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Event Modal */}
            <Dialog open={isAddEventModalOpen} onOpenChange={setIsAddEventModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="add-transactionNumber" className="text-sm font-medium block mb-1">
                                    No. Transaction <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="add-transactionNumber"
                                    value={newEvent.transactionNumber}
                                    className="bg-gray-100"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label htmlFor="add-eventName" className="text-sm font-medium block mb-1">
                                    Event Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="add-eventName"
                                    value={newEvent.eventName}
                                    onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                                    placeholder="Event Name"
                                />
                            </div>

                            <div>
                                <label htmlFor="add-eventDescription" className="text-sm font-medium block mb-1">
                                    Event Description <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="add-eventDescription"
                                    value={newEvent.eventDescription}
                                    onChange={(e) => setNewEvent({ ...newEvent, eventDescription: e.target.value })}
                                    placeholder="Event Description"
                                />
                            </div>

                            <div>
                                <label htmlFor="add-console" className="text-sm font-medium block mb-1">
                                    Console <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={newEvent.console}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, console: value })}
                                >
                                    <SelectTrigger id="add-console" className="w-full">
                                        <SelectValue placeholder="Select Console" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PlayStation 4">PlayStation 4</SelectItem>
                                        <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
                                        <SelectItem value="Xbox One">Xbox One</SelectItem>
                                        <SelectItem value="Xbox Series X">Xbox Series X</SelectItem>
                                        <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label htmlFor="add-room" className="text-sm font-medium block mb-1">
                                    Room <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={newEvent.room}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, room: value })}
                                >
                                    <SelectTrigger id="add-room" className="w-full">
                                        <SelectValue placeholder="Select Room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VVIP">VVIP</SelectItem>
                                        <SelectItem value="VIP">VIP</SelectItem>
                                        <SelectItem value="Regular">Regular</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label htmlFor="add-unit" className="text-sm font-medium block mb-1">
                                    Unit <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={newEvent.unit}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, unit: value })}
                                >
                                    <SelectTrigger id="add-unit" className="w-full">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Unit A">Unit A</SelectItem>
                                        <SelectItem value="Unit B">Unit B</SelectItem>
                                        <SelectItem value="Unit C">Unit C</SelectItem>
                                        <SelectItem value="Unit D">Unit D</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label htmlFor="add-totalPerson" className="text-sm font-medium block mb-1">
                                    Total Person <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="add-totalPerson"
                                    type="number"
                                    value={newEvent.totalPerson}
                                    onChange={(e) => setNewEvent({ ...newEvent, totalPerson: parseInt(e.target.value) })}
                                    placeholder="Total Person"
                                />
                            </div>

                            <div>
                                <label htmlFor="add-date" className="text-sm font-medium block mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="add-date"
                                    type="date"
                                    min={getCurrentDate()}
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    placeholder="Date"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(newEvent.date).getDay() === 0 || new Date(newEvent.date).getDay() === 6
                                        ? "Weekend: Available 8:00 AM - 8:00 PM"
                                        : "Weekday: Available 7:00 AM - 7:00 PM"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="add-startTime" className="text-sm font-medium block mb-1">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={newEvent.startTime}
                                        onValueChange={(value) => {
                                            const duration = calculateDuration(value, newEvent.endTime);
                                            setNewEvent({
                                                ...newEvent,
                                                startTime: value,
                                                duration
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="add-startTime" className="w-full">
                                            <SelectValue placeholder="Select Start Time" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {generateTimeOptions(newEvent.date)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="add-endTime" className="text-sm font-medium block mb-1">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={newEvent.endTime}
                                        onValueChange={(value) => {
                                            const duration = calculateDuration(newEvent.startTime, value);
                                            setNewEvent({
                                                ...newEvent,
                                                endTime: value,
                                                duration
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="add-endTime" className="w-full">
                                            <SelectValue placeholder="Select End Time" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {generateTimeOptions(newEvent.date)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="add-duration" className="text-sm font-medium block mb-1">
                                    Duration (Hours) <span className="text-muted-foreground text-xs">(Auto-calculated)</span>
                                </label>
                                <Input
                                    id="add-duration"
                                    value={newEvent.duration}
                                    className="bg-gray-100"
                                    readOnly
                                    placeholder="Duration will be calculated automatically"
                                />
                            </div>

                            <div>
                                <label htmlFor="add-status" className="text-sm font-medium block mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={newEvent.status}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}
                                >
                                    <SelectTrigger id="add-status" className="w-full">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="booking_success">Booking Success</SelectItem>
                                        <SelectItem value="booking_ongoing">Ongoing</SelectItem>
                                        <SelectItem value="booking_finish">Finished</SelectItem>
                                        <SelectItem value="booking_canceled">Canceled</SelectItem>
                                        <SelectItem value="booking_reschedule">Reschedule</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setIsAddEventModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#B99733] hover:bg-[#a38429]"
                            onClick={saveNewEvent}
                            disabled={!newEvent.eventName || !newEvent.date || !newEvent.startTime || !newEvent.endTime}
                        >
                            Add Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 
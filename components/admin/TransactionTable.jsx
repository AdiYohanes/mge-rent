"use client";

import { useState, useEffect } from "react";
import {
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Sample transaction data
const transactionData = [
    {
        id: "1",
        transactionNumber: "TRX001236",
        type: "Room",
        name: "James Reed",
        phoneNumber: "081299387954",
        details: "VIP Playstation 4 Unit A",
        quantity: "1 Unit",
        bookingDate: "12/08/2023",
        totalPayment: "Rp150.000",
        paymentMethod: "QRIS",
        paymentDate: "12/08/2023",
        status: "booking_success",
        totalRefund: "Rp0"
    },
    {
        id: "2",
        transactionNumber: "TRX001236",
        type: "Food & Drink",
        name: "James Reed",
        phoneNumber: "081299387954",
        details: "Burger",
        quantity: "1 pcs",
        bookingDate: "12/08/2023",
        totalPayment: "Rp15.000",
        paymentMethod: "QRIS",
        paymentDate: "12/08/2023",
        status: "booking_success",
        totalRefund: "Rp0"
    },
    {
        id: "3",
        transactionNumber: "TRX001223",
        type: "Room",
        name: "Sean Toto",
        phoneNumber: "081283747950",
        details: "Regular Playstation 5 Unit A",
        quantity: "4 hrs",
        bookingDate: "10/08/2023",
        totalPayment: "Rp200.000",
        paymentMethod: "QRIS",
        paymentDate: "10/08/2023",
        status: "booking_ongoing",
        totalRefund: "Rp0"
    },
    {
        id: "4",
        transactionNumber: "TRX001284",
        type: "Room",
        name: "Asep",
        phoneNumber: "089598874802",
        details: "VVIP Playstation 5 Unit B",
        quantity: "1 Unit",
        bookingDate: "02/08/2023",
        totalPayment: "Rp150.000",
        paymentMethod: "QRIS",
        paymentDate: "03/08/2023",
        status: "booking_finish",
        totalRefund: "Rp50.000"
    },
    {
        id: "5",
        transactionNumber: "TRX001293",
        type: "Food & Drink",
        name: "James Reed",
        phoneNumber: "081299387954",
        details: "Ice Alpukat, Jus Jeruk",
        quantity: "1 pcs, 1 pcs",
        bookingDate: "01/08/2023",
        totalPayment: "Rp30.000",
        paymentMethod: "QRIS",
        paymentDate: "01/08/2023",
        status: "booking_success",
        totalRefund: "Rp0"
    },
    {
        id: "6",
        transactionNumber: "TRX001289",
        type: "Food & Drink",
        name: "James Reed",
        phoneNumber: "081299387954",
        details: "VIP Playstation 4 Unit A",
        quantity: "2 hrs",
        bookingDate: "01/08/2023",
        totalPayment: "Rp100.000",
        paymentMethod: "QRIS",
        paymentDate: "01/08/2023",
        status: "booking_success",
        totalRefund: "Rp100.000"
    },
    {
        id: "7",
        transactionNumber: "TRX001296",
        type: "Room",
        name: "Cungkring",
        phoneNumber: "081299382311",
        details: "VIP Playstation 4 Unit E",
        quantity: "3 hour",
        bookingDate: "31/08/2023",
        totalPayment: "Rp150.000",
        paymentMethod: "QRIS",
        paymentDate: "31/08/2023",
        status: "booking_ongoing",
        totalRefund: "Rp100.000"
    },
    {
        id: "8",
        transactionNumber: "TRX001297",
        type: "Food & Drink",
        name: "James Reed",
        phoneNumber: "081299387954",
        details: "Air Mineral",
        quantity: "1 pcs",
        bookingDate: "30/08/2023",
        totalPayment: "Rp10.000",
        paymentMethod: "QRIS",
        paymentDate: "30/08/2023",
        status: "booking_success",
        totalRefund: "Rp10.000"
    },
];

export function TransactionTable() {
    // State for data filtering and pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [month, setMonth] = useState("3");
    const [year, setYear] = useState("2023");

    // Sort and filter data
    const filteredData = transactionData
        .filter((transaction) => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                transaction.transactionNumber.toLowerCase().includes(searchTermLower) ||
                transaction.name.toLowerCase().includes(searchTermLower) ||
                transaction.type.toLowerCase().includes(searchTermLower) ||
                transaction.phoneNumber.toLowerCase().includes(searchTermLower) ||
                transaction.details.toLowerCase().includes(searchTermLower)
            );
        })
        .sort((a, b) => {
            const fieldA = a[sortField].toString().toLowerCase();
            const fieldB = b[sortField].toString().toLowerCase();

            if (sortDirection === "asc") {
                return fieldA.localeCompare(fieldB);
            } else {
                return fieldB.localeCompare(fieldA);
            }
        });

    // Pagination
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const paginatedData = filteredData.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Handle sorting
    const handleSort = (field) => {
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
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // Previous button
        buttons.push(
            <Button
                key="prev"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
        );

        // Page number buttons
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${currentPage === i ? "bg-amber-500 hover:bg-amber-600" : ""
                        }`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </Button>
            );
        }

        // Next button
        buttons.push(
            <Button
                key="next"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        );

        return buttons;
    };

    const getMonthName = (monthNumber) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[parseInt(monthNumber) - 1];
    };

    // Helper function to render status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'booking_success':
                return <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-300">Booking Success</Badge>;
            case 'booking_ongoing':
                return <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-300">Booking Ongoing</Badge>;
            case 'booking_finish':
                return <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-300">Booking Finish</Badge>;
            case 'booking_canceled':
                return <Badge className="bg-red-100 hover:bg-red-100 text-red-800 border-red-300">Booking Canceled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-white py-4 px-6 border-b">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">List Transaction</h2>

                    <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Show</span>
                            <Select
                                value={String(itemsPerPage)}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={itemsPerPage} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm font-medium">entries</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Select
                                value={month}
                                onValueChange={setMonth}
                            >
                                <SelectTrigger className="h-8 w-[110px]">
                                    <SelectValue placeholder={getMonthName(month)} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            {getMonthName(m)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={year}
                                onValueChange={setYear}
                            >
                                <SelectTrigger className="h-8 w-[80px]">
                                    <SelectValue placeholder={year} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative w-full md:w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 pr-4 h-9"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto" style={{ minWidth: "100%" }}>
                    <Table className="w-auto min-w-full">
                        <TableHeader className="bg-gray-50 whitespace-nowrap">
                            <TableRow>
                                <TableHead className="w-[60px] min-w-[60px]">NO</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100 min-w-[140px]"
                                    onClick={() => handleSort("transactionNumber")}
                                >
                                    <div className="flex items-center">
                                        NO. TRANSAKSI
                                        {sortField === "transactionNumber" && (
                                            <ArrowUpDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100 min-w-[100px]"
                                    onClick={() => handleSort("type")}
                                >
                                    <div className="flex items-center">
                                        TYPE
                                        {sortField === "type" && (
                                            <ArrowUpDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100 min-w-[120px]"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center">
                                        NAME
                                        {sortField === "name" && (
                                            <ArrowUpDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[140px]">PHONE NUMBER</TableHead>
                                <TableHead className="min-w-[150px]">DETAILS</TableHead>
                                <TableHead className="min-w-[100px]">QUANTITY</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100 min-w-[140px]"
                                    onClick={() => handleSort("bookingDate")}
                                >
                                    <div className="flex items-center">
                                        TANGGAL BOOKING
                                        {sortField === "bookingDate" && (
                                            <ArrowUpDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100 min-w-[160px]"
                                    onClick={() => handleSort("totalPayment")}
                                >
                                    <div className="flex items-center">
                                        TOTAL PEMBAYARAN
                                        {sortField === "totalPayment" && (
                                            <ArrowUpDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[160px]">METODE PEMBAYARAN</TableHead>
                                <TableHead className="min-w-[180px]">TANGGAL PEMBAYARAN</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-100 min-w-[140px]"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center">
                                        STATUS
                                        {sortField === "status" && (
                                            <ArrowUpDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[120px]">TOTAL REFUND</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="whitespace-nowrap">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((transaction, index) => (
                                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                                        <TableCell>{firstIndex + index + 1}</TableCell>
                                        <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                        <TableCell>{transaction.name}</TableCell>
                                        <TableCell>{transaction.phoneNumber}</TableCell>
                                        <TableCell>{transaction.details}</TableCell>
                                        <TableCell>{transaction.quantity}</TableCell>
                                        <TableCell>{transaction.bookingDate}</TableCell>
                                        <TableCell>{transaction.totalPayment}</TableCell>
                                        <TableCell>{transaction.paymentMethod}</TableCell>
                                        <TableCell>{transaction.paymentDate}</TableCell>
                                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                        <TableCell>{transaction.totalRefund}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center py-6">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
                    </span>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        {paginationButtons()}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
} 
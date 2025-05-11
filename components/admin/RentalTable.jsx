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
import { Search, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Dummy data untuk tabel rental
const rentalData = [
    {
        id: "R001",
        name: "VVIP Room 1",
        type: "vvip",
        capacity: 8,
        price: 200000,
        status: "available",
        features: ["4K TV", "Premium Sound", "Sofa", "AC", "Private Bathroom"],
        image: "/images/rooms/vvip-1.jpg",
    },
    {
        id: "R002",
        name: "VVIP Room 2",
        type: "vvip",
        capacity: 6,
        price: 180000,
        status: "occupied",
        features: ["4K TV", "Premium Sound", "Sofa", "AC"],
        image: "/images/rooms/vvip-2.jpg",
    },
    {
        id: "R003",
        name: "VIP Room 1",
        type: "vip",
        capacity: 6,
        price: 150000,
        status: "available",
        features: ["HD TV", "Sound System", "Sofa", "AC"],
        image: "/images/rooms/vip-1.jpg",
    },
    {
        id: "R004",
        name: "VIP Room 2",
        type: "vip",
        capacity: 4,
        price: 120000,
        status: "maintenance",
        features: ["HD TV", "Sound System", "Sofa", "AC"],
        image: "/images/rooms/vip-2.jpg",
    },
    {
        id: "R005",
        name: "Regular Room 1",
        type: "regular",
        capacity: 4,
        price: 80000,
        status: "available",
        features: ["TV", "Basic Sound", "Chairs"],
        image: "/images/rooms/regular-1.jpg",
    },
    {
        id: "R006",
        name: "Regular Room 2",
        type: "regular",
        capacity: 4,
        price: 80000,
        status: "occupied",
        features: ["TV", "Basic Sound", "Chairs"],
        image: "/images/rooms/regular-2.jpg",
    },
    {
        id: "R007",
        name: "VVIP Room 3",
        type: "vvip",
        capacity: 10,
        price: 250000,
        status: "available",
        features: ["4K TV", "Premium Sound", "Sofa", "AC", "Private Bathroom", "Mini Bar"],
        image: "/images/rooms/vvip-3.jpg",
    },
    {
        id: "R008",
        name: "VIP Room 3",
        type: "vip",
        capacity: 6,
        price: 150000,
        status: "available",
        features: ["HD TV", "Sound System", "Sofa", "AC"],
        image: "/images/rooms/vip-3.jpg",
    },
];

export function RentalTable({ filterType = null }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Filter data berdasarkan search term dan type jika diperlukan
    const filteredData = rentalData.filter(
        (rental) => {
            // Filter berdasarkan search term
            const matchesSearch =
                rental.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rental.id.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter berdasarkan type jika filterType ada
            const matchesType = filterType ? rental.type === filterType : true;

            return matchesSearch && matchesType;
        }
    );

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (sortField === "price" || sortField === "capacity") {
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

    // Fungsi untuk menampilkan status dengan warna yang sesuai
    const getStatusBadge = (status) => {
        switch (status) {
            case "available":
                return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
            case "occupied":
                return <Badge className="bg-red-500 hover:bg-red-600">Occupied</Badge>;
            case "maintenance":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Maintenance</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Fungsi untuk menampilkan tipe dengan warna yang sesuai
    const getTypeBadge = (type) => {
        switch (type) {
            case "vvip":
                return <Badge className="bg-amber-500 hover:bg-amber-600">VVIP</Badge>;
            case "vip":
                return <Badge className="bg-blue-500 hover:bg-blue-600">VIP</Badge>;
            case "regular":
                return <Badge className="bg-green-500 hover:bg-green-600">Regular</Badge>;
            default:
                return <Badge>{type}</Badge>;
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

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Rental Units</CardTitle>
                        <CardDescription>
                            {filterType
                                ? `Showing ${filterType.toUpperCase()} rental units`
                                : "Manage and view all rental units"}
                        </CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search units..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Unit</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("type")}
                                >
                                    <div className="flex items-center">
                                        Type
                                        {sortField === "type" && (
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("capacity")}
                                >
                                    <div className="flex items-center">
                                        Capacity
                                        {sortField === "capacity" && (
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("price")}
                                >
                                    <div className="flex items-center">
                                        Price
                                        {sortField === "price" && (
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
                                <TableHead>Features</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((rental) => (
                                    <TableRow key={rental.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-16 overflow-hidden rounded-md">
                                                    <Image
                                                        src={rental.image}
                                                        alt={rental.name}
                                                        width={64}
                                                        height={48}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{rental.name}</div>
                                                    <div className="text-xs text-gray-500">{rental.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(rental.type)}</TableCell>
                                        <TableCell>{rental.capacity} persons</TableCell>
                                        <TableCell>{formatCurrency(rental.price)}</TableCell>
                                        <TableCell>{getStatusBadge(rental.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {rental.features.slice(0, 3).map((feature, index) => (
                                                    <Badge key={index} variant="outline" className="bg-gray-100">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                                {rental.features.length > 3 && (
                                                    <Badge variant="outline" className="bg-gray-100">
                                                        +{rental.features.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6">
                                        No rental units found
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
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">per page</span>
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
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
import { Search, Eye, ArrowUpDown, ChevronLeft, ChevronRight, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dummy data untuk tabel user
const userData = [
    {
        id: "U001",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "admin",
        status: "active",
        lastLogin: "2025-03-15 14:30",
        avatar: "/images/avatars/avatar-1.png",
    },
    {
        id: "U002",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "customer",
        status: "active",
        lastLogin: "2025-03-14 10:15",
        avatar: "/images/avatars/avatar-2.png",
    },
    {
        id: "U003",
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        role: "customer",
        status: "inactive",
        lastLogin: "2025-03-10 09:45",
        avatar: "/images/avatars/avatar-3.png",
    },
    {
        id: "U004",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        role: "admin",
        status: "active",
        lastLogin: "2025-03-15 11:20",
        avatar: "/images/avatars/avatar-4.png",
    },
    {
        id: "U005",
        name: "Michael Wilson",
        email: "michael.wilson@example.com",
        role: "customer",
        status: "active",
        lastLogin: "2025-03-13 16:05",
        avatar: "/images/avatars/avatar-5.png",
    },
    {
        id: "U006",
        name: "Sarah Brown",
        email: "sarah.brown@example.com",
        role: "customer",
        status: "suspended",
        lastLogin: "2025-03-08 13:40",
        avatar: "/images/avatars/avatar-6.png",
    },
    {
        id: "U007",
        name: "David Miller",
        email: "david.miller@example.com",
        role: "admin",
        status: "active",
        lastLogin: "2025-03-15 09:10",
        avatar: "/images/avatars/avatar-7.png",
    },
    {
        id: "U008",
        name: "Lisa Taylor",
        email: "lisa.taylor@example.com",
        role: "customer",
        status: "active",
        lastLogin: "2025-03-14 15:30",
        avatar: "/images/avatars/avatar-8.png",
    },
];

export function UserTable({ filterRole = null }) {
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

    // Filter data berdasarkan search term dan role jika diperlukan
    const filteredData = userData.filter(
        (user) => {
            // Filter berdasarkan search term
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter berdasarkan role jika filterRole ada
            const matchesRole = filterRole ? user.role === filterRole : true;

            return matchesSearch && matchesRole;
        }
    );

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;

        if (a[sortField] < b[sortField]) return -1 * direction;
        if (a[sortField] > b[sortField]) return 1 * direction;
        return 0;
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
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
            case "inactive":
                return <Badge className="bg-gray-500 hover:bg-gray-600">Inactive</Badge>;
            case "suspended":
                return <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Fungsi untuk menampilkan role dengan warna yang sesuai
    const getRoleBadge = (role) => {
        switch (role) {
            case "admin":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>;
            case "customer":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Customer</Badge>;
            default:
                return <Badge>{role}</Badge>;
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
                        <CardTitle>User List</CardTitle>
                        <CardDescription>
                            {filterRole
                                ? `Showing ${filterRole} users`
                                : "Manage and view all users"}
                        </CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
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
                                <TableHead>User</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("email")}
                                >
                                    <div className="flex items-center">
                                        Email
                                        {sortField === "email" && (
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("role")}
                                >
                                    <div className="flex items-center">
                                        Role
                                        {sortField === "role" && (
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
                                    onClick={() => handleSort("lastLogin")}
                                >
                                    <div className="flex items-center">
                                        Last Login
                                        {sortField === "lastLogin" && (
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                                        <TableCell>{user.lastLogin}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">
                                                <UserCog className="h-3.5 w-3.5 mr-1.5" />
                                                Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6">
                                        No users found
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
"use client";

import { useState } from 'react';
import { Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Sample promo data
const initialPromos = [
    {
        id: 1,
        code: "MGERENTAL10",
        description: "Potongan 10% untuk pengguna baru",
        nominal: "10%",
        isActive: true
    },
    {
        id: 2,
        code: "RENTALHAPPY40",
        description: "Potongan 40% untuk pengguna loyal",
        nominal: "40%",
        isActive: false
    },
    {
        id: 3,
        code: "RENTALHAPPY80",
        description: "Potongan 80% untuk pengguna loyal",
        nominal: "80%",
        isActive: true
    }
];

export function PromoTable() {
    const [promos, setPromos] = useState(initialPromos);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Add Promo dialog state
    const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
    const [newPromo, setNewPromo] = useState({
        code: "",
        description: "",
        nominal: "",
        isActive: true
    });

    // Helper function to extract number from percentage string
    const extractPercentage = (value) => {
        if (!value || value === "") return "";
        return value.toString().replace(/%/g, '');
    };

    // Filter promos based on search term
    const filteredPromos = promos.filter(promo =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.nominal.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentPromos = filteredPromos.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);

    // Handle toggling promo activation
    const handleToggleActive = (id) => {
        setPromos(promos.map(promo =>
            promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
        ));
    };

    // Handle adding new promo
    const handleAddPromo = () => {
        if (!newPromo.code || !newPromo.description || !newPromo.nominal) {
            return; // Don't add incomplete promos
        }

        const newId = promos.length > 0 ? Math.max(...promos.map(p => p.id)) + 1 : 1;
        setPromos([...promos, { ...newPromo, id: newId }]);
        setNewPromo({ code: "", description: "", nominal: "", isActive: true });
        setIsAddPromoOpen(false);
    };

    // Generate pagination buttons
    const renderPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 7; // Show at most 7 page buttons

        // Previous button
        buttons.push(
            <Button
                key="prev"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-full"
            >
                &lt;
            </Button>
        );

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                buttons.push(
                    <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className={`h-8 w-8 p-0 rounded-full ${currentPage === i ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                    >
                        {i}
                    </Button>
                );
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                buttons.push(
                    <span key={i} className="mx-1">...</span>
                );
            }
        }

        // Next button
        buttons.push(
            <Button
                key="next"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-full"
            >
                &gt;
            </Button>
        );

        return buttons;
    };

    return (
        <Card className="shadow-sm border-gray-200">
            <CardHeader className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">Promo Management</h2>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Show</span>
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
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm">entries</span>
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 h-8 w-full sm:w-[200px]"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <Button
                            className="bg-amber-500 hover:bg-amber-600 h-9"
                            onClick={() => setIsAddPromoOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Promo
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[60px]">NO</TableHead>
                                <TableHead>PROMO CODE</TableHead>
                                <TableHead>DESCRIPTION</TableHead>
                                <TableHead>NOMINAL</TableHead>
                                <TableHead>PROMO ACTIVE</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentPromos.length > 0 ? (
                                currentPromos.map((promo, index) => (
                                    <TableRow key={promo.id}>
                                        <TableCell>{firstIndex + index + 1}</TableCell>
                                        <TableCell className="font-medium">{promo.code}</TableCell>
                                        <TableCell>{promo.description}</TableCell>
                                        <TableCell>{promo.nominal}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={promo.isActive}
                                                onCheckedChange={() => handleToggleActive(promo.id)}
                                                className={promo.isActive ? "bg-amber-500" : ""}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6">
                                        No promos found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                        Showing {filteredPromos.length > 0 ? firstIndex + 1 : 0} to {Math.min(lastIndex, filteredPromos.length)} of {filteredPromos.length} entries
                    </div>

                    <div className="flex gap-1">
                        {renderPaginationButtons()}
                    </div>
                </div>
            </CardContent>

            {/* Add Promo Dialog */}
            <Dialog open={isAddPromoOpen} onOpenChange={setIsAddPromoOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Promo</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="promo-code">
                                Promo Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="promo-code"
                                value={newPromo.code}
                                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                                placeholder="Name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="description"
                                value={newPromo.description}
                                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                                placeholder="Amount"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nominal">
                                Nominal <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="nominal"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={extractPercentage(newPromo.nominal)}
                                    onChange={(e) => setNewPromo({
                                        ...newPromo,
                                        nominal: e.target.value ? `${e.target.value}%` : ""
                                    })}
                                    className="pr-8"
                                    placeholder="0"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-500">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="active">
                                Promo Activation <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={newPromo.isActive ? "active" : "inactive"}
                                onValueChange={(value) => setNewPromo({ ...newPromo, isActive: value === "active" })}
                            >
                                <SelectTrigger id="active" className="w-full">
                                    <SelectValue placeholder="Active" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 w-full md:w-auto"
                            onClick={handleAddPromo}
                        >
                            Add Promo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 
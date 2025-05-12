"use client";

import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Sample categories data
const initialCategories = [
    {
        id: 1,
        name: "Snack",
        type: "Food"
    },
    {
        id: 2,
        name: "Coffee",
        type: "Drink"
    },
    {
        id: 3,
        name: "Ricebowl",
        type: "Food"
    }
];

export function CategoryTable() {
    const [categories, setCategories] = useState(initialCategories);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Add Category dialog state
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
    const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);

    const [newCategory, setNewCategory] = useState({
        name: "",
        type: "Food"
    });

    // Filter categories based on search term
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentCategories = filteredCategories.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    // Handle adding new category
    const handleAddCategory = () => {
        if (!newCategory.name || !newCategory.type) {
            return; // Don't add incomplete categories
        }

        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        setCategories([...categories, { ...newCategory, id: newId }]);
        setNewCategory({ name: "", type: "Food" });
        setIsAddCategoryOpen(false);

        // Show success toast
        toast.success("Category added successfully", {
            description: `New ${newCategory.type} category "${newCategory.name}" has been added.`,
            duration: 3000
        });
    };

    // Handle editing category
    const handleEditCategory = () => {
        if (!currentCategory || !newCategory.name || !newCategory.type) {
            return;
        }

        const updatedCategories = categories.map(category =>
            category.id === currentCategory.id ? { ...category, name: newCategory.name, type: newCategory.type } : category
        );

        setCategories(updatedCategories);
        setCurrentCategory(null);
        setNewCategory({ name: "", type: "Food" });
        setIsEditCategoryOpen(false);

        // Show success toast
        toast.success("Category updated successfully", {
            description: `Category has been updated to "${newCategory.name}" (${newCategory.type}).`,
            duration: 3000
        });
    };

    // Handle deleting category
    const handleDeleteCategory = () => {
        if (!currentCategory) return;

        const updatedCategories = categories.filter(category => category.id !== currentCategory.id);
        setCategories(updatedCategories);
        setCurrentCategory(null);
        setIsDeleteCategoryOpen(false);

        // Show success toast
        toast.success("Category deleted successfully", {
            description: `"${currentCategory.name}" has been removed from categories.`,
            duration: 3000
        });
    };

    // Open edit dialog
    const openEditDialog = (category) => {
        setCurrentCategory(category);
        setNewCategory({ name: category.name, type: category.type });
        setIsEditCategoryOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (category) => {
        setCurrentCategory(category);
        setIsDeleteCategoryOpen(true);
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
                    <h2 className="text-2xl font-bold">List Food & Drink Category</h2>

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
                            onClick={() => setIsAddCategoryOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Category
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
                                <TableHead>CATEGORY</TableHead>
                                <TableHead>TYPE</TableHead>
                                <TableHead className="w-[100px] text-center">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentCategories.length > 0 ? (
                                currentCategories.map((category, index) => (
                                    <TableRow key={category.id}>
                                        <TableCell>{firstIndex + index + 1}</TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.type}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-500 border-amber-500"
                                                    onClick={() => openEditDialog(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 border-red-500"
                                                    onClick={() => openDeleteDialog(category)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6">
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                        Showing {filteredCategories.length > 0 ? firstIndex + 1 : 0} to {Math.min(lastIndex, filteredCategories.length)} of {filteredCategories.length} entries
                    </div>

                    <div className="flex gap-1">
                        {renderPaginationButtons()}
                    </div>
                </div>
            </CardContent>

            {/* Add Category Dialog */}
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category-name">
                                Category Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="category-name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                placeholder="Category name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category-type">
                                Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={newCategory.type}
                                onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
                            >
                                <SelectTrigger id="category-type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Drink">Drink</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 w-full"
                            onClick={handleAddCategory}
                        >
                            Add Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category-name">
                                Category Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-category-name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-category-type">
                                Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={newCategory.type}
                                onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
                            >
                                <SelectTrigger id="edit-category-type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Drink">Drink</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 w-full"
                            onClick={handleEditCategory}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Category Dialog */}
            <Dialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <p>Are you sure you want to delete this category? This action cannot be undone.</p>
                        {currentCategory && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                <p className="font-medium">{currentCategory.name} ({currentCategory.type})</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteCategoryOpen(false)}
                            className="w-full md:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 w-full md:w-auto"
                            onClick={handleDeleteCategory}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 
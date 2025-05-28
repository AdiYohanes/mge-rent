"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FnbCategory,
  FnbCategoryPayload,
  getFnbCategories,
  createFnbCategory,
  updateFnbCategory,
  deleteFnbCategory,
} from "@/api";

interface CategoryTableProps {
  // Any props can be added here
}

export function CategoryTable({}: CategoryTableProps) {
  const [categories, setCategories] = useState<FnbCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add Category dialog state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState<boolean>(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] =
    useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<FnbCategory | null>(
    null
  );

  const [newCategory, setNewCategory] = useState<FnbCategoryPayload>({
    category: "",
    type: "food",
  });

  // Fetch categories from API
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getFnbCategories();
      console.log("API Response:", response);

      if (response && response.data) {
        setCategories(response.data);

        // Set pagination data from meta if available
        if (response.meta) {
          setTotalItems(response.meta.total || response.data.length);
          setTotalPages(response.meta.lastPage || 1);
        } else {
          // If no meta data, use the length of the data array
          setTotalItems(response.data.length);
          setTotalPages(1);
        }
      } else if (Array.isArray(response)) {
        // Handle case where API returns array directly
        setCategories(response);
        setTotalItems(response.length);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load categories";
      setError(errorMessage);
      toast.error("Failed to load categories", {
        description: errorMessage || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load categories on initial render
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Manual refresh function that can be called from buttons
  const refreshData = () => {
    loadCategories();
  };

  // Client-side search function
  const getFilteredCategories = useCallback(() => {
    if (!categories || categories.length === 0) return [];
    if (!searchTerm) return categories;

    return categories.filter(
      (category) =>
        category.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // For now, pagination is client-side since API doesn't support pagination parameters
  const getPagedCategories = useCallback(() => {
    const filteredCategories = getFilteredCategories();
    if (filteredCategories.length === 0) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(
      startIndex + itemsPerPage,
      filteredCategories.length
    );

    // Update total pages based on filtered results
    const calculatedTotalPages = Math.ceil(
      filteredCategories.length / itemsPerPage
    );
    if (calculatedTotalPages !== totalPages) {
      setTotalPages(calculatedTotalPages);
    }

    // Update total items count based on filtered results
    if (filteredCategories.length !== totalItems) {
      setTotalItems(filteredCategories.length);
    }

    return filteredCategories.slice(startIndex, endIndex);
  }, [
    categories,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    getFilteredCategories,
  ]);

  // Handle changes to items per page
  useEffect(() => {
    if (categories.length > 0) {
      const filteredCategories = getFilteredCategories();
      const newTotalPages = Math.ceil(filteredCategories.length / itemsPerPage);
      setTotalPages(newTotalPages);

      // Reset to page 1 if current page would be out of bounds
      if (currentPage > newTotalPages) {
        setCurrentPage(1);
      }
    }
  }, [itemsPerPage, categories, getFilteredCategories, currentPage]);

  // Handle adding new category
  const handleAddCategory = async () => {
    if (!newCategory.category || !newCategory.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      await createFnbCategory(newCategory);

      // Refresh category list after adding
      await loadCategories();

      // Reset form and close dialog
      setNewCategory({ category: "", type: "food" });
      setIsAddCategoryOpen(false);

      // Show success toast
      toast.success("Category added successfully", {
        description: `New ${formatType(newCategory.type)} category "${
          newCategory.category
        }" has been added.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Please try again";
      toast.error("Failed to add category", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle editing category
  const handleEditCategory = async () => {
    if (!currentCategory || !newCategory.category || !newCategory.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      await updateFnbCategory(currentCategory.id.toString(), newCategory);

      // Refresh category list after updating
      await loadCategories();

      // Reset form and close dialog
      setCurrentCategory(null);
      setNewCategory({ category: "", type: "food" });
      setIsEditCategoryOpen(false);

      // Show success toast
      toast.success("Category updated successfully", {
        description: `Category has been updated to "${
          newCategory.category
        }" (${formatType(newCategory.type)}).`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Please try again";
      toast.error("Failed to update category", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting category
  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    setLoading(true);

    try {
      await deleteFnbCategory(currentCategory.id.toString());

      // Refresh category list after deleting
      await loadCategories();

      // Reset state and close dialog
      setCurrentCategory(null);
      setIsDeleteCategoryOpen(false);

      // Show success toast
      toast.success("Category deleted successfully", {
        description: `"${currentCategory.category}" has been removed from categories.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Please try again";
      toast.error("Failed to delete category", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (category: FnbCategory) => {
    setCurrentCategory(category);
    setNewCategory({
      category: category.category,
      type: category.type,
    });
    setIsEditCategoryOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: FnbCategory) => {
    setCurrentCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  // Format type for display (capitalize first letter)
  const formatType = (type: string): string => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];

    // Don't render pagination if there are no pages or only one page
    if (totalPages <= 1) return buttons;

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1 || loading}
        className="h-8 w-8 p-0 rounded-full"
      >
        &lt;
      </Button>
    );

    // Page number buttons with ellipsis for large page counts
    const maxButtons = 5; // Show at most 5 page buttons
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // First page and ellipsis if needed
    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={loading}
          className={`h-8 w-8 p-0 rounded-full ${
            currentPage === 1 ? "bg-amber-500 hover:bg-amber-600" : ""
          }`}
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

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          disabled={loading}
          className={`h-8 w-8 p-0 rounded-full ${
            currentPage === i ? "bg-amber-500 hover:bg-amber-600" : ""
          }`}
        >
          {i}
        </Button>
      );
    }

    // Last page and ellipsis if needed
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
          disabled={loading}
          className={`h-8 w-8 p-0 rounded-full ${
            currentPage === totalPages ? "bg-amber-500 hover:bg-amber-600" : ""
          }`}
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
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || loading}
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
                disabled={loading}
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
                  const value = e.target.value;
                  setSearchTerm(value);
                  // Always reset to page 1 when search changes
                  setCurrentPage(1);
                  console.log(`Searching for: "${value}"`);
                }}
                disabled={loading}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="h-8"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1">Refresh</span>
            </Button>

            <Button
              className="bg-[#B99733] hover:bg-amber-600 h-9"
              onClick={() => setIsAddCategoryOpen(true)}
              disabled={loading}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <span>Loading categories...</span>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-red-500"
                  >
                    <p className="mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={refreshData}>
                      Try Again
                    </Button>
                  </TableCell>
                </TableRow>
              ) : getPagedCategories().length > 0 ? (
                getPagedCategories().map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.category}
                    </TableCell>
                    <TableCell>{formatType(category.type)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-amber-500 border-amber-500"
                          onClick={() => openEditDialog(category)}
                          disabled={loading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 border-red-500"
                          onClick={() => openDeleteDialog(category)}
                          disabled={loading}
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
            {searchTerm ? (
              <span>
                Found {totalItems} {totalItems === 1 ? "entry" : "entries"}{" "}
                matching "{searchTerm}"
              </span>
            ) : (
              <span>
                Showing{" "}
                {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} entries
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex gap-1">{renderPaginationButtons()}</div>
          )}
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
                value={newCategory.category}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, category: e.target.value })
                }
                placeholder="Category name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newCategory.type}
                onValueChange={(value: "food" | "beverage" | "snack") =>
                  setNewCategory({ ...newCategory, type: value })
                }
              >
                <SelectTrigger id="category-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="beverage">Drink</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 w-full"
              onClick={handleAddCategory}
              disabled={loading || !newCategory.category || !newCategory.type}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Category"
              )}
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
                value={newCategory.category}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, category: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category-type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newCategory.type}
                onValueChange={(value: "food" | "beverage" | "snack") =>
                  setNewCategory({ ...newCategory, type: value })
                }
              >
                <SelectTrigger id="edit-category-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="beverage">Drink</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 w-full"
              onClick={handleEditCategory}
              disabled={loading || !newCategory.category || !newCategory.type}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog
        open={isDeleteCategoryOpen}
        onOpenChange={setIsDeleteCategoryOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            {currentCategory && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">
                  {currentCategory.category} ({formatType(currentCategory.type)}
                  )
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteCategoryOpen(false)}
              className="w-full md:w-auto"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600 w-full md:w-auto"
              onClick={handleDeleteCategory}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

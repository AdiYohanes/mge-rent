"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Pencil,
  Trash2,
  Upload,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Console,
  getConsoles,
  deleteConsole,
  addConsole,
  updateConsole,
  ConsolePayload,
} from "@/api";
import axios from "axios";
import { API_BASE_URL } from "@/api/constants";

export function ConsoleTable() {
  // State for data and filtering
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentConsole, setCurrentConsole] = useState<Console | null>(null);
  const [newConsole, setNewConsole] = useState<Partial<Console>>({
    model: "",
    image: "",
    price: "",
    serial_number: "",
  });

  // State for file upload
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Set mounted to true once component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch consoles data from API
  useEffect(() => {
    // Skip API request during server-side rendering or before mounting
    if (!mounted) {
      return;
    }

    const fetchConsoles = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching consoles data...");

        const response = await getConsoles();
        console.log("API response:", response);

        if (response && Array.isArray(response.consoles)) {
          setConsoles(response.consoles);
          setTotalItems(response.total || response.consoles.length);
          setTotalPages(
            response.totalPages ||
              Math.ceil(response.consoles.length / itemsPerPage)
          );
        } else {
          console.error("Invalid API response format:", response);
          throw new Error("API returned an invalid data format");
        }
      } catch (err) {
        console.error("Error fetching consoles:", err);
        setError(
          `Failed to load consoles: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        toast.error("Failed to load consoles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchConsoles();
  }, [mounted, refreshTrigger, itemsPerPage]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  }, []);

  // Handle file selection
  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setNewConsole((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Filter data based on search
  const filteredData = consoles.filter((console) => {
    return console.model.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const paginatedData = filteredData.slice(firstIndex, lastIndex);

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxButtons = 7; // Show 7 pagination buttons as in design
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
        className="rounded-full"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || loading}
      >
        &lt;
      </Button>
    );

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="icon"
          className={
            i === currentPage
              ? "rounded-full bg-amber-500 hover:bg-amber-600"
              : "rounded-full"
          }
          onClick={() => setCurrentPage(i)}
          disabled={loading}
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
        className="rounded-full"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages === 0 || loading}
      >
        &gt;
      </Button>
    );

    return buttons;
  };

  // Handler for CRUD operations
  const handleAddConsole = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditConsole = (console: Console) => {
    setCurrentConsole(console);
    setNewConsole({
      model: console.model,
      image: console.image,
      price: console.price,
      serial_number: console.serial_number,
    });
    setPreviewUrl(console.image || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteConsole = (console: Console) => {
    setCurrentConsole(console);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewConsole({
      model: "",
      image: "",
      price: "",
      serial_number: "",
    });
    setPreviewUrl(null);
  };

  const submitAddConsole = async () => {
    // Validate required fields
    if (!newConsole.model || !newConsole.serial_number || !newConsole.price) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Prepare payload
    const payload: ConsolePayload = {
      model: newConsole.model!,
      serial_number: newConsole.serial_number!,
      price: newConsole.price!,
      image: previewUrl, // This might need to be handled differently for a real file upload
      is_available: true,
      notes: "",
    };

    try {
      setLoading(true);
      const result = await addConsole(payload);
      if (result) {
        toast.success("Console added successfully!");
        setRefreshTrigger((prev) => prev + 1); // Refresh the list
      } else {
        throw new Error("Failed to create console");
      }
    } catch (error) {
      console.error("Error adding console:", error);
      toast.error("Failed to add console. Please try again.");
    } finally {
      setLoading(false);
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const submitEditConsole = async () => {
    if (!currentConsole) return;

    // Validate required fields
    if (!newConsole.model || !newConsole.serial_number || !newConsole.price) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    // Prepare payload - only include fields that the API needs
    const payload: ConsolePayload = {
      model: newConsole.model!,
      serial_number: newConsole.serial_number!,
      price: newConsole.price!,
      image: previewUrl, // This might need to be handled differently for a real file upload
      is_available: currentConsole.is_available,
      notes: newConsole.notes || currentConsole.notes,
    };

    try {
      console.log(`Updating console ID: ${currentConsole.id}`);
      console.log(
        `Endpoint: ${API_BASE_URL}/admin/consoles/${currentConsole.id}`
      );
      console.log(`Payload:`, payload);

      // Try update with console ID
      const result = await updateConsole(currentConsole.id.toString(), payload);

      console.log("Update result:", result);

      // Consider any non-null result as success
      if (result !== null) {
        toast.success("Console updated successfully!");
        // Refresh data to get the latest from the backend
        setRefreshTrigger((prev) => prev + 1);
      } else {
        throw new Error("Failed to update console - received null result");
      }
    } catch (error) {
      console.error("Error updating console:", error);

      // More detailed error handling
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
          },
        });
        toast.error(
          `Update failed: ${error.response?.status} ${error.response?.statusText}`
        );
      } else {
        toast.error(
          `Failed to update console: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setLoading(false);
      setCurrentConsole(null);
      resetForm();
      setIsEditDialogOpen(false);
    }
  };

  const submitDeleteConsole = async () => {
    if (!currentConsole) return;

    setDeleteLoading(true);

    try {
      console.log(`Deleting console with ID: ${currentConsole.id}`);

      // Call API to delete console with the numeric ID converted to string
      const success = await deleteConsole(currentConsole.id.toString());

      if (success) {
        toast.success("Console deleted successfully!");
      } else {
        throw new Error(
          "Failed to delete console. API returned unsuccessful response."
        );
      }
    } catch (error) {
      console.error("Error deleting console:", error);
      toast.error(
        `Failed to delete console: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDeleteLoading(false);
      setCurrentConsole(null);
      setIsDeleteDialogOpen(false);

      // Always refresh data after delete attempt to ensure we're in sync with backend
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3 px-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Label>Show</Label>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Label>entries</Label>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
            <Button
              className="bg-[#B99733] hover:bg-amber-600 flex gap-1 items-center"
              onClick={handleAddConsole}
            >
              <span>Add Console</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <div className="mb-4 p-3 border border-red-500 bg-red-50 rounded text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-md border bg-[#f9f9f7]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f9f9f7] hover:bg-[#f9f9f7]">
                <TableHead className="font-bold text-black">NO</TableHead>
                <TableHead className="font-bold text-black">IMAGE</TableHead>
                <TableHead className="font-bold text-black">MODEL</TableHead>
                <TableHead className="font-bold text-black">PRICE</TableHead>
                <TableHead className="font-bold text-black">STATUS</TableHead>
                <TableHead className="font-bold text-black text-center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                      <span>Loading consoles...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No console found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((console, index) => (
                  <TableRow key={console.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {firstIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-12 relative overflow-hidden rounded-md bg-gray-100">
                        {console.image ? (
                          <Image
                            src={console.image}
                            alt={console.model}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // If image fails to load, use console icon as fallback
                              (e.target as HTMLImageElement).src =
                                "/images/console/ps4.png";
                            }}
                          />
                        ) : (
                          <Image
                            src="/images/console/ps4.png"
                            alt="Console placeholder"
                            fill
                            className="object-contain p-2"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{console.model}</TableCell>
                    <TableCell>{console.price}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          console.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {console.is_available ? "Available" : "Not Available"}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-amber-500 text-amber-500"
                        onClick={() => handleEditConsole(console)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-500 text-red-500"
                        onClick={() => handleDeleteConsole(console)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `Showing ${
                  filteredData.length > 0 ? firstIndex + 1 : 0
                } to ${Math.min(
                  lastIndex,
                  filteredData.length
                )} of ${totalItems} entries`}
          </div>
          <div className="flex gap-1">{generatePaginationButtons()}</div>
        </div>
      </CardContent>

      {/* Add Console Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Console</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="mb-4">
              <Label htmlFor="image" className="block mb-2">
                Image
              </Label>
              <div
                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer bg-[#fffdf5] transition-colors ${
                  isDragging
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {previewUrl ? (
                  <div className="relative h-32 w-32 mb-2">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // If preview fails to load, use console icon as fallback
                        (e.target as HTMLImageElement).src =
                          "/images/console-icon.png";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 mb-2 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-amber-500" />
                  </div>
                )}
                <p className="text-sm text-amber-500 font-medium">
                  Drop files here or click to upload
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="model" className="block mb-2">
                Model <span className="text-red-500">*</span>
              </Label>
              <Input
                id="model"
                placeholder="Model"
                value={newConsole.model || ""}
                onChange={(e) =>
                  setNewConsole({ ...newConsole, model: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="serial_number" className="block mb-2">
                Serial Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serial_number"
                placeholder="Serial Number"
                value={newConsole.serial_number || ""}
                onChange={(e) =>
                  setNewConsole({
                    ...newConsole,
                    serial_number: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="price" className="block mb-2">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="text"
                placeholder="Price"
                value={newConsole.price || ""}
                onChange={(e) =>
                  setNewConsole({
                    ...newConsole,
                    price: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              onClick={submitAddConsole}
              className="bg-amber-500 hover:bg-amber-600 w-full"
              disabled={
                !newConsole.model ||
                !newConsole.serial_number ||
                !newConsole.price
              }
            >
              Add Console
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Console Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Console</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="mb-4">
              <Label htmlFor="image" className="block mb-2">
                Image
              </Label>
              <div
                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer bg-[#fffdf5] transition-colors ${
                  isDragging
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-edit")?.click()}
              >
                {previewUrl ? (
                  <div className="relative h-32 w-32 mb-2">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // If preview fails to load, use console icon as fallback
                        (e.target as HTMLImageElement).src =
                          "/images/console-icon.png";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 mb-2 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-amber-500" />
                  </div>
                )}
                <p className="text-sm text-amber-500 font-medium">
                  Drop files here or click to upload
                </p>
                <input
                  id="file-edit"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-model" className="block mb-2">
                Model <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-model"
                placeholder="Model"
                value={newConsole.model || ""}
                onChange={(e) =>
                  setNewConsole({ ...newConsole, model: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-serial_number" className="block mb-2">
                Serial Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-serial_number"
                placeholder="Serial Number"
                value={newConsole.serial_number || ""}
                onChange={(e) =>
                  setNewConsole({
                    ...newConsole,
                    serial_number: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-price" className="block mb-2">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-price"
                type="text"
                placeholder="Price"
                value={newConsole.price || ""}
                onChange={(e) =>
                  setNewConsole({
                    ...newConsole,
                    price: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              onClick={submitEditConsole}
              className="bg-amber-500 hover:bg-amber-600 w-full"
              disabled={
                !newConsole.model ||
                !newConsole.serial_number ||
                !newConsole.price
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Console Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Console</DialogTitle>
          </DialogHeader>
          {currentConsole && (
            <div className="py-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Model:</span>
                <span className="font-bold">{currentConsole.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">
                  Serial Number:
                </span>
                <span>{currentConsole.serial_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Price:</span>
                <span>{currentConsole.price}</span>
              </div>
            </div>
          )}
          <p className="py-2">
            Are you sure you want to delete this console? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              className="bg-gray-300 hover:bg-gray-400 text-black"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={submitDeleteConsole}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...
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

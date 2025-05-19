"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Upload,
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
  Room,
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  RoomPayload,
} from "@/api";
import axios from "axios";
import { API_BASE_URL } from "@/api/constants";

export function RoomTable() {
  // State for data and filtering
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: "",
    description: "",
    room_type: "regular",
    price: "",
    max_visitors: 4,
    image: null,
  });

  // State for file upload
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Set mounted to true once component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch rooms data from API
  useEffect(() => {
    // Skip API request during server-side rendering or before mounting
    if (!mounted) {
      return;
    }

    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching rooms data...");

        const response = await getRooms();
        console.log("API response:", response);

        if (response && Array.isArray(response.data)) {
          setRooms(response.data);

          // Handle metadata if available, otherwise use local pagination
          if (response.meta) {
            setTotalItems(response.meta.total);
            setTotalPages(response.meta.lastPage);
          } else {
            setTotalItems(response.data.length);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
          }
        } else {
          console.error("Invalid API response format:", response);
          throw new Error("API returned an invalid data format");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);

        // Check for session expiration
        if (
          err instanceof Error &&
          err.message.includes("login sudah berakhir")
        ) {
          toast.error(err.message);
          // Optionally redirect to login page
        } else {
          setError(
            `Failed to load rooms: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
          toast.error("Failed to load rooms. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [mounted, refreshTrigger, itemsPerPage]);

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  // Handle file selection
  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setNewRoom((prev) => ({ ...prev, image: reader.result as string }));
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
  const filteredData = rooms.filter((room) => {
    return (
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
  const handleAddRoom = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setCurrentRoom(room);
    setNewRoom({
      name: room.name,
      description: room.description,
      room_type: room.room_type,
      price: room.price,
      max_visitors: room.max_visitors,
      image: room.image,
    });
    setPreviewUrl(room.image);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRoom = (room: Room) => {
    setCurrentRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewRoom({
      name: "",
      description: "",
      room_type: "regular",
      price: "",
      max_visitors: 4,
      image: null,
    });
    setPreviewUrl(null);
  };

  const submitAddRoom = async () => {
    // Validate required fields
    if (
      !newRoom.name ||
      !newRoom.description ||
      !newRoom.room_type ||
      !newRoom.price ||
      !newRoom.max_visitors
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    // Prepare payload
    const payload: RoomPayload = {
      name: newRoom.name!,
      description: newRoom.description!,
      room_type: newRoom.room_type as "regular" | "vip" | "vvip",
      price: Number(newRoom.price),
      max_visitors: Number(newRoom.max_visitors!),
      is_available: true,
    };

    // Hanya tambahkan image jika ada
    if (previewUrl) {
      payload.image = previewUrl;
    }

    try {
      console.log("Creating room with payload:", payload);

      const result = await addRoom(payload);

      // Ubah pengecekan agar menerima true atau objek Room sebagai sukses
      if (result === true || result !== null) {
        toast.success("Room added successfully!");
        setRefreshTrigger((prev) => prev + 1); // Refresh the list
      } else {
        throw new Error("Failed to create room");
      }
    } catch (error) {
      console.error("Error adding room:", error);

      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        toast.error(
          `Add failed: ${error.response?.status} ${error.response?.statusText}`
        );
      } else {
        toast.error(
          `Failed to add room: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setLoading(false);
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const submitEditRoom = async () => {
    if (!currentRoom) return;

    // Validate required fields
    if (
      !newRoom.name ||
      !newRoom.description ||
      !newRoom.room_type ||
      !newRoom.price ||
      !newRoom.max_visitors
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    // Prepare payload
    const payload: RoomPayload = {
      name: newRoom.name!,
      description: newRoom.description!,
      room_type: newRoom.room_type as "regular" | "vip" | "vvip",
      price: Number(newRoom.price),
      max_visitors: Number(newRoom.max_visitors!),
      is_available: currentRoom.is_available,
    };

    // Hanya tambahkan image jika ada
    if (previewUrl) {
      payload.image = previewUrl;
    }

    try {
      console.log(`Updating room ID: ${currentRoom.id}`);
      console.log(`Endpoint: ${API_BASE_URL}/admin/rooms/${currentRoom.id}`);
      console.log(`Payload:`, payload);

      const result = await updateRoom(currentRoom.id.toString(), payload);

      console.log("Update result:", result);

      // Ubah pengecekan agar menerima true atau objek Room sebagai sukses
      if (result === true || result !== null) {
        toast.success("Room updated successfully!");
        setRefreshTrigger((prev) => prev + 1); // Refresh the list
      } else {
        throw new Error("Failed to update room - received null result");
      }
    } catch (error) {
      console.error("Error updating room:", error);

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
          `Failed to update room: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setLoading(false);
      setCurrentRoom(null);
      resetForm();
      setIsEditDialogOpen(false);
    }
  };

  const submitDeleteRoom = async () => {
    if (!currentRoom) return;

    setDeleteLoading(true);

    try {
      console.log(`Deleting room with ID: ${currentRoom.id}`);

      // Call API to delete room
      const success = await deleteRoom(currentRoom.id.toString());

      if (success) {
        toast.success("Room deleted successfully!");
      } else {
        throw new Error(
          "Failed to delete room. API returned unsuccessful response."
        );
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error(
        `Failed to delete room: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDeleteLoading(false);
      setCurrentRoom(null);
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
              onClick={handleAddRoom}
            >
              <span>Add Room</span>
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
                <TableHead className="font-bold text-black">NAME</TableHead>
                <TableHead className="font-bold text-black">TYPE</TableHead>
                <TableHead className="font-bold text-black">PRICE</TableHead>
                <TableHead className="font-bold text-black">
                  MAX VISITORS
                </TableHead>
                <TableHead className="font-bold text-black">
                  DESCRIPTION
                </TableHead>
                <TableHead className="font-bold text-black">STATUS</TableHead>
                <TableHead className="font-bold text-black text-center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                      <span>Loading rooms...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No room found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((room, index) => (
                  <TableRow key={room.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {firstIndex + index + 1}
                    </TableCell>
                    <TableCell>{room.name}</TableCell>
                    <TableCell className="capitalize">
                      {room.room_type}
                    </TableCell>
                    <TableCell>{room.price}</TableCell>
                    <TableCell>{room.max_visitors}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {room.description}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          room.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {room.is_available ? "Available" : "Not Available"}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-amber-500 text-amber-500"
                        onClick={() => handleEditRoom(room)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-500 text-red-500"
                        onClick={() => handleDeleteRoom(room)}
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

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Room</DialogTitle>
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
                        // If preview fails to load, use fallback
                        (e.target as HTMLImageElement).src =
                          "/images/room-icon.png";
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
              <Label htmlFor="name" className="block mb-2">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Room Name"
                value={newRoom.name || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="room_type" className="block mb-2">
                Room Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newRoom.room_type || "regular"}
                onValueChange={(value) =>
                  setNewRoom({
                    ...newRoom,
                    room_type: value as "regular" | "vip" | "vvip",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="vvip">VVIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="price" className="block mb-2">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                placeholder="Price"
                value={newRoom.price || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, price: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="max_visitors" className="block mb-2">
                Max Visitors <span className="text-red-500">*</span>
              </Label>
              <Input
                id="max_visitors"
                type="number"
                placeholder="Maximum Visitors"
                value={newRoom.max_visitors || ""}
                onChange={(e) =>
                  setNewRoom({
                    ...newRoom,
                    max_visitors: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="description" className="block mb-2">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                placeholder="Description"
                value={newRoom.description || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              onClick={submitAddRoom}
              className="bg-amber-500 hover:bg-amber-600 w-full"
              disabled={
                !newRoom.name ||
                !newRoom.description ||
                !newRoom.room_type ||
                !newRoom.price ||
                !newRoom.max_visitors
              }
            >
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="mb-4">
              <Label htmlFor="image-edit" className="block mb-2">
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
                        // If preview fails to load, use fallback
                        (e.target as HTMLImageElement).src =
                          "/images/room-icon.png";
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
              <Label htmlFor="edit-name" className="block mb-2">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Room Name"
                value={newRoom.name || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-room_type" className="block mb-2">
                Room Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newRoom.room_type || "regular"}
                onValueChange={(value) =>
                  setNewRoom({
                    ...newRoom,
                    room_type: value as "regular" | "vip" | "vvip",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="vvip">VVIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-price" className="block mb-2">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-price"
                placeholder="Price"
                value={newRoom.price || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, price: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-max_visitors" className="block mb-2">
                Max Visitors <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-max_visitors"
                type="number"
                placeholder="Maximum Visitors"
                value={newRoom.max_visitors || ""}
                onChange={(e) =>
                  setNewRoom({
                    ...newRoom,
                    max_visitors: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-description" className="block mb-2">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-description"
                placeholder="Description"
                value={newRoom.description || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              onClick={submitEditRoom}
              className="bg-amber-500 hover:bg-amber-600 w-full"
              disabled={
                !newRoom.name ||
                !newRoom.description ||
                !newRoom.room_type ||
                !newRoom.price ||
                !newRoom.max_visitors
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
          </DialogHeader>
          {currentRoom && (
            <div className="py-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Room Name:</span>
                <span className="font-bold">{currentRoom.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Room Type:</span>
                <span className="capitalize">{currentRoom.room_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Price:</span>
                <span>{currentRoom.price}</span>
              </div>
            </div>
          )}
          <p className="py-2">
            Are you sure you want to delete this room? This action cannot be
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
              onClick={submitDeleteRoom}
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

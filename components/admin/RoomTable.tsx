"use client";

import { useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
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

interface Room {
  id: string;
  name: string;
  description: string;
}

// Sample data
const roomData: Room[] = [
  {
    id: "1",
    name: "Regular",
    description:
      "Nec ullamcorper sit amet risus nullam eget. Gravida in fermentum et sollicitudin ac orci phasellus.",
  },
  {
    id: "2",
    name: "VIP",
    description:
      "Orci sagittis eu volutpat odio facilisis mauris. At in tellus integer feugiat scelerisque. Mi sit am",
  },
  {
    id: "3",
    name: "VVIP",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore",
  },
];

export function RoomTable() {
  // State for data and filtering
  const [rooms, setRooms] = useState<Room[]>(roomData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: "",
    description: "",
  });

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
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

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
        disabled={currentPage === 1}
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
        disabled={currentPage === totalPages}
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
    });
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
    });
  };

  const submitAddRoom = () => {
    const roomToAdd: Room = {
      id: String(rooms.length + 1),
      name: newRoom.name || "",
      description: newRoom.description || "",
    };
    setRooms([...rooms, roomToAdd]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const submitEditRoom = () => {
    if (!currentRoom) return;
    const updatedRooms = rooms.map((room) => {
      if (room.id === currentRoom.id) {
        return {
          ...room,
          name: newRoom.name || room.name,
          description: newRoom.description || room.description,
        };
      }
      return room;
    });
    setRooms(updatedRooms);
    setCurrentRoom(null);
    resetForm();
    setIsEditDialogOpen(false);
  };

  const submitDeleteRoom = () => {
    if (!currentRoom) return;
    const updatedRooms = rooms.filter((room) => room.id !== currentRoom.id);
    setRooms(updatedRooms);
    setCurrentRoom(null);
    setIsDeleteDialogOpen(false);
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
              className="bg-[#B99733] hover:bg-amber-600 flex gap-1 items-center"
              onClick={handleAddRoom}
            >
              <span>Add Room</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="rounded-md border bg-[#f9f9f7]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f9f9f7] hover:bg-[#f9f9f7]">
                <TableHead className="font-bold text-black">NO</TableHead>
                <TableHead className="font-bold text-black">NAME</TableHead>
                <TableHead className="font-bold text-black">
                  DESCRIPTION
                </TableHead>
                <TableHead className="font-bold text-black text-center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
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
                    <TableCell className="max-w-md truncate">
                      {room.description}
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
            Showing {filteredData.length > 0 ? firstIndex + 1 : 0} to{" "}
            {Math.min(lastIndex, filteredData.length)} of {filteredData.length}{" "}
            entries
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
              <Label htmlFor="name" className="block mb-2">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Name"
                value={newRoom.name || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
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
              disabled={!newRoom.name || !newRoom.description}
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
              <Label htmlFor="edit-name" className="block mb-2">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Name"
                value={newRoom.name || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
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
              disabled={!newRoom.name || !newRoom.description}
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
          <p className="py-4">
            Are you sure you want to delete this room? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              className="bg-gray-300 hover:bg-gray-400 text-black"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={submitDeleteRoom}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

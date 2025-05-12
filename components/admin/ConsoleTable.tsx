"use client";

import { useState, useCallback } from "react";
import { Search, Pencil, Trash2, Upload } from "lucide-react";
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

interface Console {
  id: string;
  name: string;
  image: string;
  amount: number;
}

// Sample data
const consoleData: Console[] = [
  {
    id: "1",
    name: "Playstation 4",
    image: "/images/console/ps3.png",
    amount: 5,
  },
  {
    id: "2",
    name: "Playstation 5",
    image: "/images/console/ps4.png",
    amount: 10,
  },
  {
    id: "3",
    name: "Nintendo",
    image: "/images/console/ps5.png",
    amount: 1,
  },
];

export function ConsoleTable() {
  // State for data and filtering
  const [consoles, setConsoles] = useState<Console[]>(consoleData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentConsole, setCurrentConsole] = useState<Console | null>(null);
  const [newConsole, setNewConsole] = useState<Partial<Console>>({
    name: "",
    image: "",
    amount: 0,
  });

  // State for file upload
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    return console.name.toLowerCase().includes(searchTerm.toLowerCase());
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
  const handleAddConsole = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditConsole = (console: Console) => {
    setCurrentConsole(console);
    setNewConsole({
      name: console.name,
      image: console.image,
      amount: console.amount,
    });
    setPreviewUrl(console.image);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConsole = (console: Console) => {
    setCurrentConsole(console);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewConsole({
      name: "",
      image: "",
      amount: 0,
    });
    setPreviewUrl(null);
  };

  const submitAddConsole = () => {
    const consoleToAdd: Console = {
      id: String(consoles.length + 1),
      name: newConsole.name || "",
      image: newConsole.image || "/images/game-cover.png",
      amount: newConsole.amount ?? 0,
    };
    setConsoles([...consoles, consoleToAdd]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const submitEditConsole = () => {
    if (!currentConsole) return;
    const updatedConsoles = consoles.map((console) => {
      if (console.id === currentConsole.id) {
        return {
          ...console,
          name: newConsole.name || console.name,
          image: newConsole.image || console.image,
          amount: newConsole.amount ?? console.amount,
        };
      }
      return console;
    });
    setConsoles(updatedConsoles);
    setCurrentConsole(null);
    resetForm();
    setIsEditDialogOpen(false);
  };

  const submitDeleteConsole = () => {
    if (!currentConsole) return;
    const updatedConsoles = consoles.filter(
      (console) => console.id !== currentConsole.id
    );
    setConsoles(updatedConsoles);
    setCurrentConsole(null);
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
              onClick={handleAddConsole}
            >
              <span>Add Console</span>
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
                <TableHead className="font-bold text-black">IMAGE</TableHead>
                <TableHead className="font-bold text-black">NAME</TableHead>
                <TableHead className="font-bold text-black">AMOUNT</TableHead>
                <TableHead className="font-bold text-black text-center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
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
                      <div className="h-12 w-12 relative overflow-hidden">
                        <Image
                          src={console.image}
                          alt={console.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{console.name}</TableCell>
                    <TableCell>{console.amount}</TableCell>
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
            Showing 1 to {Math.min(lastIndex, filteredData.length)} of{" "}
            {filteredData.length} entries
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
                    />
                  </div>
                ) : (
                  <Upload className="h-8 w-8 text-amber-500 mb-2" />
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
                placeholder="Name"
                value={newConsole.name}
                onChange={(e) =>
                  setNewConsole({ ...newConsole, name: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="amount" className="block mb-2">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Amount"
                value={newConsole.amount || 0}
                onChange={(e) =>
                  setNewConsole({
                    ...newConsole,
                    amount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              onClick={submitAddConsole}
              className="bg-amber-500 hover:bg-amber-600 w-full"
              disabled={!newConsole.name || !(newConsole.amount ?? 0 > 0)}
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
                    />
                  </div>
                ) : (
                  <Upload className="h-8 w-8 text-amber-500 mb-2" />
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
                placeholder="Name"
                value={newConsole.name}
                onChange={(e) =>
                  setNewConsole({ ...newConsole, name: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="edit-amount" className="block mb-2">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="Amount"
                value={newConsole.amount || 0}
                onChange={(e) =>
                  setNewConsole({
                    ...newConsole,
                    amount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              onClick={submitEditConsole}
              className="bg-amber-500 hover:bg-amber-600 w-full"
              disabled={!newConsole.name || !(newConsole.amount ?? 0 > 0)}
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
          <p className="py-4">
            Are you sure you want to delete this console? This action cannot be
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
              onClick={submitDeleteConsole}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

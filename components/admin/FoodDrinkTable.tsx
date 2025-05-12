"use client";

import { useState, useRef, useCallback } from "react";
import {
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  GripVertical,
  Upload,
  X,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FoodDrinkItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "Food" | "Drink"; // Simplified category
  status: "Available" | "Sold Out";
}

// Sample data - updated with both food and drink items
const sampleData: FoodDrinkItem[] = [
  // Food items
  {
    id: "1",
    name: "Taco",
    price: 10000,
    image: "/images/food/beef.jpg",
    category: "Food",
    status: "Available",
  },
  {
    id: "2",
    name: "Nasi Goreng",
    price: 15000,
    image: "/images/food/chicken.jpg",
    category: "Food",
    status: "Sold Out",
  },
  {
    id: "3",
    name: "Sate Ayam (10)",
    price: 25000,
    image: "/images/food/noodle1.jpg",
    category: "Food",
    status: "Available",
  },
  {
    id: "4",
    name: "Roti Bakar Vanilla",
    price: 12000,
    image: "/images/food/bread.jpg",
    category: "Food",
    status: "Sold Out",
  },
  {
    id: "5",
    name: "Roti Bakar Coklat",
    price: 12000,
    image: "/images/food/bread.jpg",
    category: "Food",
    status: "Available",
  },
  {
    id: "6",
    name: "French Fries",
    price: 10000,
    image: "/images/food/popcorn.jpg",
    category: "Food",
    status: "Sold Out",
  },
  {
    id: "7",
    name: "Sosis Goreng (5)",
    price: 15000,
    image: "/images/food/noodle2.jpg",
    category: "Food",
    status: "Available",
  },
  {
    id: "8",
    name: "Burger Beef",
    price: 20000,
    image: "/images/food/beef.jpg",
    category: "Food",
    status: "Available",
  },
  {
    id: "9",
    name: "Chicken Wings",
    price: 18000,
    image: "/images/food/chicken.jpg",
    category: "Food",
    status: "Available",
  },
  // Drink items
  {
    id: "10",
    name: "Es Teh Manis",
    price: 8000,
    image: "/images/food/tea.jpg",
    category: "Drink",
    status: "Available",
  },
  {
    id: "11",
    name: "Soda Gembira",
    price: 12000,
    image: "/images/food/soda.jpg",
    category: "Drink",
    status: "Available",
  },
  {
    id: "12",
    name: "Mineral Water",
    price: 5000,
    image: "/images/food/mineral.jpg",
    category: "Drink",
    status: "Available",
  },
  {
    id: "13",
    name: "Hot Cappuccino",
    price: 15000,
    image: "/images/food/coffee.jpg",
    category: "Drink",
    status: "Available",
  },
  {
    id: "14",
    name: "Ice Latte",
    price: 18000,
    image: "/images/food/coffee.jpg",
    category: "Drink",
    status: "Sold Out",
  },
  {
    id: "15",
    name: "Orange Juice",
    price: 10000,
    image: "/images/food/juice.jpg",
    category: "Drink",
    status: "Available",
  },
  {
    id: "16",
    name: "Strawberry Milkshake",
    price: 15000,
    image: "/images/food/juice.jpg",
    category: "Drink",
    status: "Available",
  },
  {
    id: "17",
    name: "Bubble Tea",
    price: 16000,
    image: "/images/food/tea.jpg",
    category: "Drink",
    status: "Available",
  },
  {
    id: "18",
    name: "Hot Chocolate",
    price: 14000,
    image: "/images/food/coffee.jpg",
    category: "Drink",
    status: "Sold Out",
  },
];

// Food Item Component with Drag and Drop functionality
const FoodDrinkItem = ({
  item,
  index,
  moveItem,
  handleEdit,
  handleDelete,
}: {
  item: FoodDrinkItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  handleEdit: (item: FoodDrinkItem) => void;
  handleDelete: (item: FoodDrinkItem) => void;
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "FOOD_ITEM",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "FOOD_ITEM",
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Move the content
      moveItem(dragIndex, hoverIndex);

      // Update the index for the dragged item
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  // Format price to IDR
  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

  return (
    <TableRow
      ref={ref}
      key={item.id}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="hover:bg-gray-50 cursor-move"
    >
      <TableCell className="w-10">
        <div className="flex justify-center">
          <div className="flex items-center font-medium">{index + 1}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="relative h-16 w-16 rounded-sm overflow-hidden">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>{formatPrice(item.price)}</TableCell>
      <TableCell>
        <Badge
          className={cn(
            "px-2 py-1 rounded-full text-xs font-semibold",
            item.status === "Available"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {item.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-amber-500 text-amber-500"
            onClick={() => handleEdit(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-red-500 text-red-500"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Image Dropzone Component
const ImageDropzone = ({
  onImageChange,
  initialImage = null,
  className = "",
}: {
  onImageChange: (image: string | null, file?: File | null) => void;
  initialImage?: string | null;
  className?: string;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialImage);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        "Invalid file type. Please upload an image file (JPEG, PNG, GIF, WEBP)"
      );
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrorMessage("File is too large. Maximum size is 5MB");
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const processFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageChange(result, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        processFile(file);
      }
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        processFile(file);
      }
    },
    [processFile]
  );

  const removeImage = useCallback(() => {
    setPreview(null);
    onImageChange(null);
  }, [onImageChange]);

  return (
    <div className={cn("w-full", className)}>
      {!preview ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragging
              ? "border-amber-500 bg-amber-50"
              : "border-gray-300 hover:border-amber-400"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-center font-medium">
            Drag & drop image here, or click to select
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Supports: JPG, PNG, GIF, WEBP (max 5MB)
          </p>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <div className="pt-[100%] relative">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

interface FoodDrinkTableProps {
  initialTab?: "all" | "food" | "drink";
}

export function FoodDrinkTable({ initialTab = "all" }: FoodDrinkTableProps) {
  // State untuk data dan filter
  const [items, setItems] = useState<FoodDrinkItem[]>(sampleData);
  const [currentTab, setCurrentTab] = useState<"all" | "food" | "drink">(
    initialTab
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed from 10 to 5

  // State untuk modal
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<FoodDrinkItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<FoodDrinkItem>>({
    name: "",
    price: 0,
    image: "",
    category: "Food",
    status: "Available",
  });

  // Add file state
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Filter data berdasarkan tab dan pencarian
  const filteredData = items.filter((item) => {
    // Filter by tab
    const matchesTab =
      currentTab === "all" ||
      (currentTab === "food"
        ? item.category === "Food"
        : item.category === "Drink");

    // Filter by search term
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const paginatedData = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Format price ke Rupiah
  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

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
  const handleAddItem = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditItem = (item: FoodDrinkItem) => {
    setCurrentItem(item);
    setNewItem({
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      status: item.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (item: FoodDrinkItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewItem({
      name: "",
      price: 0,
      image: "",
      category: currentTab === "drink" ? "Drink" : "Food", // Set default based on current tab
      status: "Available",
    });
    setImageFile(null);
  };

  // Handle image change
  const handleImageChange = (
    imageData: string | null,
    file: File | null = null
  ) => {
    setNewItem({ ...newItem, image: imageData || "" });
    setImageFile(file);
  };

  // Submit functions
  const submitAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // If using the actual image data from drag and drop
    const itemToAdd: FoodDrinkItem = {
      id: String(items.length + 1),
      name: newItem.name || "",
      price: newItem.price || 0,
      image: newItem.image || `/images/food/beef.jpg`,
      category: newItem.category || "",
      status: (newItem.status as "Available" | "Sold Out") || "Available",
    };

    setItems([...items, itemToAdd]);
    resetForm();
    setIsAddDialogOpen(false);

    toast.success("Item added successfully!", {
      description: `${itemToAdd.name} has been added to the menu.`,
    });
  };

  const submitEditItem = () => {
    if (!currentItem) return;

    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const updatedItems = items.map((item) => {
      if (item.id === currentItem.id) {
        return {
          ...item,
          name: newItem.name || item.name,
          price: newItem.price ?? item.price,
          image: newItem.image || item.image,
          category: newItem.category || item.category,
          status: (newItem.status as "Available" | "Sold Out") || item.status,
        };
      }
      return item;
    });

    setItems(updatedItems);
    setCurrentItem(null);
    resetForm();
    setIsEditDialogOpen(false);

    toast.success("Item updated successfully!", {
      description: `${newItem.name} has been updated.`,
    });
  };

  const submitDeleteItem = () => {
    if (!currentItem) return;

    const updatedItems = items.filter((item) => item.id !== currentItem.id);
    setItems(updatedItems);
    setCurrentItem(null);
    setIsDeleteDialogOpen(false);

    toast.success("Item deleted successfully!", {
      description: `${currentItem.name} has been removed from the menu.`,
    });
  };

  // Drag and drop handler
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = paginatedData[dragIndex];

    // Create new array and update positions
    const newItems = [...items];
    const allDataIndex = items.findIndex((item) => item.id === dragItem.id);
    const hoverItem = paginatedData[hoverIndex];
    const hoverDataIndex = items.findIndex((item) => item.id === hoverItem.id);

    // Swap positions
    [newItems[allDataIndex], newItems[hoverDataIndex]] = [
      newItems[hoverDataIndex],
      newItems[allDataIndex],
    ];

    setItems(newItems);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="border-none shadow-none">
        <CardHeader className="pb-3 px-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs
              defaultValue="all"
              value={currentTab}
              onValueChange={(value) => {
                setCurrentTab(value as "all" | "food" | "drink");
                setCurrentPage(1); // Reset ke halaman pertama saat ganti tab
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
                <TabsTrigger
                  value="all"
                  className={cn(
                    "data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  )}
                >
                  All Items
                </TabsTrigger>
                <TabsTrigger
                  value="food"
                  className={cn(
                    "data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  )}
                >
                  Food
                </TabsTrigger>
                <TabsTrigger
                  value="drink"
                  className={cn(
                    "data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  )}
                >
                  Drink
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Current tab indicator with badge count */}
            <div className="hidden sm:flex text-sm font-medium text-muted-foreground gap-2">
              {currentTab === "all" && (
                <>
                  <span>Showing all items</span>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50"
                    >
                      {items.filter((item) => item.category === "Food").length}{" "}
                      Food
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                    >
                      {items.filter((item) => item.category === "Drink").length}{" "}
                      Drink
                    </Badge>
                  </div>
                </>
              )}
              {currentTab === "food" && (
                <>
                  <span>Showing only food items</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-50"
                  >
                    {items.filter((item) => item.category === "Food").length}{" "}
                    items
                  </Badge>
                </>
              )}
              {currentTab === "drink" && (
                <>
                  <span>Showing only drink items</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                  >
                    {items.filter((item) => item.category === "Drink").length}{" "}
                    items
                  </Badge>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset ke halaman pertama saat pencarian
                  }}
                />
              </div>
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
              <Button
                className="bg-[#B99733] hover:bg-amber-600 flex gap-1 items-center w-full sm:w-auto"
                onClick={handleAddItem}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            className="rounded-md border bg-[#f9f9f7] overflow-auto"
            style={{ maxHeight: "500px" }}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f9f9f7] hover:bg-[#f9f9f7]">
                  <TableHead className="font-bold text-black">NO</TableHead>
                  <TableHead className="font-bold text-black">IMAGE</TableHead>
                  <TableHead className="font-bold text-black">NAME</TableHead>
                  <TableHead className="font-bold text-black">
                    CATEGORY
                  </TableHead>
                  <TableHead className="font-bold text-black">PRICE</TableHead>
                  <TableHead className="font-bold text-black">STATUS</TableHead>
                  <TableHead className="font-bold text-black">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <FoodDrinkItem
                      key={item.id}
                      item={item}
                      index={index}
                      moveItem={moveItem}
                      handleEdit={handleEditItem}
                      handleDelete={handleDeleteItem}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 px-4 pb-4 bg-white border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length > 0 ? firstIndex + 1 : 0} to{" "}
              {Math.min(lastIndex, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>

            <div className="flex gap-1 self-center sm:self-auto">
              {generatePaginationButtons()}
            </div>
          </div>
        </CardContent>

        {/* Add Item Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>
                Add{" "}
                {currentTab === "food"
                  ? "Food"
                  : currentTab === "drink"
                  ? "Drink"
                  : "Menu"}{" "}
                Item
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Image <span className="text-red-500">*</span>
                </Label>
                <ImageDropzone
                  onImageChange={handleImageChange}
                  className="mb-1"
                />
              </div>

              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Item Name"
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-sm font-medium">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  placeholder="Price"
                  type="number"
                  value={newItem.price || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newItem.category || "Food"}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        category: value as "Food" | "Drink",
                      })
                    }
                  >
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentTab === "all" || currentTab === "food" ? (
                        <SelectItem value="Food">Food</SelectItem>
                      ) : null}

                      {currentTab === "all" || currentTab === "drink" ? (
                        <SelectItem value="Drink">Drink</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newItem.status || "Available"}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        status: value as "Available" | "Sold Out",
                      })
                    }
                  >
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold Out">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitAddItem}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={
                  !newItem.name ||
                  !newItem.price ||
                  !newItem.category ||
                  !newItem.image
                }
              >
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Image <span className="text-red-500">*</span>
                </Label>
                <ImageDropzone
                  onImageChange={handleImageChange}
                  initialImage={newItem.image}
                  className="mb-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="Item Name"
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-price" className="text-sm font-medium">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-price"
                  placeholder="Price"
                  type="number"
                  value={newItem.price || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="edit-category"
                    className="text-sm font-medium"
                  >
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newItem.category || "Food"}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        category: value as "Food" | "Drink",
                      })
                    }
                  >
                    <SelectTrigger id="edit-category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Drink">Drink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newItem.status || "Available"}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        status: value as "Available" | "Sold Out",
                      })
                    }
                  >
                    <SelectTrigger id="edit-status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold Out">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitEditItem}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={
                  !newItem.name ||
                  !newItem.price ||
                  !newItem.category ||
                  !newItem.image
                }
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Item Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Menu Item</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-medium">{currentItem?.name}</span>? This
                action cannot be undone.
              </p>
              {currentItem && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                    <Image
                      src={currentItem.image}
                      alt={currentItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{currentItem.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(currentItem.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                className="bg-gray-300 hover:bg-gray-400 text-black"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={submitDeleteItem}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </DndProvider>
  );
}

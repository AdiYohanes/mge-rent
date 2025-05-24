"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  Upload,
  RefreshCw,
  Loader2,
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
import {
  getFoodDrinkItems,
  addFoodDrinkItem,
  updateFoodDrinkItem,
  deleteFoodDrinkItem,
  FoodDrinkItem as FoodDrinkItemTypeAPI, // Renamed to avoid conflict
  STORAGE_URL, // Import STORAGE_URL
  IMAGE_URLS, // Import IMAGE_URLS
} from "@/api";

// Utility function to handle image URLs for food and drink items
const getFoodDrinkImageUrl = (imagePath: string | null): string => {
  // If no image is provided, use the default image path (served as a static asset)
  if (!imagePath || imagePath === "") {
    return IMAGE_URLS.DEFAULT_FNB_IMAGE;
  }

  // If it's already a full URL, return it
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it's a path from storage
  if (imagePath.includes("storage/images/fnb")) {
    return `${STORAGE_URL}/${imagePath}`;
  }

  // For paths that only include filename
  if (!imagePath.includes("/")) {
    return `${IMAGE_URLS.FNB_IMAGES}/${imagePath}`;
  }

  // For other paths, assume it's a path relative to storage
  return `${STORAGE_URL}/${imagePath}`;
};

// Food Item Component with Drag and Drop functionality
const FoodDrinkItem = ({
  item,
  index,
  moveItem,
  handleEdit,
  handleDelete,
}: {
  item: FoodDrinkItemTypeAPI; // Use the API type here
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  handleEdit: (item: FoodDrinkItemTypeAPI) => void; // Use API type here
  handleDelete: (item: FoodDrinkItemTypeAPI) => void; // Use API type here
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "FOOD_ITEM",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "FOOD_ITEM",
    hover: (item: { index: number }) => {
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
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `Rp${numPrice.toLocaleString("id-ID")}`;
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
            src={getFoodDrinkImageUrl(item.image)} // Use the utility function
            alt={item.name}
            fill
            className="object-cover"
            onError={(e) => {
              // Add error handling for images
              (e.target as HTMLImageElement).src = IMAGE_URLS.DEFAULT_FNB_IMAGE;
            }}
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
            item.is_available // Use is_available from API type
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {item.is_available ? "Available" : "Sold Out"}{" "}
          {/* Map boolean to string */}
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
interface ImageDropzoneProps {
  onImageChange: (imageData: string | null, file: File | null) => void;
  initialImage?: string | null; // Add initialImage prop
  className?: string;
}

const ImageDropzone = ({
  onImageChange,
  initialImage = null, // Default to null
  className = "",
}: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialImage ? getFoodDrinkImageUrl(initialImage) : null // Process initialImage
  ); // State for image preview

  // Update previewImage when initialImage prop changes (e.g., when editing a different item)
  useEffect(() => {
    setPreviewImage(initialImage ? getFoodDrinkImageUrl(initialImage) : null); // Process initialImage
  }, [initialImage]);

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

  const validateFile = (file: File) => {
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
        setPreviewImage(result); // Update preview with new image
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
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  // Function to clear the selected image
  const handleClearImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering the file input click
    setPreviewImage(null);
    onImageChange(null, null);
    // Reset the file input value so the same file can be selected again
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors relative", // Added relative for positioning clear button
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
        {previewImage ? (
          <>
            <div className="relative h-32 w-32 rounded-md overflow-hidden">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              onClick={handleClearImage}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-center font-medium">
              Drag & drop image here, or click to select
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Supports: JPG, PNG, GIF, WEBP (max 5MB)
            </p>
          </>
        )}
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
      </div>
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
  const [items, setItems] = useState<FoodDrinkItemTypeAPI[]>([]); // Use API type for items state
  const [currentTab, setCurrentTab] = useState<"all" | "food" | "drink">(
    initialTab
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [currentItem, setCurrentItem] = useState<FoodDrinkItemTypeAPI | null>( // Use API type
    null
  );
  // Define a type for the new item state, including the status string and image file
  interface NewFoodDrinkItemState {
    id?: number;
    name: string;
    category: "food" | "beverage" | "snack";
    price: string;
    image: string | null;
    status: "Available" | "Sold Out"; // Keep status string for UI state
    imageFile?: File;
  }

  const [newItem, setNewItem] = useState<Partial<NewFoodDrinkItemState>>({
    name: "",
    price: "", // Changed to string
    image: null,
    category: "food", // Changed to lowercase
    status: "Available", // Keep status string for UI state
  });

  // Add loading state
  const [loading, setLoading] = useState(false);
  // Add error state
  const [error, setError] = useState<string | null>(null);
  // Add totalItems state
  const [totalItems, setTotalItems] = useState(0);
  // Add totalPages state
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching food and drink items...");
      const response = await getFoodDrinkItems(
        currentPage,
        itemsPerPage,
        searchTerm,
        currentTab !== "all" ? currentTab : ""
      );

      console.log("API response:", response);

      let itemsArray: FoodDrinkItemTypeAPI[] = []; // Use API type
      let total = 0;
      let pages = 1;

      // Access data from response.data and meta from response.meta
      if (response && Array.isArray(response.data) && response.meta) {
        itemsArray = response.data;
        total = response.meta.total || 0;
        pages = response.meta.lastPage || 1; // Use lastPage for totalPages
      } else {
        throw new Error("Unexpected API response format or empty response.");
      }

      setItems(itemsArray);
      setTotalItems(total);
      setTotalPages(pages || 1);

      if (itemsArray.length === 0 && total > 0 && currentPage > 1) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(
        `Failed to load items: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      toast.error("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, currentTab]); // Dependencies for useCallback

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency for useEffect

  // Filter data berdasarkan tab dan pencarian
  const filteredData = items.filter((item) => {
    // Filter by tab
    const matchesTab =
      currentTab === "all" ||
      (currentTab === "food"
        ? item.category === "food" // Use lowercase
        : item.category === "beverage"); // Use lowercase

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

  // Format price ke Rupiah
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `Rp${numPrice.toLocaleString("id-ID")}`;
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
      ></Button>
    );

    return buttons;
  };

  // Handler for CRUD operations
  const handleAddItem = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditItem = (item: FoodDrinkItemTypeAPI) => {
    // Use API type
    setCurrentItem(item);
    setNewItem({
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      status: item.is_available ? "Available" : "Sold Out", // Map boolean to string for UI state
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (item: FoodDrinkItemTypeAPI) => {
    // Use API type
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewItem({
      name: "",
      price: "", // Changed to string
      image: "",
      category: currentTab === "drink" ? "beverage" : "food", // Use lowercase
      status: "Available", // Keep status string for UI state
      imageFile: undefined, // Clear image file
    });
  };

  // Handle image change
  const handleImageChange = (
    imageData: string | null,
    file: File | null = null
  ) => {
    setNewItem({
      ...newItem,
      image: imageData || "",
      imageFile: file || undefined,
    });
  };

  // Submit functions
  const submitAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for API request
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("category", newItem.category);
      formData.append("price", newItem.price.toString()); // Keep as string for FormData, but ensure backend parses it as number
      formData.append(
        "is_available",
        newItem.status === "Available" ? "1" : "0"
      ); // Map status string to is_available boolean string

      // Handle image if exists
      if (newItem.imageFile) {
        formData.append("image", newItem.imageFile);
      }

      const response = await addFoodDrinkItem(formData);

      if (response) {
        toast.success("Item added successfully!", {
          description: `${newItem.name} has been added to the menu.`,
        });

        // Refresh data
        const updatedData = await getFoodDrinkItems(
          currentPage,
          itemsPerPage,
          searchTerm,
          currentTab !== "all" ? currentTab : ""
        );

        if (updatedData && Array.isArray(updatedData.data)) {
          setItems(updatedData.data);
        }

        resetForm();
        setIsAddDialogOpen(false);
      } else {
        toast.error("Failed to add item. Please try again.");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      toast.error(
        `Failed to add item: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const submitEditItem = async () => {
    if (!currentItem) return;

    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for API request with non-image fields
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("category", newItem.category);
      formData.append("price", newItem.price.toString());
      formData.append(
        "is_available",
        newItem.status === "Available" ? "1" : "0"
      );
      formData.append("_method", "POST"); // Align with RoomTable.tsx for updates

      // Handle image removal: if image is set to null, append empty string
      if (newItem.image === null) {
        formData.append("image", "");
      }

      // Pass imageFile separately to the API function if a new file is selected
      const imageFileToUpload = newItem.imageFile || undefined;

      const response = await updateFoodDrinkItem(
        currentItem.id.toString(),
        formData,
        imageFileToUpload
      );

      if (response) {
        toast.success("Item updated successfully!", {
          description: `${newItem.name} has been updated.`,
        });

        // Refresh data
        const updatedData = await getFoodDrinkItems(
          currentPage,
          itemsPerPage,
          searchTerm,
          currentTab !== "all" ? currentTab : ""
        );

        if (updatedData && Array.isArray(updatedData.data)) {
          setItems(updatedData.data);
        }

        resetForm();
        setCurrentItem(null);
        setIsEditDialogOpen(false);
      } else {
        toast.error("Failed to update item. Please try again.");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error(
        `Failed to update item: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const submitDeleteItem = async () => {
    if (!currentItem) return;

    try {
      setLoading(true);

      const success = await deleteFoodDrinkItem(currentItem.id.toString());

      if (success) {
        toast.success("Item deleted successfully!", {
          description: `${currentItem.name} has been removed from the menu.`,
        });

        // Refresh data
        const updatedData = await getFoodDrinkItems(
          currentPage,
          itemsPerPage,
          searchTerm,
          currentTab !== "all" ? currentTab : ""
        );

        if (updatedData && Array.isArray(updatedData.data)) {
          setItems(updatedData.data);
        }

        setCurrentItem(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Failed to delete item. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error(
        `Failed to delete item: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
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
                      {items.filter((item) => item.category === "food").length}{" "}
                      Food
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                    >
                      {
                        items.filter((item) => item.category === "beverage")
                          .length
                      }{" "}
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
                    {items.filter((item) => item.category === "food").length}{" "}
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
                    {
                      items.filter((item) => item.category === "beverage")
                        .length
                    }{" "}
                    items
                  </Badge>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
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
                  disabled={loading}
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
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="h-9"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh
              </Button>
              <Button
                className="bg-[#B99733] hover:bg-amber-600 flex gap-1 items-center w-full sm:w-auto"
                onClick={handleAddItem}
                disabled={loading}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                        <span>Loading items...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-24 text-red-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-medium">{error}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchData}
                          className="mt-2"
                        >
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
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
              {Math.min(lastIndex, filteredData.length)} of {totalItems} entries
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
                  initialImage={currentItem?.image} // Pass current item image
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
                  type="number" // Keep type as number for input validation
                  value={newItem.price || ""}
                  onChange={
                    (e) => setNewItem({ ...newItem, price: e.target.value }) // Store as string
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
                    value={newItem.category || "food"}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        category: value as "food" | "beverage" | "snack", // <--- UBAH: Tipe ke huruf kecil
                      })
                    }
                  >
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
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
                  initialImage={currentItem?.image} // Pass current item image
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
                  type="number" // Keep type as number for input validation
                  value={newItem.price || ""}
                  onChange={
                    (e) => setNewItem({ ...newItem, price: e.target.value }) // Store as string
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
                    value={newItem.category || "food"}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        category: value as "food" | "beverage" | "snack",
                      })
                    }
                  >
                    <SelectTrigger id="edit-category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
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
                      src={getFoodDrinkImageUrl(currentItem.image as string)}
                      alt={currentItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{currentItem.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(currentItem.price as string)}
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

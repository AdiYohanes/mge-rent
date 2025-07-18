"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  getFnbCategories, // Import the categories API function
  FnbCategory, // Import FnbCategory type
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
  getCategoryName, // Add this as a prop
}: {
  item: FoodDrinkItemTypeAPI; // Use the API type here
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  handleEdit: (item: FoodDrinkItemTypeAPI) => void; // Use API type here
  handleDelete: (item: FoodDrinkItemTypeAPI) => void; // Use API type here
  getCategoryName: (category: string | object | undefined) => string; // Add this prop type
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
      key={item.id ? item.id.toString() : index}
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
            alt={item.name || "Food/Drink Item"}
            fill
            className="object-cover"
            onError={(e) => {
              // Add error handling for images
              (e.target as HTMLImageElement).src = IMAGE_URLS.DEFAULT_FNB_IMAGE;
            }}
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {item.name || "Unnamed Item"}
      </TableCell>
      <TableCell>{getCategoryName(item.category)}</TableCell>
      <TableCell>{formatPrice(item.price || 0)}</TableCell>
      <TableCell>
        <Badge
          className={cn(
            "px-2 py-1 rounded-full text-xs font-semibold",
            item.is_available // Use is_available from API type
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {item.is_available ? "Available" : "Sold Out"}
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
  const [totalPages, setTotalPages] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Add state for categories
  const [categories, setCategories] = useState<FnbCategory[]>([]);

  const [currentItem, setCurrentItem] = useState<FoodDrinkItemTypeAPI | null>( // Use API type
    null
  );
  // Define a type for the new item state, including the status string and image file
  interface NewFoodDrinkItemState {
    id?: number;
    name: string;
    category: string; // Change from enum to string to support dynamic categories
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

  // Add function to load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await getFnbCategories();
      if (response && Array.isArray(response.data)) {
        setCategories(response.data);
        console.log("Categories loaded:", response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories. Using default values.");
    }
  }, []);

  // Load categories when component mounts
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Helper function to get category object by ID or type
  const getCategoryByValue = useCallback(
    (value: string): FnbCategory | undefined => {
      // First try to find by ID
      if (/^\d+$/.test(value)) {
        return categories.find(
          (cat: FnbCategory) => cat.id.toString() === value
        );
      }

      // Then try to find by type
      return categories.find(
        (cat: FnbCategory) =>
          cat.type.toLowerCase() === value.toLowerCase() ||
          cat.category.toLowerCase() === value.toLowerCase()
      );
    },
    [categories]
  );

  // Helper function to determine the category type (DRY principle)
  const getCategoryType = useCallback(
    (categoryData: string | object | null | undefined): string => {
      // Handle when category is an object with type property
      if (
        categoryData &&
        typeof categoryData === "object" &&
        "type" in categoryData
      ) {
        return (categoryData as { type: string }).type;
      }
      // Handle when category is an object with id property
      else if (
        categoryData &&
        typeof categoryData === "object" &&
        "id" in categoryData
      ) {
        const categoryId = (categoryData as { id: number | string }).id;
        const foundCategory = categories.find((c) => c.id === categoryId);
        if (foundCategory) {
          return foundCategory.type;
        }
      }
      // Handle when category is a string
      else if (typeof categoryData === "string") {
        // Check if it's already a type
        if (
          ["food", "beverage", "snack"].includes(categoryData.toLowerCase())
        ) {
          return categoryData.toLowerCase();
        }
        // Otherwise try to find matching category
        else {
          const foundCategory = categories.find(
            (c) => c.category.toLowerCase() === categoryData.toLowerCase()
          );
          if (foundCategory) {
            return foundCategory.type;
          }
        }
      }

      // Default to empty string if we can't determine
      return "";
    },
    [categories]
  );

  // Fetch data from API - updated to handle pagination properly
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(
        `Fetching all food and drink items for page ${currentPage}, items per page: ${itemsPerPage}`
      );

      // Fetch all items without server-side filtering - we'll handle it client-side
      const response = await getFoodDrinkItems(
        1, // Request page 1
        1000, // Request a large number to get all items at once
        searchTerm,
        "" // No category filter - we'll filter on frontend
      );

      console.log("API response:", response);

      let itemsArray: FoodDrinkItemTypeAPI[] = [];
      let total = 0;

      // Process API response
      if (response && Array.isArray(response.data) && response.meta) {
        itemsArray = response.data;
        total = response.meta.total || 0;

        console.log(`Received ${itemsArray.length} items, total: ${total}`);

        setItems(itemsArray);

        // No need to set totalPages here as we'll calculate it based on filtered data
      } else {
        throw new Error("Unexpected API response format");
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
  }, [searchTerm]); // Remove currentPage and itemsPerPage from dependencies

  // Load data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add a separate effect for itemsPerPage changes
  useEffect(() => {
    console.log(`Items per page changed to: ${itemsPerPage}`);
    // No need to call fetchData directly as it's already in the dependency array of fetchData useCallback
  }, [itemsPerPage]);

  // Filter data based on the current tab and search term
  const filteredData = useMemo(() => {
    return items.filter((item) => {
      // Get the category type for proper filtering
      let categoryType = "";

      // Handle when category is an object with type property
      if (
        item.category &&
        typeof item.category === "object" &&
        "type" in item.category
      ) {
        categoryType = (item.category as { type: string }).type;
      }
      // Handle when category is an object with id property (need to look up the type)
      else if (
        item.category &&
        typeof item.category === "object" &&
        "id" in item.category
      ) {
        const categoryId = (item.category as { id: number | string }).id;
        const foundCategory = categories.find((c) => c.id === categoryId);
        if (foundCategory) {
          categoryType = foundCategory.type;
        }
      }
      // Handle when category is a string - could be the type itself or category name
      else if (typeof item.category === "string") {
        // Check if it's already a type
        if (
          ["food", "beverage", "snack"].includes(item.category.toLowerCase())
        ) {
          categoryType = item.category.toLowerCase();
        }
        // Otherwise try to find a matching category
        else {
          const foundCategory = categories.find(
            (c) =>
              c.category.toLowerCase() ===
              item.category.toString().toLowerCase()
          );
          if (foundCategory) {
            categoryType = foundCategory.type;
          }
        }
      }

      // Apply the tab filter
      const categoryMatch =
        currentTab === "all" ||
        (currentTab === "food" &&
          (categoryType === "food" || categoryType === "snack")) ||
        (currentTab === "drink" && categoryType === "beverage");

      // Apply search filter
      const searchMatch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [items, currentTab, searchTerm, categories]);

  // Apply pagination to the filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    // Make sure we don't go out of bounds
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calculate category counts based on actual types
  const foodCount = useMemo(() => {
    return items.filter((item) => {
      let categoryType = "";

      if (
        item.category &&
        typeof item.category === "object" &&
        "type" in item.category
      ) {
        categoryType = (item.category as { type: string }).type;
      } else if (
        item.category &&
        typeof item.category === "object" &&
        "id" in item.category
      ) {
        const categoryId = (item.category as { id: number | string }).id;
        const foundCategory = categories.find((c) => c.id === categoryId);
        if (foundCategory) {
          categoryType = foundCategory.type;
        }
      } else if (typeof item.category === "string") {
        if (["food", "snack"].includes(item.category.toLowerCase())) {
          categoryType = item.category.toLowerCase();
        } else {
          const foundCategory = categories.find(
            (c) =>
              c.category.toLowerCase() ===
              item.category.toString().toLowerCase()
          );
          if (foundCategory) {
            categoryType = foundCategory.type;
          }
        }
      }

      return categoryType === "food" || categoryType === "snack";
    }).length;
  }, [items, categories]);

  const drinkCount = useMemo(() => {
    return items.filter((item) => {
      let categoryType = "";

      if (
        item.category &&
        typeof item.category === "object" &&
        "type" in item.category
      ) {
        categoryType = (item.category as { type: string }).type;
      } else if (
        item.category &&
        typeof item.category === "object" &&
        "id" in item.category
      ) {
        const categoryId = (item.category as { id: number | string }).id;
        const foundCategory = categories.find((c) => c.id === categoryId);
        if (foundCategory) {
          categoryType = foundCategory.type;
        }
      } else if (typeof item.category === "string") {
        if (["beverage"].includes(item.category.toLowerCase())) {
          categoryType = item.category.toLowerCase();
        } else {
          const foundCategory = categories.find(
            (c) =>
              c.category.toLowerCase() ===
              item.category.toString().toLowerCase()
          );
          if (foundCategory) {
            categoryType = foundCategory.type;
          }
        }
      }

      return categoryType === "beverage";
    }).length;
  }, [items, categories]);

  // Update pagination state based on filtered data
  useEffect(() => {
    // Calculate total pages based on filtered data
    const calculatedTotalPages = Math.max(
      1,
      Math.ceil(filteredData.length / itemsPerPage)
    );
    setTotalPages(calculatedTotalPages);

    // If current page is out of range after filtering, reset to page 1
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }
  }, [filteredData.length, itemsPerPage, currentPage]);

  // Format price ke Rupiah
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `Rp${numPrice.toLocaleString("id-ID")}`;
  };

  // Handler for CRUD operations
  const handleAddItem = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditItem = (item: FoodDrinkItemTypeAPI) => {
    console.log("Editing item:", item);
    setCurrentItem(item);

    // First get the category type for proper display
    const categoryType = getCategoryType(item.category);

    // Then get the category ID for the form value
    let categoryId = "";
    if (
      item.category &&
      typeof item.category === "object" &&
      "id" in item.category
    ) {
      categoryId = String((item.category as { id: string | number }).id);
    } else {
      // Try to find the category by name or type
      const foundCategory = categories.find(
        (c) =>
          c.type === categoryType ||
          (typeof item.category === "string" &&
            c.category.toLowerCase() === item.category.toLowerCase())
      );
      if (foundCategory) {
        categoryId = String(foundCategory.id);
      }
    }

    console.log(
      "Category ID for edit:",
      categoryId,
      "Category type:",
      categoryType
    );

    setNewItem({
      name: item.name,
      price: item.price,
      image: item.image,
      category: categoryId || categoryType, // Prefer ID if available, otherwise use type
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
    // For the new item, prefer using a category ID if available
    let defaultCategory: string = "";

    // Choose a category ID based on the current tab
    if (categories.length > 0) {
      if (currentTab === "drink") {
        // Find a beverage category
        const drinkCategory = categories.find((c) => c.type === "beverage");
        if (drinkCategory) {
          defaultCategory = String(drinkCategory.id);
        }
      } else {
        // Find a food category
        const foodCategory = categories.find((c) => c.type === "food");
        if (foodCategory) {
          defaultCategory = String(foodCategory.id);
        }
      }

      // If we couldn't find a matching category, use the first available
      if (!defaultCategory && categories.length > 0) {
        defaultCategory = String(categories[0].id);
      }
    }

    // If no categories are available, fallback to type strings
    if (!defaultCategory) {
      defaultCategory = currentTab === "drink" ? "beverage" : "food";
    }

    setNewItem({
      name: "",
      price: "",
      image: "",
      category: defaultCategory,
      status: "Available",
      imageFile: undefined,
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

  // Helper function to map category to category ID
  const getCategoryId = useCallback(
    (category: string | object | unknown): string => {
      // Use getCategoryByValue to get the category object if needed
      if (typeof category === "string") {
        // If it's already a numeric ID, return as is
        if (/^\d+$/.test(category)) {
          return category;
        }

        // Try to find the category by type or name
        const foundCategory = getCategoryByValue(category);
        if (foundCategory) {
          return foundCategory.id.toString();
        }
      }

      // If it's an object, extract id if available
      if (typeof category === "object" && category) {
        // If it has an id property, use that directly
        if ("id" in category) {
          return String((category as { id: string | number }).id);
        }

        // If it has category and type properties, try to find matching category
        if ("category" in category && "type" in category) {
          const catName = String((category as { category: string }).category);
          const catType = String((category as { type: string }).type);

          const foundCategory = categories.find(
            (c: FnbCategory) =>
              c.category.toLowerCase() === catName.toLowerCase() &&
              c.type.toLowerCase() === catType.toLowerCase()
          );

          if (foundCategory) {
            return foundCategory.id.toString();
          }
        }
      }

      // If we still couldn't determine, return a default ID if categories exist
      if (categories.length > 0) {
        // Try to find a food category as default
        const foodCategory = categories.find(
          (c: FnbCategory) => c.type === "food"
        );
        if (foodCategory) return foodCategory.id.toString();

        // Otherwise return the first category
        return categories[0].id.toString();
      }

      return "1"; // Default to "1" as fallback
    },
    [categories, getCategoryByValue]
  );

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

      // Add both category and fnb_category_id
      const categoryId = getCategoryId(newItem.category);
      formData.append("fnb_category_id", categoryId);

      // Try to find the category object
      const categoryObj = categories.find(
        (c: FnbCategory) => c.id.toString() === categoryId
      );
      if (categoryObj) {
        formData.append("category", categoryObj.type); // Use the type (food, beverage, snack)
      } else {
        // Fallback to the original value
        formData.append("category", newItem.category);
      }

      formData.append("price", newItem.price.toString());
      formData.append(
        "is_available",
        newItem.status === "Available" ? "1" : "0"
      );

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
        await fetchData();

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
      console.log("Submitting edit with category:", newItem.category);

      // Create FormData for API request with non-image fields
      const formData = new FormData();
      formData.append("name", newItem.name);

      // Add both category and fnb_category_id
      const categoryId = getCategoryId(newItem.category);
      formData.append("fnb_category_id", categoryId);

      // Try to find the category object
      const categoryObj = categories.find(
        (c: FnbCategory) => c.id.toString() === categoryId
      );
      if (categoryObj) {
        formData.append("category", categoryObj.type); // Use the type (food, beverage, snack)
      } else {
        // Fallback to the original value
        formData.append("category", newItem.category);
      }

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
        await fetchData();

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
        await fetchData();

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

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Show 5 pagination buttons in design

    // Calculate the range of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjust startPage if we can't show maxButtons
    if (endPage - startPage + 1 < maxButtons && endPage < totalPages) {
      // If we're near the end, just show the last maxButtons pages
      startPage = Math.max(1, totalPages - maxButtons + 1);
    } else if (endPage - startPage + 1 < maxButtons) {
      // If we're near the beginning, show pages 1 to maxButtons
      startPage = 1;
      endPage = Math.min(maxButtons, totalPages);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1 || loading}
      >
        &lt;
      </Button>
    );

    // First page and ellipsis if needed
    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant={1 === currentPage ? "default" : "outline"}
          size="icon"
          className={
            1 === currentPage
              ? "rounded-full bg-amber-500 hover:bg-amber-600"
              : "rounded-full"
          }
          onClick={() => setCurrentPage(1)}
          disabled={loading}
        >
          1
        </Button>
      );

      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        // Skip first and last pages as they're handled separately
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
    }

    // Last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>
        );
      }

      buttons.push(
        <Button
          key={totalPages}
          variant={totalPages === currentPage ? "default" : "outline"}
          size="icon"
          className={
            totalPages === currentPage
              ? "rounded-full bg-amber-500 hover:bg-amber-600"
              : "rounded-full"
          }
          onClick={() => setCurrentPage(totalPages)}
          disabled={loading}
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
        size="icon"
        className="rounded-full"
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages || loading}
      >
        &gt;
      </Button>
    );

    return buttons;
  };

  // Improved function for better category name display
  const getCategoryName = useCallback(
    (category: string | object | undefined) => {
      if (!category) return "Unknown";

      // If it's a string and looks like an ID, try to find the category
      if (typeof category === "string" && /^\d+$/.test(category)) {
        const foundCategory = categories.find(
          (c: FnbCategory) => c.id.toString() === category
        );
        if (foundCategory) {
          return foundCategory.category;
        }
      }

      // Handle the case when category is an object
      if (typeof category === "object") {
        // Try to extract name property if it exists
        if (category && "name" in category) {
          return category.name as string;
        }

        // Try to extract category property if it exists
        if (category && "category" in category) {
          return (category as { category: string }).category;
        }

        // Try to extract id property if it exists
        if (category && "id" in category) {
          const id = String(category.id);
          const foundCategory = categories.find(
            (c: FnbCategory) => c.id.toString() === id
          );
          if (foundCategory) {
            return foundCategory.category;
          }
        }
      }

      // If we get here, just return the string representation
      return String(category);
    },
    [categories]
  );

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
                      {foodCount} Food
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                    >
                      {drinkCount} Drink
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
                    {foodCount} items
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
                    {drinkCount} items
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
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="entries-select" className="text-sm font-medium">
                  Show
                </Label>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    const newValue = Number(value);
                    console.log(
                      `Changing entries per page from ${itemsPerPage} to ${newValue}`
                    );
                    setItemsPerPage(newValue);
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="entries-select"
                    className="w-[80px] border-amber-300 focus:ring-amber-500"
                  >
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <Label htmlFor="entries-select" className="text-sm font-medium">
                  entries
                </Label>
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
                      getCategoryName={getCategoryName}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 px-4 py-3 bg-[#f9f9f7] border-t border-gray-200 rounded-b-md">
            <div className="text-sm text-muted-foreground">
              {filteredData.length > 0 ? (
                <span>
                  Showing{" "}
                  <span className="font-medium">
                    {paginatedData.length > 0
                      ? (currentPage - 1) * itemsPerPage + 1
                      : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredData.length}</span>{" "}
                  entries
                </span>
              ) : (
                <span>No entries to display</span>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex gap-1 self-center sm:self-auto">
                {generatePaginationButtons()}
              </div>
            )}
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
                    value={newItem.category || ""}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.category} ({category.type})
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="beverage">Beverage</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </>
                      )}
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
                    value={newItem.category || ""}
                    onValueChange={(value) => {
                      console.log("Category changed to:", value);
                      setNewItem({
                        ...newItem,
                        category: value,
                      });
                    }}
                  >
                    <SelectTrigger id="edit-category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.category} ({category.type})
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="beverage">Beverage</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </>
                      )}
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

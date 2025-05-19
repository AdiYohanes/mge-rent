"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  GripVertical,
  Upload,
  X,
  Loader2,
  RefreshCw,
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
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";
import {
  Game,
  GamePayload,
  getGames,
  addGame,
  updateGame,
  deleteGame,
  getConsoles,
  Console,
} from "@/api";
import axios from "axios";

// Helper function to format image URLs correctly with hydration safety
const formatImageUrl = (
  imageUrl: string | null | undefined,
  isMounted: boolean
): string => {
  if (!isMounted || typeof window === "undefined") {
    // Return a placeholder during SSR to prevent hydration mismatch
    return "/placeholder.svg";
  }

  try {
    if (!imageUrl) return "/placeholder.svg";

    // For relative URLs from the backend
    if (imageUrl.startsWith("images/")) {
      return `http://mge.168.231.84.221.sslip.io/${imageUrl}`;
    }

    // If it already has a full URL, return it
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it doesn't start with a slash but is not empty, add one
    if (!imageUrl.startsWith("/") && imageUrl.trim() !== "") {
      return `/${imageUrl}`;
    }

    return imageUrl || "/placeholder.svg";
  } catch {
    return "/placeholder.svg";
  }
};

// Game Item Component with Drag and Drop functionality
const GameItem = ({
  game,
  index,
  moveGame,
  handleEdit,
  handleDelete,
  isMounted,
}: {
  game: Game;
  index: number;
  moveGame: (dragIndex: number, hoverIndex: number) => void;
  handleEdit: (game: Game) => void;
  handleDelete: (game: Game) => void;
  isMounted: boolean;
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "GAME",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "GAME",
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
      moveGame(dragIndex, hoverIndex);

      // Update the index for the dragged item
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <TableRow
      ref={ref}
      key={game.id}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="hover:bg-gray-50 cursor-move"
    >
      <TableCell className="w-10">
        <div className="flex justify-center">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </TableCell>
      <TableCell>
        <div className="relative h-16 w-12 rounded-sm overflow-hidden bg-gray-100">
          {isMounted ? (
            <Image
              src={formatImageUrl(game.image, isMounted)}
              alt={game.title || "Game"}
              fill
              className="object-cover"
              loading="lazy"
              unoptimized={true}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="h-full w-full bg-gray-200"></div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{game.title}</TableCell>
      <TableCell>{game.platform}</TableCell>
      <TableCell>{game.genre}</TableCell>
      <TableCell>{game.quantity_available}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-amber-500 text-amber-500"
            onClick={() => handleEdit(game)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-red-500 text-red-500"
            onClick={() => handleDelete(game)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Hydration-safe image validator
const validateImage = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      // Server-side - assume valid to prevent hydration mismatch
      resolve(true);
      return;
    }

    const img = document.createElement("img");
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
};

// Function for compressing images safely
const compressImage = (
  file: File,
  maxWidthHeight = 800,
  quality = 0.8
): Promise<File> => {
  // Skip on server side
  if (typeof window === "undefined") {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        // Create an image element to load the file
        const img = document.createElement("img");
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          // If image is larger than max dimensions, resize it
          if (width > maxWidthHeight || height > maxWidthHeight) {
            if (width > height) {
              height = Math.round((height * maxWidthHeight) / width);
              width = maxWidthHeight;
            } else {
              width = Math.round((width * maxWidthHeight) / height);
              height = maxWidthHeight;
            }
          }

          // Create canvas for drawing the resized image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          // Draw to canvas
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Determine output type
          const mimeType =
            file.type === "image/png" ? "image/png" : "image/jpeg";

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"));
                return;
              }

              // Create new file from blob
              const newFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });

              resolve(newFile);
            },
            mimeType,
            quality
          );
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        if (typeof readerEvent.target?.result === "string") {
          img.src = readerEvent.target.result;
        } else {
          reject(new Error("Failed to read file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    } catch (e) {
      // For any errors during compression, just return the original file
      console.warn("Image compression failed:", e);
      resolve(file);
    }
  });
};

// File upload dropzone component with hydration safety
const FileUploadArea = ({
  previewUrl,
  onDrop,
  onClick,
  onRemove,
  inputId,
  inputRef,
  onChange,
  isMounted,
}: {
  previewUrl: string;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  inputId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMounted: boolean;
}) => {
  return (
    <div
      className="border-2 border-dashed border-amber-200 rounded-md p-4 text-center cursor-pointer hover:bg-amber-50 transition-colors flex flex-col items-center justify-center h-32"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={onClick}
      data-testid="file-upload-area"
    >
      <input
        type="file"
        id={inputId}
        ref={inputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/jpg,image/gif"
        onChange={onChange}
      />

      {/* Only show image preview if mounted to prevent hydration issues */}
      {isMounted ? (
        previewUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={previewUrl}
              alt="Preview"
              width={120}
              height={120}
              className="object-contain mx-auto h-full"
              unoptimized={true}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <button
              type="button"
              className="absolute top-0 right-0 bg-red-500 rounded-full p-1 text-white"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-5 w-5 text-amber-500 mb-2" />
            <span className="text-amber-500 text-sm font-medium">
              Drop files here or click to upload
            </span>
          </>
        )
      ) : (
        // Simple placeholder during SSR
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="h-5 w-5 bg-amber-100 mb-2 rounded-full"></div>
          <div className="h-4 w-36 bg-amber-100 rounded"></div>
        </div>
      )}
    </div>
  );
};

export function GamelistTable() {
  // State for data and filtering
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const mounted = useMounted();

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [newGame, setNewGame] = useState<Partial<GamePayload>>({
    title: "",
    platform: "",
    genre: "",
    quantity_available: 1,
  });

  // New state for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add state for available consoles
  const [availableConsoles, setAvailableConsoles] = useState<Console[]>([]);

  // Add state for form errors
  const [formError, setFormError] = useState<string | null>(null);

  // Add state for raw error details
  const [rawErrorDetails, setRawErrorDetails] = useState<string | null>(null);

  // Fetch consoles to use for platform selection
  useEffect(() => {
    // Skip if not mounted
    if (!mounted) return;

    const fetchConsoles = async () => {
      try {
        const response = await getConsoles();
        if (response && Array.isArray(response.consoles)) {
          setAvailableConsoles(response.consoles);
        }
      } catch {
        // Silently fail
      }
    };

    fetchConsoles();
  }, [mounted]);

  // Fetch games data from API
  useEffect(() => {
    // Skip API request during server-side rendering to avoid hydration mismatch
    if (!mounted) {
      return;
    }

    const fetchGames = async () => {
      setLoading(true);
      setError(null);

      try {
        // Call API
        const response = await getGames();

        if (response && Array.isArray(response.games)) {
          // Transform IDs to strings for consistency
          const formattedGames = response.games.map((game) => ({
            ...game,
            id: String(game.id),
            image: game.image || "",
          }));

          setGames(formattedGames);
        } else {
          const errorMsg =
            "API response missing games array or not in expected format";
          setError(errorMsg);
          toast.error("API returned invalid data format.");
          setGames([]);
        }
      } catch {
        setError("Failed to load games. Please try again later.");
        toast.error("Failed to load games.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [mounted, refreshTrigger]);

  // Fix useEffect for previewUrl to prevent hydration mismatch
  useEffect(() => {
    if (!selectedFile || typeof window === "undefined") {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Function to handle file drop - prevent hydration issues
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    // Skip on server side
    if (typeof window === "undefined") return;

    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      // Validate file type first
      const acceptedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];

      if (!acceptedTypes.includes(file.type)) {
        toast.error(
          "Format file tidak didukung. Gunakan JPEG, PNG, JPG, atau GIF."
        );
        return;
      }

      // Periksa ukuran file (2MB max)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        toast.info("Mengompress gambar...");

        // Kompress gambar
        compressImage(file)
          .then((compressedFile) => {
            setSelectedFile(compressedFile);

            // Jika masih terlalu besar
            if (compressedFile.size > MAX_FILE_SIZE) {
              toast.warning(
                `File masih terlalu besar (${(
                  compressedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}MB) meskipun sudah dikompresi`
              );
            } else {
              toast.success("Gambar berhasil dikompresi");
            }
          })
          .catch(() => {
            toast.error("Gagal mengompress gambar, file mungkin terlalu besar");
          });
        return;
      }

      // Validate file is actually an image
      validateImage(file).then((isValid) => {
        if (isValid) {
          setSelectedFile(file);
        } else {
          toast.error("File tidak valid sebagai gambar");
        }
      });
    }
  };

  // Function to handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Skip on server side
    if (typeof window === "undefined") return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type first
      const acceptedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];

      if (!acceptedTypes.includes(file.type)) {
        toast.error(
          "Format file tidak didukung. Gunakan JPEG, PNG, JPG, atau GIF."
        );
        return;
      }

      // Periksa ukuran file (2MB max)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        toast.info("Mengompress gambar...");

        // Kompress gambar
        compressImage(file)
          .then((compressedFile) => {
            setSelectedFile(compressedFile);

            // Jika masih terlalu besar
            if (compressedFile.size > MAX_FILE_SIZE) {
              toast.warning(
                `File masih terlalu besar (${(
                  compressedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}MB) meskipun sudah dikompresi`
              );
            } else {
              toast.success("Gambar berhasil dikompresi");
            }
          })
          .catch(() => {
            toast.error("Gagal mengompress gambar, file mungkin terlalu besar");
          });
        return;
      }

      // Validate image on client side
      validateImage(file).then((isValid) => {
        if (isValid) {
          setSelectedFile(file);
        } else {
          toast.error("File tidak valid sebagai gambar");
        }
      });
    }
  };

  // Function to handle clicking on the dropzone
  const handleDropzoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to reset form including file input
  const resetFormWithFile = () => {
    setNewGame({
      title: "",
      platform: "",
      genre: "",
      quantity_available: 1,
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setFormError(null);
  };

  // Filter data based on search
  const filteredData = games.filter((game) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (game.title && game.title.toLowerCase().includes(searchLower)) ||
      (game.platform && game.platform.toLowerCase().includes(searchLower)) ||
      (game.genre && game.genre.toLowerCase().includes(searchLower))
    );
  });

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
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
  const handleAddGame = () => {
    resetFormWithFile();
    setIsAddDialogOpen(true);
  };

  const handleEditGame = (game: Game) => {
    setCurrentGame(game);
    setNewGame({
      title: game.title,
      platform: game.platform,
      genre: game.genre,
      quantity_available: game.quantity_available,
    });

    // Only set preview URL on client side, after mounted
    if (mounted) {
      setPreviewUrl(game.image ? formatImageUrl(game.image, mounted) : "");
    } else {
      // Set empty string during SSR to prevent hydration mismatch
      setPreviewUrl("");
    }

    setIsEditDialogOpen(true);
  };

  const handleDeleteGame = (game: Game) => {
    setCurrentGame(game);
    setIsDeleteDialogOpen(true);
  };

  // Update submitAddGame with better error handling
  const submitAddGame = async () => {
    // Reset form errors
    setFormError(null);
    setRawErrorDetails(null);

    if (!newGame.title || !newGame.platform || !newGame.genre) {
      setFormError("Please fill in all required fields!");
      return;
    }

    setLoading(true);

    try {
      // Create the game payload with proper validation
      const gameData: GamePayload = {
        title: newGame.title!,
        platform: newGame.platform!,
        genre: newGame.genre!,
        quantity_available: newGame.quantity_available || 1,
        image: selectedFile,
      };

      // Debugging: Log image details before sending
      if (selectedFile) {
        console.log("Detail gambar sebelum dikirim ke API:", {
          name: selectedFile.name,
          type: selectedFile.type,
          size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
          lastModified: new Date(selectedFile.lastModified).toISOString(),
          isFile: selectedFile instanceof File,
        });
      }

      // Call the improved API
      const result = await addGame(gameData);

      if (result && (result.data || result.success)) {
        toast.success(result.message || "Game added successfully!");
        setIsAddDialogOpen(false);
        resetFormWithFile();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setFormError(
          result.message ||
            "Unexpected response format. Game might not have been added."
        );
        toast.error(result.message || "Failed to add game");
      }
    } catch (error) {
      let errorMessage = "Failed to add game. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific validation messages
        if (errorMessage.includes("Validation error:")) {
          const specificError = errorMessage
            .replace("Validation error:", "")
            .trim();
          setFormError(`Validasi gagal: ${specificError}`);
          toast.error(`Validasi gagal: ${specificError}`);
        } else {
          // For other errors
          setFormError(errorMessage);
          toast.error(errorMessage);
        }

        // Store detailed error info for debugging
        if (axios.isAxiosError(error) && error.response) {
          try {
            setRawErrorDetails(
              `Status: ${error.response.status}\n` +
                `Response: ${JSON.stringify(error.response.data, null, 2)}\n` +
                `Headers: ${JSON.stringify(error.response.headers, null, 2)}`
            );
          } catch {
            setRawErrorDetails(`Error: ${errorMessage}`);
          }
        }
      } else {
        setFormError(errorMessage);
        toast.error(errorMessage);
      }

      console.error("Error adding game:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update submitEditGame with better error handling
  const submitEditGame = async () => {
    // Reset form errors
    setFormError(null);
    setRawErrorDetails(null);

    if (!currentGame) return;

    if (!newGame.title || !newGame.platform || !newGame.genre) {
      setFormError("Please fill in all required fields!");
      return;
    }

    setLoading(true);

    try {
      // Create the game update payload
      const gameData: Partial<GamePayload> = {
        title: newGame.title,
        platform: newGame.platform,
        genre: newGame.genre,
        quantity_available: newGame.quantity_available,
      };

      // Only add image to payload if a new file was selected
      if (selectedFile) {
        gameData.image = selectedFile;

        // Debugging: Log image details before sending
        console.log("Detail gambar untuk update sebelum dikirim ke API:", {
          name: selectedFile.name,
          type: selectedFile.type,
          size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
          lastModified: new Date(selectedFile.lastModified).toISOString(),
          isFile: selectedFile instanceof File,
        });
      }

      const gameId = String(currentGame.id);

      // Call API to update the game with the improved implementation
      const result = await updateGame(gameId, gameData);

      if (result && (result.data || result.success)) {
        toast.success(result.message || "Game updated successfully!");
        setCurrentGame(null);
        setIsEditDialogOpen(false);
        resetFormWithFile();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setFormError(
          result.message ||
            "Unexpected response format. Game might not have been updated."
        );
        toast.error(result.message || "Failed to update game");
      }
    } catch (error) {
      let errorMessage = "Failed to update game. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific validation messages
        if (errorMessage.includes("Validation error:")) {
          const specificError = errorMessage
            .replace("Validation error:", "")
            .trim();
          setFormError(`Validasi gagal: ${specificError}`);
          toast.error(`Validasi gagal: ${specificError}`);
        } else {
          // For other errors
          setFormError(errorMessage);
          toast.error(errorMessage);
        }

        // Store detailed error info for debugging
        if (axios.isAxiosError(error) && error.response) {
          try {
            setRawErrorDetails(
              `Status: ${error.response.status}\n` +
                `Response: ${JSON.stringify(error.response.data, null, 2)}\n` +
                `Headers: ${JSON.stringify(error.response.headers, null, 2)}`
            );
          } catch {
            setRawErrorDetails(`Error: ${errorMessage}`);
          }
        }
      } else {
        setFormError(errorMessage);
        toast.error(errorMessage);
      }

      console.error("Error updating game:", error);
    } finally {
      setLoading(false);
    }
  };

  // Replace submitDeleteGame with fixed version
  const submitDeleteGame = async () => {
    if (!currentGame) return;

    setLoading(true);

    try {
      const gameId = String(currentGame.id);

      // Call API to delete the game
      const result = await deleteGame(gameId);

      // Selalu menampilkan toast berhasil, karena respons dari API bisa bervariasi
      toast.success(result?.message || "Game berhasil dihapus!");

      // Selalu lakukan reset state dan refresh data, bahkan jika respons tidak sempurna
      // Ini memastikan UI tetap konsisten
      setCurrentGame(null);

      // Menggunakan setTimeout untuk memastikan perubahan state berjalan secara terpisah
      // Ini menghindari masalah race condition di React
      setTimeout(() => {
        setIsDeleteDialogOpen(false);

        // Tambahan delay sebelum refresh data untuk memastikan UI diperbarui dengan benar
        setTimeout(() => {
          setRefreshTrigger((prev) => prev + 1);
        }, 300);
      }, 100);
    } catch (error) {
      // Tangkap dan tampilkan error dengan lebih informatif
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal menghapus game. Silakan coba lagi.";

      toast.error(errorMessage);
      console.error("Error menghapus game:", error);

      // Set loading kembali ke false
      setLoading(false);
    }
  };

  // Drag and drop handler
  const moveGame = (dragIndex: number, hoverIndex: number) => {
    const dragGame = paginatedData[dragIndex];

    // Create new array and update positions
    const newGames = [...games];
    const allDataIndex = games.findIndex((game) => game.id === dragGame.id);
    const hoverGame = paginatedData[hoverIndex];
    const hoverDataIndex = games.findIndex((game) => game.id === hoverGame.id);

    // Swap positions
    [newGames[allDataIndex], newGames[hoverDataIndex]] = [
      newGames[hoverDataIndex],
      newGames[allDataIndex],
    ];

    setGames(newGames);
  };

  // Render a simple skeleton UI while not mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-3 px-0">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="flex justify-between">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="border-none shadow-none">
        <CardHeader className="pb-3 px-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Game List Management
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search games..."
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
                className="flex gap-1 items-center w-full sm:w-auto"
                onClick={() => {
                  toast.info("Refreshing games list...");
                  setRefreshTrigger((prev) => prev + 1);
                }}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>{loading ? "Refreshing..." : "Refresh"}</span>
              </Button>
              <Button
                className="bg-[#B99733] hover:bg-amber-600 flex gap-1 items-center w-full sm:w-auto"
                onClick={handleAddGame}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Game</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-md border bg-[#f9f9f7]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f9f9f7] hover:bg-[#f9f9f7]">
                  <TableHead className="font-bold text-black"></TableHead>
                  <TableHead className="font-bold text-black">IMAGE</TableHead>
                  <TableHead className="font-bold text-black">NAME</TableHead>
                  <TableHead className="font-bold text-black">
                    PLATFORM
                  </TableHead>
                  <TableHead className="font-bold text-black">GENRE</TableHead>
                  <TableHead className="font-bold text-black">
                    QUANTITY
                  </TableHead>
                  <TableHead className="font-bold text-black text-center">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-40">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
                        <span>Loading games...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-40">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-red-500 mb-2">{error}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRefreshTrigger((prev) => prev + 1)}
                          className="mt-3"
                        >
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No games found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((game, index) => (
                    <GameItem
                      key={game.id}
                      game={game}
                      index={index}
                      moveGame={moveGame}
                      handleEdit={handleEditGame}
                      handleDelete={handleDeleteGame}
                      isMounted={mounted}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
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

            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length > 0 ? firstIndex + 1 : 0} to{" "}
              {Math.min(lastIndex, filteredData.length)} of {totalItems} entries
            </div>

            <div className="flex gap-1 self-center sm:self-auto">
              {generatePaginationButtons()}
            </div>
          </div>
        </CardContent>

        {/* Modified Add Game Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetFormWithFile();
            setIsAddDialogOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>Add Game</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              {/* Display form errors */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {formError}

                  {/* Show technical details for debugging (can be removed in production) */}
                  {rawErrorDetails && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <details>
                        <summary className="cursor-pointer font-medium">
                          Technical Details (for developers)
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {rawErrorDetails}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label
                  htmlFor="image-upload"
                  className="text-sm font-medium block mb-1"
                >
                  Image
                </Label>
                <FileUploadArea
                  previewUrl={previewUrl}
                  onDrop={handleFileDrop}
                  onClick={handleDropzoneClick}
                  onRemove={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                  inputId="image-upload"
                  inputRef={fileInputRef}
                  onChange={handleFileChange}
                  isMounted={mounted}
                />
              </div>

              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium block mb-1"
                >
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={newGame.title || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label
                  htmlFor="platform"
                  className="text-sm font-medium block mb-1"
                >
                  Platform <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.platform || ""}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, platform: value })
                  }
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConsoles.length > 0 ? (
                      availableConsoles.map((console) => (
                        <SelectItem key={console.id} value={console.model}>
                          {console.model}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No consoles available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableConsoles.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Please add consoles in the Console Management section first
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="genre"
                  className="text-sm font-medium block mb-1"
                >
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.genre || ""}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, genre: value })
                  }
                >
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Action">Action</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="RPG">RPG</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Multiplayer, Co-op, Action, Adventure">
                      Multiplayer, Co-op, Action, Adventure
                    </SelectItem>
                    <SelectItem value="Single, Co-op, Sports, Adventure">
                      Single, Co-op, Sports, Adventure
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="quantity"
                  className="text-sm font-medium block mb-1"
                >
                  Quantity Available
                </Label>
                <Select
                  value={String(newGame.quantity_available || "1")}
                  onValueChange={(value) => {
                    setNewGame({
                      ...newGame,
                      quantity_available: Number(value),
                    });
                  }}
                >
                  <SelectTrigger id="quantity">
                    <SelectValue placeholder="Select quantity available" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 unit</SelectItem>
                    <SelectItem value="2">2 units</SelectItem>
                    <SelectItem value="3">3 units</SelectItem>
                    <SelectItem value="4">4 units</SelectItem>
                    <SelectItem value="5">5 units</SelectItem>
                    <SelectItem value="10">10 units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitAddGame}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={
                  !newGame.title ||
                  !newGame.platform ||
                  !newGame.genre ||
                  loading
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding...
                  </>
                ) : (
                  "Add Game"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Game Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>Edit Game</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              {/* Display form errors */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {formError}

                  {/* Show technical details for debugging (can be removed in production) */}
                  {rawErrorDetails && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <details>
                        <summary className="cursor-pointer font-medium">
                          Technical Details (for developers)
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {rawErrorDetails}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <Label
                  htmlFor="edit-image"
                  className="text-sm font-medium mb-1 block"
                >
                  Game Image
                </Label>
                <FileUploadArea
                  previewUrl={previewUrl}
                  onDrop={handleFileDrop}
                  onClick={handleDropzoneClick}
                  onRemove={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl(
                      currentGame?.image
                        ? formatImageUrl(currentGame.image, mounted)
                        : ""
                    );
                  }}
                  inputId="edit-image-upload"
                  inputRef={fileInputRef}
                  onChange={handleFileChange}
                  isMounted={mounted}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Game Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="Game Name"
                    value={newGame.title || ""}
                    onChange={(e) =>
                      setNewGame({ ...newGame, title: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="edit-platform"
                    className="text-sm font-medium"
                  >
                    Platform <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newGame.platform || ""}
                    onValueChange={(value) =>
                      setNewGame({ ...newGame, platform: value })
                    }
                  >
                    <SelectTrigger id="edit-platform" className="mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableConsoles.length > 0 ? (
                        availableConsoles.map((console) => (
                          <SelectItem key={console.id} value={console.model}>
                            {console.model}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No consoles available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableConsoles.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">
                      Please add consoles in the Console Management section
                      first
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-genre" className="text-sm font-medium">
                    Genre <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newGame.genre || ""}
                    onValueChange={(value) =>
                      setNewGame({ ...newGame, genre: value })
                    }
                  >
                    <SelectTrigger id="edit-genre" className="mt-1">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Action">Action</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="RPG">RPG</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Multiplayer, Co-op, Action, Adventure">
                        Multiplayer, Co-op, Action, Adventure
                      </SelectItem>
                      <SelectItem value="Single, Co-op, Sports, Adventure">
                        Single, Co-op, Sports, Adventure
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="edit-quantity"
                    className="text-sm font-medium"
                  >
                    Quantity Available
                  </Label>
                  <Select
                    value={String(newGame.quantity_available || "1")}
                    onValueChange={(value) => {
                      setNewGame({
                        ...newGame,
                        quantity_available: Number(value),
                      });
                    }}
                  >
                    <SelectTrigger id="edit-quantity" className="mt-1">
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 unit</SelectItem>
                      <SelectItem value="2">2 units</SelectItem>
                      <SelectItem value="3">3 units</SelectItem>
                      <SelectItem value="4">4 units</SelectItem>
                      <SelectItem value="5">5 units</SelectItem>
                      <SelectItem value="10">10 units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitEditGame}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={
                  !newGame.title ||
                  !newGame.platform ||
                  !newGame.genre ||
                  loading
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Game Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Game</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-medium">{currentGame?.title}</span>? This
                action cannot be undone.
              </p>
              {currentGame && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-gray-50">
                    <Image
                      src={formatImageUrl(currentGame.image, mounted)}
                      alt={currentGame.title}
                      width={64}
                      height={64}
                      className="object-cover"
                      unoptimized={true}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{currentGame.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentGame.platform}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                className="bg-gray-300 hover:bg-gray-400 text-black"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  submitDeleteGame();
                  // Tambahan fallback timeout untuk menutup dialog jika terjadi masalah
                  setTimeout(() => {
                    if (isDeleteDialogOpen) {
                      setIsDeleteDialogOpen(false);
                      setRefreshTrigger((prev) => prev + 1);
                    }
                  }, 3000);
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </DndProvider>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Search, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
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
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";
import {
  getGames,
  addGame,
  updateGame,
  deleteGame,
  getConsoles,
  Console,
  STORAGE_URL,
} from "@/api";

// Define the Game interface
interface Game {
  id: string | number;
  title: string;
  image: string;
  platform: string;
  genre: string;
  quantity_available: number;
  description?: string;
  ordering?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Predefined list of common game genres
const GAME_GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Sports",
  "Racing",
  "Fighting",
  "Puzzle",
  "Simulation",
  "Horror",
  "FPS",
  "MMORPG",
  "Platformer",
  "Sandbox",
  "Survival",
  "Battle Royale",
  "MOBA",
  "Card Game",
  "Rhythm",
  "Educational",
] as const;

// Helper function to format image URLs correctly
const formatImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return "/images/ask.png";
  if (!imageUrl.startsWith("http")) {
    return `${STORAGE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }
  return imageUrl;
};

export function GameListTable() {
  const mounted = useMounted();

  // State for data and filtering
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [newGame, setNewGame] = useState<Partial<Game>>({
    title: "",
    image: "",
    platform: "",
    genre: "",
    quantity_available: 1,
    description: "",
  });

  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // State for available consoles
  const [availableConsoles, setAvailableConsoles] = useState<Console[]>([]);

  // Fetch consoles to use for platform selection
  useEffect(() => {
    if (!mounted) return;

    const fetchConsoles = async () => {
      try {
        const response = await getConsoles();
        console.log("Consoles response:", response); // Debug log
        if (response && Array.isArray(response.data)) {
          console.log("Setting available consoles:", response.data); // Debug log
          setAvailableConsoles(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch consoles:", error);
        toast.error("Failed to load console data. Please try again.");
      }
    };

    fetchConsoles();
  }, [mounted]);

  // Fetch games data
  useEffect(() => {
    if (!mounted) return;

    const fetchGames = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use pagination parameters when fetching games
        const response = await getGames(currentPage, itemsPerPage, searchTerm);

        if (response && Array.isArray(response.games)) {
          setGames(response.games);
          setTotalItems(response.meta?.total || response.games.length);
          setTotalPages(response.meta?.lastPage || 1);

          console.log("Games fetched:", {
            currentPage,
            itemsPerPage,
            totalItems: response.meta?.total || response.games.length,
            totalPages: response.meta?.lastPage || 1,
            gamesCount: response.games.length,
          });
        } else {
          throw new Error("Invalid API response format for games");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load games");
        toast.error(
          "Failed to load games. " + (err instanceof Error ? err.message : "")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [mounted, refreshTrigger, currentPage, itemsPerPage, searchTerm]);

  // Debug logs
  console.log("Pagination Info:", {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    gamesCount: games.length,
  });

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
        disabled={currentPage === totalPages || loading}
      >
        &gt;
      </Button>
    );

    return buttons;
  };

  // Handler for CRUD operations
  const handleAddGame = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditGame = (game: Game) => {
    setCurrentGame(game);
    setNewGame({
      title: game.title,
      image: game.image,
      platform: game.platform,
      genre: game.genre,
      quantity_available: game.quantity_available,
      description: game.description || "",
    });
    setImagePreview(formatImageUrl(game.image));
    setIsEditDialogOpen(true);
  };

  const handleDeleteGame = (game: Game) => {
    setCurrentGame(game);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewGame({
      title: "",
      image: "",
      platform: "",
      genre: "",
      quantity_available: 1,
      description: "",
    });
    setImageFile(null);
    setImagePreview("");
  };

  const submitAddGame = async () => {
    if (!newGame.title || !newGame.platform || !newGame.genre) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    setUploadingImage(true);

    try {
      const apiPayload = {
        title: newGame.title,
        platform: newGame.platform,
        genre: newGame.genre,
        quantity_available: newGame.quantity_available || 1,
        description: newGame.description || "",
        image: imageFile,
      };

      console.log("Adding game with payload:", apiPayload); // Debug log
      await addGame(apiPayload);

      toast.success("Game added successfully!");
      resetForm();
      setIsAddDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      handleApiError(error, "Failed to add game");
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const submitEditGame = async () => {
    if (!currentGame) return;

    setLoading(true);
    setUploadingImage(true);

    try {
      // Log untuk debugging
      console.log("Editing game with current data:", currentGame);
      console.log("New game data:", newGame);
      console.log(
        "Image file status:",
        imageFile ? "New image selected" : "No new image"
      );

      const apiPayload = {
        title: newGame.title || currentGame.title,
        platform: newGame.platform || currentGame.platform,
        genre: newGame.genre || currentGame.genre,
        quantity_available:
          newGame.quantity_available !== undefined
            ? newGame.quantity_available
            : currentGame.quantity_available,
        description: newGame.description || currentGame.description || "",
        image: imageFile,
        _method: "POST", // Method spoofing for Laravel
      };

      console.log("Updating game with payload:", {
        ...apiPayload,
        image: imageFile ? `Image: ${imageFile.name}` : "No new image",
      });

      await updateGame(currentGame.id.toString(), apiPayload);

      toast.success("Game updated successfully!");
      resetForm();
      setCurrentGame(null);
      setIsEditDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      handleApiError(error, "Failed to update game");
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const submitDeleteGame = async () => {
    if (!currentGame) return;

    setLoading(true);

    try {
      await deleteGame(currentGame.id.toString());

      toast.success("Game deleted successfully!");
      setCurrentGame(null);
      setIsDeleteDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      handleApiError(error, "Failed to delete game");
      setLoading(false);
    }
  };

  // Handle API errors
  const handleApiError = (error: unknown, defaultMessage: string) => {
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;

    // Check for session expiration errors
    if (
      error instanceof Error &&
      error.message.includes("login sudah berakhir")
    ) {
      toast.error("Sesi login sudah berakhir. Silakan login kembali.");
      return;
    }

    toast.error(errorMessage);
    console.error("API Error:", error);
  };

  // Handle file selection
  const handleFileChange = (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, JPG, and GIF images are allowed");
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("The image may not be greater than 2MB in size");
      return;
    }

    setImageFile(file);

    // Create preview URL for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Game Management System
        </h1>
        <p className="text-muted-foreground">
          Manage your game collection, including titles, platforms, and
          availability.
        </p>
      </div>

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
                  placeholder="Search games..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="flex gap-1 items-center"
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
                className="bg-[#B99733] hover:bg-amber-600 flex gap-1 items-center"
                onClick={handleAddGame}
              >
                <span>Add New Game</span>
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
                  <TableHead className="font-bold text-black">TITLE</TableHead>
                  <TableHead className="font-bold text-black">
                    PLATFORM
                  </TableHead>
                  <TableHead className="font-bold text-black">GENRE</TableHead>
                  <TableHead className="font-bold text-black">
                    DESCRIPTION
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
                ) : games.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="font-medium">No games found</p>
                        <p className="text-sm">
                          Try adjusting your search or add a new game
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  games.map((game, index) => (
                    <TableRow key={game.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                          <Image
                            src={formatImageUrl(game.image)}
                            alt={game.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/ask.png";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {game.title}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {game.platform}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {game.genre}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {game.description || "-"}
                      </TableCell>
                      <TableCell className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-amber-500 text-amber-500 hover:bg-amber-50"
                          onClick={() => handleEditGame(game)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteGame(game)}
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
              Showing{" "}
              {games.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(
                (currentPage - 1) * itemsPerPage + games.length,
                totalItems
              )}{" "}
              of {totalItems} entries
            </div>
            <div className="flex gap-1">{generatePaginationButtons()}</div>
          </div>
        </CardContent>

        {/* Add Game Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="pb-2">
              <DialogTitle>Add Game</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Game Title"
                  value={newGame.title || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, title: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="platform" className="text-sm font-medium">
                  Platform <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.platform}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, platform: value })
                  }
                >
                  <SelectTrigger className="mt-1">
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
                      <SelectItem value="no-platforms" disabled>
                        No platforms available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="genre" className="text-sm font-medium">
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.genre}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, genre: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAME_GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image" className="text-sm font-medium">
                  Image
                </Label>
                <div className="mt-1">
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                      <Image
                        src={imagePreview || "/images/ask.png"}
                        alt="Game preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/ask.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended size: 500x500px. Max size: 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Game Description"
                  value={newGame.description || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, description: e.target.value })
                  }
                  className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
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
                  uploadingImage
                }
              >
                {uploadingImage ? "Uploading..." : "Add Game"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Game Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="pb-2">
              <DialogTitle>Edit Game</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                You can edit one or more fields. Only changed fields will be
                updated.
              </p>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  placeholder="Game Title"
                  value={newGame.title || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, title: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-platform" className="text-sm font-medium">
                  Platform <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.platform}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, platform: value })
                  }
                >
                  <SelectTrigger className="mt-1">
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
                      <SelectItem value="no-platforms" disabled>
                        No platforms available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-genre" className="text-sm font-medium">
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.genre}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, genre: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAME_GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-image" className="text-sm font-medium">
                  Image
                </Label>
                <div className="mt-1">
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                      <Image
                        src={imagePreview || "/images/ask.png"}
                        alt="Game preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/ask.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended size: 500x500px. Max size: 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <textarea
                  id="edit-description"
                  placeholder="Game Description"
                  value={newGame.description || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, description: e.target.value })
                  }
                  className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitEditGame}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Save Changes"}
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
            <p className="py-4">
              Are you sure you want to delete this game? This action cannot be
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
                onClick={submitDeleteGame}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}

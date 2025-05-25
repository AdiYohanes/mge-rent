"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Pencil, Trash2, Eye, Loader2, RefreshCw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";
import axios from "axios";
import {
  Unit,
  UnitPayload,
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
  Game,
  getGames,
  Room,
  getRooms,
  Console,
  getConsoles,
} from "@/api";
import { STORAGE_URL } from "@/api/constants";

// Extend UnitPayload interface to include additional properties used in the component
interface ExtendedUnitPayload extends Omit<UnitPayload, "status"> {
  room?: string;
  console?: string;
  rentPrice?: number;
  status: "available" | "booked" | "serviced";
}

// Add this helper function at the top with other imports
const formatImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return "/images/ask.png";
  if (!imageUrl.startsWith("http")) {
    return `${STORAGE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }
  return imageUrl;
};

// Game List Item Component with Drag and Drop
const GameItem = ({
  game,
  index,
  moveGame,
}: {
  game: Game;
  index: number;
  moveGame: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

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

      if (dragIndex === hoverIndex) {
        return;
      }

      moveGame(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`border rounded-md p-3 flex items-center gap-3 cursor-move hover:bg-gray-50 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-gray-400">
        <div className="flex gap-1">
          <div className="flex flex-col gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          </div>
        </div>
      </div>
      <div className="flex flex-grow items-center gap-3">
        <div className="flex-shrink-0">
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image
              src={formatImageUrl(game.image)}
              alt={game.title}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/ask.png";
              }}
            />
          </div>
        </div>
        <span className="font-medium text-sm">{game.title}</span>
      </div>
    </div>
  );
};

// Helper function to normalize features to ensure it's always an array
const normalizeFeatures = (features: unknown): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [features]; // If not valid JSON, treat as a single feature
    }
  }
  return [];
};

export function UnitTable() {
  const mounted = useMounted();

  // State for data and filtering
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // State for related data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [rawErrorDetails, setRawErrorDetails] = useState<string | null>(null);

  // State for game list modal and drag & drop
  const [isGameListOpen, setIsGameListOpen] = useState(false);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [currentUnitGames, setCurrentUnitGames] = useState<Game[]>([]);
  const [gameSearchTerm, setGameSearchTerm] = useState("");

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState<Partial<ExtendedUnitPayload>>({
    name: "",
    room_id: 0,
    console_id: 0,
    game_ids: [],
    status: "available" as "available" | "booked" | "serviced",
    features: [],
    description: "",
  });

  // State for managing selected games in forms
  const [gameSearchInput, setGameSearchInput] = useState("");
  const [showGameSearchResults, setShowGameSearchResults] = useState(false);

  // Fetch units data
  useEffect(() => {
    if (!mounted) return;

    const fetchUnits = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if we have a token before making the API call
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Silakan login terlebih dahulu untuk melihat daftar unit.");
          setLoading(false);
          return;
        }

        const response = await getUnits(currentPage, itemsPerPage, searchTerm);

        if (response && Array.isArray(response.data)) {
          setUnits(response.data);
          setTotalItems(response.meta?.total || response.data.length);
          setTotalPages(response.meta?.lastPage || 1);
        } else {
          throw new Error("Invalid API response format for units");
        }
      } catch (err) {
        console.error("Error fetching units:", err);

        // Check for session expiration
        if (
          err instanceof Error &&
          err.message.includes("login sudah berakhir")
        ) {
          setError("Sesi login Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else if (
          err instanceof Error &&
          err.message.includes("login terlebih dahulu")
        ) {
          setError("Silakan login terlebih dahulu untuk melihat daftar unit.");
        } else {
          setError(
            `Gagal memuat daftar unit: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [mounted, currentPage, itemsPerPage, searchTerm, refreshTrigger]);

  // Fetch rooms, consoles, and games for dropdowns
  useEffect(() => {
    if (!mounted) return;

    const fetchRelatedData = async () => {
      try {
        // Check if we have a token before making the API calls
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("Token not found. Related data fetching skipped.");
          return;
        }

        // Fetch rooms
        try {
          const roomsResponse = await getRooms();
          if (roomsResponse && Array.isArray(roomsResponse.data)) {
            setRooms(roomsResponse.data);
          }
        } catch (roomErr) {
          console.error("Error fetching rooms:", roomErr);
        }

        // Fetch consoles
        try {
          const consolesResponse = await getConsoles();
          if (consolesResponse && Array.isArray(consolesResponse.data)) {
            setConsoles(consolesResponse.data);
          }
        } catch (consoleErr) {
          console.error("Error fetching consoles:", consoleErr);
        }

        // Fetch games
        try {
          const gamesResponse = await getGames();
          if (gamesResponse && Array.isArray(gamesResponse.games)) {
            setAllGames(gamesResponse.games);
          }
        } catch (gameErr) {
          console.error("Error fetching games:", gameErr);
        }
      } catch (err) {
        console.error("Error fetching related data:", err);
      }
    };

    fetchRelatedData();
  }, [mounted]);

  // Format price in IDR
  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

  // Map room and console IDs to their names
  const getRoomNameById = (id: number | string): string => {
    const room = rooms.find((room) => String(room.id) === String(id));
    return room?.name || "Unknown Room";
  };

  const getConsoleNameById = (id: number | string): string => {
    const consoleItem = consoles.find((c) => String(c.id) === String(id));
    return consoleItem?.model || "Unknown Console";
  };

  // Calculate price based on selected options
  const calculateRentPrice = (
    roomId: number,
    consoleId: number,
    features: unknown
  ): number => {
    // Get room price from API data
    const room = rooms.find((r) => String(r.id) === String(roomId));
    const roomPrice = room?.price ? parseFloat(String(room.price)) : 0;

    // Get console price from API data
    const consoleItem = consoles.find(
      (c) => String(c.id) === String(consoleId)
    );
    const consolePrice = consoleItem?.price
      ? parseFloat(String(consoleItem.price))
      : 0;

    // Calculate feature price
    let featurePrice = 0;
    const normalizedFeatures = normalizeFeatures(features);

    if (normalizedFeatures.length > 0) {
      const feature = normalizedFeatures[0]; // We now only support one feature at a time

      if (feature === "netflix") {
        featurePrice = 2000;
      } else if (feature === "disney+") {
        featurePrice = 2500;
      } else if (feature === "nintendo_switch") {
        featurePrice = 3000;
      }
    }

    return roomPrice + consolePrice + featurePrice;
  };

  // Filter data based on search
  const filteredData = units.filter((unit) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (unit.name && unit.name.toLowerCase().includes(searchLower)) ||
      getRoomNameById(unit.room_id).toLowerCase().includes(searchLower) ||
      getConsoleNameById(unit.console_id).toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const paginatedData = filteredData.slice(0, itemsPerPage);

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

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "serviced":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "booked":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Handler for CRUD operations
  const handleAddUnit = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setCurrentUnit(unit);

    // Get game objects from IDs - pastikan game_ids adalah array
    const gameIdsArray = Array.isArray(unit.game_ids)
      ? unit.game_ids
      : unit.game_ids
      ? JSON.parse(String(unit.game_ids))
      : [];

    const unitGames = gameIdsArray
      .map((id: number) =>
        allGames.find((game) => String(game.id) === String(id))
      )
      .filter(Boolean) as Game[];

    setSelectedGames(unitGames);

    // Get room and console names
    const roomName = getRoomNameById(unit.room_id);
    const consoleName = getConsoleNameById(unit.console_id);

    // Pastikan features adalah array
    const featuresArray = normalizeFeatures(unit.features);

    // Set unit data for form with existing status and prepopulated values
    setNewUnit({
      name: unit.name,
      room_id: unit.room_id,
      room: roomName, // Setting room name for dropdown
      console_id: unit.console_id,
      console: consoleName, // Setting console name for dropdown
      game_ids: gameIdsArray, // Pastikan ini array
      description: unit.description || "",
      status: unit.status,
      features: featuresArray, // Pastikan ini array
      // Calculate the rent price based on current data
      rentPrice: calculateRentPrice(
        unit.room_id,
        unit.console_id,
        featuresArray
      ),
    });

    setIsEditDialogOpen(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    setCurrentUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormError(null);
    setRawErrorDetails(null);
    setNewUnit({
      name: "",
      room_id: 0,
      console_id: 0,
      game_ids: [],
      description: "",
      status: "available" as "available" | "booked" | "serviced",
      features: [],
    });
    setSelectedGames([]);
    setGameSearchInput("");
  };

  const submitAddUnit = async () => {
    // Reset errors
    setFormError(null);
    setRawErrorDetails(null);

    if (
      !newUnit.name ||
      !newUnit.room_id ||
      !newUnit.console_id ||
      selectedGames.length === 0
    ) {
      setFormError("Please fill in all required fields!");
      return;
    }

    setLoading(true);

    try {
      // Calculate the unit price
      const unitPrice = calculateRentPrice(
        newUnit.room_id,
        newUnit.console_id,
        newUnit.features || []
      );

      // Ensure features is an array
      const featuresArray = Array.isArray(newUnit.features)
        ? newUnit.features
        : [];

      // Get room and console
      const room = rooms.find((r) => r.id === newUnit.room_id);
      if (!room) {
        throw new Error("Room tidak ditemukan. Silakan pilih room yang valid.");
      }

      const consoleItem = consoles.find((c) => c.id === newUnit.console_id);
      if (!consoleItem) {
        throw new Error(
          "Console tidak ditemukan. Silakan pilih console yang valid."
        );
      }

      // Ensure game_ids is an array of numbers
      const gameIdsArray = selectedGames.map((game) => Number(game.id));

      // Create payload with proper array formatting
      const apiPayload = {
        name: newUnit.name,
        room_id: Number(newUnit.room_id),
        console_id: Number(newUnit.console_id),
        game_ids: gameIdsArray, // Send as array, not JSON string
        description: newUnit.description || "",
        status: newUnit.status || "available",
        features: featuresArray, // Send as array, not JSON string
        room: room.name,
        console: consoleItem.model,
        rent_price: unitPrice,
      };

      console.log("Sending unit data to API:", apiPayload);
      console.log("Game IDs (array):", gameIdsArray);
      console.log("Features (array):", featuresArray);

      await addUnit(apiPayload);

      toast.success("Unit added successfully!");
      resetForm();
      setIsAddDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      handleApiError(error, "Failed to add unit");
    } finally {
      setLoading(false);
    }
  };

  const submitEditUnit = async () => {
    // Reset errors
    setFormError(null);
    setRawErrorDetails(null);

    if (!currentUnit) return;

    setLoading(true);

    try {
      // Create minimal payload with only the changed fields
      const apiPayload: Partial<UnitPayload> = {
        room_id: Number(newUnit.room_id || currentUnit.room_id),
        console_id: Number(newUnit.console_id || currentUnit.console_id),
      };

      // Only add other fields if they are changed
      if (newUnit.name && newUnit.name !== currentUnit.name) {
        apiPayload.name = newUnit.name;
      }

      if (
        newUnit.description !== undefined &&
        newUnit.description !== currentUnit.description
      ) {
        apiPayload.description = newUnit.description;
      }

      if (newUnit.status && newUnit.status !== currentUnit.status) {
        apiPayload.status = newUnit.status;
      }

      // Handle features array properly
      const currentFeatures = Array.isArray(currentUnit.features)
        ? currentUnit.features
        : currentUnit.features
        ? JSON.parse(String(currentUnit.features))
        : [];

      const newFeatures = Array.isArray(newUnit.features)
        ? newUnit.features
        : newUnit.features
        ? JSON.parse(String(newUnit.features))
        : [];

      if (
        JSON.stringify(currentFeatures.sort()) !==
        JSON.stringify(newFeatures.sort())
      ) {
        apiPayload.features = newFeatures;
      }

      // Only include game_ids if games were changed
      if (selectedGames.length > 0) {
        const currentGameIds = currentUnit.game_ids || [];
        const newGameIds = selectedGames.map((game) => Number(game.id));

        if (
          JSON.stringify(currentGameIds.sort()) !==
          JSON.stringify(newGameIds.sort())
        ) {
          apiPayload.game_ids = newGameIds;
        }
      }

      console.log("Updating unit data:", apiPayload);

      await updateUnit(currentUnit.id, apiPayload);

      toast.success("Unit updated successfully!");
      resetForm();
      setCurrentUnit(null);
      setIsEditDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      handleApiError(error, "Failed to update unit");
    } finally {
      setLoading(false);
    }
  };

  const submitDeleteUnit = async () => {
    if (!currentUnit) return;

    setLoading(true);

    try {
      await deleteUnit(currentUnit.id);

      toast.success("Unit deleted successfully!");
      setCurrentUnit(null);
      setIsDeleteDialogOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      handleApiError(error, "Failed to delete unit");
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

    // Set form error for display
    setFormError(errorMessage);

    // Set raw error details for debugging
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

    console.error("API Error:", error);
  };

  // Handle opening game list modal
  const handleOpenGameList = (unit: Unit) => {
    // Find the games by IDs
    const gameIdsArray = Array.isArray(unit.game_ids)
      ? unit.game_ids
      : unit.game_ids
      ? JSON.parse(String(unit.game_ids))
      : [];

    const unitGames = gameIdsArray
      .map((id: number) =>
        allGames.find((game) => String(game.id) === String(id))
      )
      .filter(Boolean) as Game[];

    setCurrentUnitGames(unitGames);
    setCurrentUnit(unit);
    setIsGameListOpen(true);
  };

  // Move game function for drag and drop
  const moveGame = (dragIndex: number, hoverIndex: number) => {
    const dragGame = currentUnitGames[dragIndex];
    const newGames = [...currentUnitGames];
    newGames.splice(dragIndex, 1);
    newGames.splice(hoverIndex, 0, dragGame);
    setCurrentUnitGames(newGames);
  };

  // Filter games based on search
  const filteredGames = currentUnitGames.filter((game) =>
    game.title.toLowerCase().includes(gameSearchTerm.toLowerCase())
  );

  // Filter games for search results
  const gameSearchResults = allGames
    .filter(
      (game) =>
        (gameSearchInput.length === 0 ||
          game.title.toLowerCase().includes(gameSearchInput.toLowerCase())) &&
        !selectedGames.some((sg) => String(sg.id) === String(game.id))
    )
    .slice(0, 8); // Limit to 8 results

  // Add game to selection
  const handleAddGame = (game: Game) => {
    if (!selectedGames.some((g) => String(g.id) === String(game.id))) {
      setSelectedGames([...selectedGames, game]);
    }
    setGameSearchInput("");
  };

  // Remove game from selection
  const handleRemoveGame = (gameId: string | number) => {
    setSelectedGames(
      selectedGames.filter((game) => String(game.id) !== String(gameId))
    );
  };

  // Handle room selection
  const handleRoomChange = (value: string) => {
    const roomObj = rooms.find((room) => room.name === value);
    const roomId = roomObj?.id || 0;

    setNewUnit((prev) => {
      // Calculate new rent price based on selected room and console
      const consoleId = prev.console_id || 0;
      const features = prev.features || [];
      const rentPrice = calculateRentPrice(roomId, consoleId, features);

      return {
        ...prev,
        room_id: roomId,
        room: value,
        rentPrice: rentPrice,
      };
    });
  };

  // Handle console selection
  const handleConsoleChange = (value: string) => {
    const consoleObj = consoles.find((c) => c.model === value);
    const consoleId = consoleObj?.id || 0;

    setNewUnit((prev) => {
      // Calculate new rent price based on selected room and console
      const roomId = prev.room_id || 0;
      const features = prev.features || [];
      const rentPrice = calculateRentPrice(roomId, consoleId, features);

      return {
        ...prev,
        console_id: consoleId,
        console: value,
        rentPrice: rentPrice,
      };
    });
  };

  // Handle features selection
  const handleFeatureToggle = (feature: string) => {
    setNewUnit((prev) => {
      const features = [...(prev.features || [])];

      // Toggle the feature
      let newFeatures: string[];
      if (features.includes(feature)) {
        newFeatures = features.filter((f) => f !== feature);
      } else {
        newFeatures = [...features, feature];
      }

      // Recalculate rent price with updated features
      const roomId = prev.room_id || 0;
      const consoleId = prev.console_id || 0;
      const rentPrice = calculateRentPrice(roomId, consoleId, newFeatures);

      return {
        ...prev,
        features: newFeatures,
        rentPrice: rentPrice,
      };
    });
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

  // Type safety for price calculations
  const calculatePrice = (
    roomPrice: number | string,
    consolePrice: number | string
  ): number => {
    const roomValue =
      typeof roomPrice === "string"
        ? parseInt(roomPrice, 10) || 0
        : roomPrice || 0;
    const consoleValue =
      typeof consolePrice === "string"
        ? parseInt(consolePrice, 10) || 0
        : consolePrice || 0;
    return roomValue + consoleValue;
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
                variant="outline"
                className="flex gap-1 items-center"
                onClick={() => {
                  toast.info("Refreshing units list...");
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
                onClick={handleAddUnit}
              >
                <span>Add Unit</span>
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
                  <TableHead className="font-bold text-black">
                    UNIT NAME
                  </TableHead>
                  <TableHead className="font-bold text-black">ROOM</TableHead>
                  <TableHead className="font-bold text-black">
                    CONSOLE
                  </TableHead>
                  <TableHead className="font-bold text-black">
                    FEATURES
                  </TableHead>
                  <TableHead className="font-bold text-black">PRICE</TableHead>
                  <TableHead className="font-bold text-black">
                    GAME COUNT
                  </TableHead>
                  <TableHead className="font-bold text-black text-center">
                    GAME LIST
                  </TableHead>
                  <TableHead className="font-bold text-black text-center">
                    STATUS
                  </TableHead>
                  <TableHead className="font-bold text-black text-center">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-40">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
                        <span>Loading units...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center h-40">
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
                    <TableCell colSpan={10} className="text-center h-24">
                      No unit found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((unit, index) => (
                    <TableRow key={unit.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {firstIndex + index + 1}
                      </TableCell>
                      <TableCell>{unit.name}</TableCell>
                      <TableCell>{getRoomNameById(unit.room_id)}</TableCell>
                      <TableCell>
                        {getConsoleNameById(unit.console_id)}
                      </TableCell>
                      <TableCell>
                        {normalizeFeatures(unit.features).length > 0
                          ? normalizeFeatures(unit.features).join(", ")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {unit.rent_price
                          ? formatPrice(unit.rent_price)
                          : formatPrice(
                              calculateRentPrice(
                                unit.room_id,
                                unit.console_id,
                                normalizeFeatures(unit.features)
                              )
                            )}
                      </TableCell>
                      <TableCell>{unit.game_ids?.length || 0} games</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-cyan-500 text-cyan-500"
                          onClick={() => handleOpenGameList(unit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusBadgeClass(unit.status)}>
                          {unit.status === "available"
                            ? "Available"
                            : unit.status === "booked"
                            ? "Booked"
                            : unit.status === "serviced"
                            ? "In Service"
                            : unit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-amber-500 text-amber-500"
                          onClick={() => handleEditUnit(unit)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-red-500 text-red-500"
                          onClick={() => handleDeleteUnit(unit)}
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
              {Math.min(lastIndex, filteredData.length)} of {totalItems} entries
            </div>
            <div className="flex gap-1">{generatePaginationButtons()}</div>
          </div>
        </CardContent>

        {/* Game List Dialog with Drag & Drop Support */}
        <Dialog open={isGameListOpen} onOpenChange={setIsGameListOpen}>
          <DialogContent
            className="max-w-3xl"
            onInteractOutside={(e) => {
              e.preventDefault(); // Prevent closing by outside interaction which could disrupt drag operation
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {getConsoleNameById(currentUnit?.console_id || 0)} Unit{" "}
                {currentUnit?.name} Game List
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search games..."
                  className="pl-8"
                  value={gameSearchTerm}
                  onChange={(e) => setGameSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredGames.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-gray-500">
                    No games found matching your search
                  </div>
                ) : (
                  filteredGames.map((game, index) => (
                    <GameItem
                      key={game.id}
                      game={game}
                      index={index}
                      moveGame={moveGame}
                    />
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => setIsGameListOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Unit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>Add Unit</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Unit Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Unit Name"
                    value={newUnit.name || ""}
                    onChange={(e) =>
                      setNewUnit({ ...newUnit, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="room" className="text-sm font-medium">
                    Room <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.room || ""}
                    onValueChange={handleRoomChange}
                  >
                    <SelectTrigger id="room" className="mt-1">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.length > 0 ? (
                        rooms.map((room) => (
                          <SelectItem key={room.id} value={room.name}>
                            {room.name}{" "}
                            {typeof room.price === "number" &&
                              room.price > 0 &&
                              `(+${formatPrice(room.price)})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading rooms...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="console" className="text-sm font-medium">
                    Console <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.console || ""}
                    onValueChange={handleConsoleChange}
                  >
                    <SelectTrigger id="console" className="mt-1">
                      <SelectValue placeholder="Select console" />
                    </SelectTrigger>
                    <SelectContent>
                      {consoles.length > 0 ? (
                        consoles.map((console) => (
                          <SelectItem key={console.id} value={console.model}>
                            {console.model}{" "}
                            {typeof console.price === "number" &&
                              console.price > 0 &&
                              `(+${formatPrice(console.price)})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading consoles...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="features" className="text-sm font-medium">
                    Features
                  </Label>
                  <Select
                    value={
                      newUnit.features &&
                      normalizeFeatures(newUnit.features).length > 0
                        ? normalizeFeatures(newUnit.features)[0]
                        : "none"
                    }
                    onValueChange={(value) => {
                      if (value === "none") {
                        // Clear features
                        setNewUnit((prev) => ({
                          ...prev,
                          features: [],
                        }));
                      } else {
                        // Set the selected feature
                        setNewUnit((prev) => ({
                          ...prev,
                          features: [value],
                        }));
                      }
                    }}
                  >
                    <SelectTrigger id="features" className="mt-1">
                      <SelectValue placeholder="Select a feature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="netflix">
                        Netflix (+Rp2.000)
                      </SelectItem>
                      <SelectItem value="disney+">
                        Disney+ (+Rp2.500)
                      </SelectItem>
                      <SelectItem value="nintendo_switch">
                        Nintendo Switch (+Rp3.000)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="rentPrice" className="text-sm font-medium">
                    Rent Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="rentPrice"
                      type="number"
                      placeholder="Rent Price"
                      value={newUnit.rentPrice || ""}
                      readOnly
                      className="bg-gray-100"
                    />
                    <div className="absolute right-3 top-2 text-xs text-gray-500">
                      Auto calculated
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="grid grid-cols-2 gap-1">
                      <div>Room: </div>
                      <div className="text-right">
                        {newUnit.room_id
                          ? formatPrice(
                              rooms.find((r) => r.id === newUnit.room_id)?.price
                                ? parseFloat(
                                    String(
                                      rooms.find(
                                        (r) => r.id === newUnit.room_id
                                      )?.price
                                    )
                                  )
                                : 0
                            )
                          : "Rp0"}
                      </div>

                      <div>Console: </div>
                      <div className="text-right">
                        {newUnit.console_id
                          ? formatPrice(
                              consoles.find((c) => c.id === newUnit.console_id)
                                ?.price
                                ? parseFloat(
                                    String(
                                      consoles.find(
                                        (c) => c.id === newUnit.console_id
                                      )?.price
                                    )
                                  )
                                : 0
                            )
                          : "Rp0"}
                      </div>

                      <div>Features: </div>
                      <div className="text-right">
                        {newUnit.features &&
                        normalizeFeatures(newUnit.features).length > 0
                          ? formatPrice(
                              normalizeFeatures(newUnit.features).includes(
                                "netflix"
                              )
                                ? 2000
                                : normalizeFeatures(newUnit.features).includes(
                                    "disney+"
                                  )
                                ? 2500
                                : normalizeFeatures(newUnit.features).includes(
                                    "nintendo_switch"
                                  )
                                ? 3000
                                : 0
                            )
                          : "Rp0"}
                      </div>

                      <div className="font-medium">Total: </div>
                      <div className="text-right font-medium">
                        {formatPrice(newUnit.rentPrice || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.status || "available"}
                    onValueChange={(value: string) =>
                      setNewUnit({
                        ...newUnit,
                        status: value as "available" | "booked" | "serviced",
                      })
                    }
                  >
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="serviced">In Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Game Section */}
              <div>
                <Label htmlFor="add-game" className="text-sm font-medium">
                  Add Game <span className="text-red-500">*</span>
                </Label>

                {/* Game Search Field */}
                <div className="relative mt-1">
                  <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-md border min-h-10">
                    {selectedGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-xs"
                      >
                        <div className="relative h-3.5 w-3.5 mr-1">
                          <Image
                            src={formatImageUrl(game.image)}
                            alt={game.title}
                            fill
                            className="object-cover rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/ask.png";
                            }}
                          />
                        </div>
                        {game.title}
                        <button
                          type="button"
                          className="text-gray-500 hover:text-red-500 ml-1"
                          onClick={() => handleRemoveGame(game.id)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center flex-grow">
                      <input
                        id="add-game"
                        value={gameSearchInput}
                        onChange={(e) => {
                          setGameSearchInput(e.target.value);
                          setShowGameSearchResults(true);
                        }}
                        onFocus={() => setShowGameSearchResults(true)}
                        className="flex-grow outline-none bg-transparent p-1 text-sm"
                        placeholder={
                          selectedGames.length > 0
                            ? "Add more games..."
                            : "Search for games..."
                        }
                      />
                      <button
                        type="button"
                        className="text-xs text-amber-600 hover:text-amber-800 px-2 whitespace-nowrap"
                        onClick={() => setShowGameSearchResults(true)}
                      >
                        Browse all
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {showGameSearchResults && (
                    <div className="absolute w-full bg-white rounded-md border shadow-md mt-1 z-10 max-h-[180px] overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b p-1.5 flex justify-between items-center">
                        <span className="font-medium text-xs">
                          Available Games
                        </span>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => setShowGameSearchResults(false)}
                        >
                          &times;
                        </button>
                      </div>
                      {gameSearchResults.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500">
                          No games found
                        </div>
                      ) : (
                        <ul className="py-1">
                          {gameSearchResults.map((game) => (
                            <li
                              key={game.id}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
                              onClick={() => handleAddGame(game)}
                            >
                              <div className="relative h-6 w-6 rounded overflow-hidden">
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
                              <span>{game.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitAddUnit}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={
                  !newUnit.name ||
                  !newUnit.room ||
                  !newUnit.console ||
                  selectedGames.length === 0
                }
              >
                Add Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Unit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>Edit Unit</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                You can edit one or more fields. Only changed fields will be
                updated.
              </p>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Unit Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="Unit Name"
                    value={newUnit.name || ""}
                    onChange={(e) =>
                      setNewUnit({ ...newUnit, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-room" className="text-sm font-medium">
                    Room <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.room || ""}
                    onValueChange={handleRoomChange}
                  >
                    <SelectTrigger id="edit-room" className="mt-1">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.length > 0 ? (
                        rooms.map((room) => (
                          <SelectItem key={room.id} value={room.name}>
                            {room.name}{" "}
                            {typeof room.price === "number" &&
                              room.price > 0 &&
                              `(+${formatPrice(room.price)})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading rooms...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-console" className="text-sm font-medium">
                    Console <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.console || ""}
                    onValueChange={handleConsoleChange}
                  >
                    <SelectTrigger id="edit-console" className="mt-1">
                      <SelectValue placeholder="Select console" />
                    </SelectTrigger>
                    <SelectContent>
                      {consoles.length > 0 ? (
                        consoles.map((console) => (
                          <SelectItem key={console.id} value={console.model}>
                            {console.model}{" "}
                            {typeof console.price === "number" &&
                              console.price > 0 &&
                              `(+${formatPrice(console.price)})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading consoles...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="features" className="text-sm font-medium">
                    Features
                  </Label>
                  <Select
                    value={
                      newUnit.features &&
                      normalizeFeatures(newUnit.features).length > 0
                        ? normalizeFeatures(newUnit.features)[0]
                        : "none"
                    }
                    onValueChange={(value) => {
                      if (value === "none") {
                        // Clear features
                        setNewUnit((prev) => ({
                          ...prev,
                          features: [],
                        }));
                      } else {
                        // Set the selected feature
                        setNewUnit((prev) => ({
                          ...prev,
                          features: [value],
                        }));
                      }
                    }}
                  >
                    <SelectTrigger id="features" className="mt-1">
                      <SelectValue placeholder="Select a feature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="netflix">
                        Netflix (+Rp2.000)
                      </SelectItem>
                      <SelectItem value="disney+">
                        Disney+ (+Rp2.500)
                      </SelectItem>
                      <SelectItem value="nintendo_switch">
                        Nintendo Switch (+Rp3.000)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="rentPrice" className="text-sm font-medium">
                    Rent Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="rentPrice"
                      type="number"
                      placeholder="Rent Price"
                      value={newUnit.rentPrice || ""}
                      readOnly
                      className="bg-gray-100"
                    />
                    <div className="absolute right-3 top-2 text-xs text-gray-500">
                      Auto calculated
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="grid grid-cols-2 gap-1">
                      <div>Room: </div>
                      <div className="text-right">
                        {newUnit.room_id
                          ? formatPrice(
                              rooms.find((r) => r.id === newUnit.room_id)?.price
                                ? parseFloat(
                                    String(
                                      rooms.find(
                                        (r) => r.id === newUnit.room_id
                                      )?.price
                                    )
                                  )
                                : 0
                            )
                          : "Rp0"}
                      </div>

                      <div>Console: </div>
                      <div className="text-right">
                        {newUnit.console_id
                          ? formatPrice(
                              consoles.find((c) => c.id === newUnit.console_id)
                                ?.price
                                ? parseFloat(
                                    String(
                                      consoles.find(
                                        (c) => c.id === newUnit.console_id
                                      )?.price
                                    )
                                  )
                                : 0
                            )
                          : "Rp0"}
                      </div>

                      <div>Features: </div>
                      <div className="text-right">
                        {newUnit.features &&
                        normalizeFeatures(newUnit.features).length > 0
                          ? formatPrice(
                              normalizeFeatures(newUnit.features).includes(
                                "netflix"
                              )
                                ? 2000
                                : normalizeFeatures(newUnit.features).includes(
                                    "disney+"
                                  )
                                ? 2500
                                : normalizeFeatures(newUnit.features).includes(
                                    "nintendo_switch"
                                  )
                                ? 3000
                                : 0
                            )
                          : "Rp0"}
                      </div>

                      <div className="font-medium">Total: </div>
                      <div className="text-right font-medium">
                        {formatPrice(newUnit.rentPrice || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.status || "available"}
                    onValueChange={(value: string) =>
                      setNewUnit({
                        ...newUnit,
                        status: value as "available" | "booked" | "serviced",
                      })
                    }
                  >
                    <SelectTrigger id="edit-status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="serviced">In Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Game Section */}
              <div>
                <Label htmlFor="edit-game" className="text-sm font-medium">
                  Add Game <span className="text-red-500">*</span>
                </Label>

                {/* Game Search Field */}
                <div className="relative mt-1">
                  <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-md border min-h-10">
                    {selectedGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-xs"
                      >
                        <div className="relative h-3.5 w-3.5 mr-1">
                          <Image
                            src={formatImageUrl(game.image)}
                            alt={game.title}
                            fill
                            className="object-cover rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/ask.png";
                            }}
                          />
                        </div>
                        {game.title}
                        <button
                          type="button"
                          className="text-gray-500 hover:text-red-500 ml-1"
                          onClick={() => handleRemoveGame(game.id)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center flex-grow">
                      <input
                        id="edit-game"
                        value={gameSearchInput}
                        onChange={(e) => {
                          setGameSearchInput(e.target.value);
                          setShowGameSearchResults(true);
                        }}
                        onFocus={() => setShowGameSearchResults(true)}
                        className="flex-grow outline-none bg-transparent p-1 text-sm"
                        placeholder={
                          selectedGames.length > 0
                            ? "Add more games..."
                            : "Search for games..."
                        }
                      />
                      <button
                        type="button"
                        className="text-xs text-amber-600 hover:text-amber-800 px-2 whitespace-nowrap"
                        onClick={() => setShowGameSearchResults(true)}
                      >
                        Browse all
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {showGameSearchResults && (
                    <div className="absolute w-full bg-white rounded-md border shadow-md mt-1 z-10 max-h-[180px] overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b p-1.5 flex justify-between items-center">
                        <span className="font-medium text-xs">
                          Available Games
                        </span>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => setShowGameSearchResults(false)}
                        >
                          &times;
                        </button>
                      </div>
                      {gameSearchResults.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500">
                          No games found
                        </div>
                      ) : (
                        <ul className="py-1">
                          {gameSearchResults.map((game) => (
                            <li
                              key={game.id}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
                              onClick={() => handleAddGame(game)}
                            >
                              <div className="relative h-6 w-6 rounded overflow-hidden">
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
                              <span>{game.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitEditUnit}
                className="bg-amber-500 hover:bg-amber-600 w-full"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Unit Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Unit</DialogTitle>
            </DialogHeader>
            <p className="py-4">
              Are you sure you want to delete this unit? This action cannot be
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
                onClick={submitDeleteUnit}
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

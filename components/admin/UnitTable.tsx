"use client";

import { useState, useRef } from "react";
import { Search, Pencil, Trash2, Eye } from "lucide-react";
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

interface Unit {
  id: string;
  name: string;
  room: string;
  console: string;
  addOns: string;
  rentPrice: number;
  status: "Available" | "On Service";
  games: Game[];
}

interface Game {
  id: string;
  title: string;
  image: string;
}

// Sample game data
const gameData: Game[] = [
  { id: "1", title: "Netflix", image: "/images/games/1.png" },
  { id: "2", title: "Fallout", image: "/images/games/2.png" },
  { id: "3", title: "Grand Theft Auto V", image: "/images/games/3.png" },
  { id: "4", title: "It Takes Two", image: "/images/games/4.png" },
  { id: "5", title: "Gran Turismo", image: "/images/games/5.png" },
  { id: "6", title: "Cuphead", image: "/images/games/6.png" },
  { id: "7", title: "A Hat in Time", image: "/images/games/7.png" },
  { id: "8", title: "Fallout", image: "/images/games/8.png" },
  { id: "9", title: "Grand Theft Auto V", image: "/images/games/9.png" },
  { id: "10", title: "It Takes Two", image: "/images/games/10.png" },
  { id: "11", title: "Gran Turismo", image: "/images/games/11.png" },
  { id: "12", title: "Cuphead", image: "/images/games/12.png" },
];

// Sample data
const unitData: Unit[] = [
  {
    id: "1",
    name: "Regular Unit 1",
    room: "Regular",
    console: "Playstation 4",
    addOns: "-",
    rentPrice: 15000,
    status: "On Service",
    games: [gameData[0], gameData[3]],
  },
  {
    id: "2",
    name: "VIP Unit 1",
    room: "VIP",
    console: "Playstation 4",
    addOns: "Netflix",
    rentPrice: 15000,
    status: "On Service",
    games: [gameData[1], gameData[2]],
  },
  {
    id: "3",
    name: "Unit 1",
    room: "VIP",
    console: "Playstation 4",
    addOns: "Netflix, Nintendo",
    rentPrice: 25000,
    status: "Available",
    games: [gameData[4], gameData[5]],
  },
  {
    id: "4",
    name: "Unit 2",
    room: "Regular",
    console: "Playstation 5",
    addOns: "-",
    rentPrice: 15000,
    status: "Available",
    games: [gameData[6], gameData[7]],
  },
  {
    id: "5",
    name: "Unit 3",
    room: "VIP",
    console: "Playstation 5",
    addOns: "Netflix",
    rentPrice: 15000,
    status: "Available",
    games: [gameData[0], gameData[1]],
  },
  {
    id: "6",
    name: "Unit 4",
    room: "VIP",
    console: "Playstation 5",
    addOns: "Netflix",
    rentPrice: 20000,
    status: "Available",
    games: [gameData[2], gameData[3]],
  },
  {
    id: "7",
    name: "Unit 5",
    room: "VVIP",
    console: "Playstation 5",
    addOns: "-",
    rentPrice: 15000,
    status: "Available",
    games: [gameData[4], gameData[5]],
  },
];

// Sample room data
const roomOptions = ["Regular", "VIP", "VVIP"];

// Sample console data
const consoleOptions = [
  "Playstation 4",
  "Playstation 5",
  "Xbox Series X",
  "Nintendo Switch",
];

// Sample add-ons data
const addOnOptions = ["Netflix", "Nintendo", "Disney+", "Spotify Premium"];

// Pricing configuration
const basePricing = {
  room: {
    Regular: 0,
    VIP: 5000,
    VVIP: 10000,
  },
  console: {
    "Playstation 4": 10000,
    "Playstation 5": 15000,
    "Xbox Series X": 15000,
    "Nintendo Switch": 12000,
  },
  addOns: {
    "-": 0,
    Netflix: 2000,
    Nintendo: 3000,
    "Disney+": 2000,
    "Spotify Premium": 1500,
    "Netflix, Nintendo": 4500,
  },
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

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Move the game
      moveGame(dragIndex, hoverIndex);

      // Update the index for the dragged item
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
              src={game.image || "/images/game-placeholder.png"}
              alt={game.title}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/images/game-placeholder.png";
              }}
            />
          </div>
        </div>
        <span className="font-medium text-sm">{game.title}</span>
      </div>
    </div>
  );
};

export function UnitTable() {
  // State for data and filtering
  const [units, setUnits] = useState<Unit[]>(unitData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for game list modal and drag & drop
  const [isGameListOpen, setIsGameListOpen] = useState(false);
  const [games, setGames] = useState<Game[]>(gameData);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [gameSearchTerm, setGameSearchTerm] = useState("");

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState<Partial<Unit>>({
    name: "",
    room: "",
    console: "",
    addOns: "",
    rentPrice: 0,
    status: "Available",
    games: [],
  });

  // State for managing selected games in forms
  const [gameSearchInput, setGameSearchInput] = useState("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [showGameSearchResults, setShowGameSearchResults] = useState(false);

  // Format price in IDR
  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

  // Filter data based on search
  const filteredData = units.filter((unit) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      unit.name.toLowerCase().includes(searchLower) ||
      unit.room.toLowerCase().includes(searchLower) ||
      unit.console.toLowerCase().includes(searchLower)
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

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "On Service":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };

  // Calculate price based on selected options
  const calculatePrice = (room: string, console: string, addOns: string) => {
    const roomPrice = room
      ? basePricing.room[room as keyof typeof basePricing.room] || 0
      : 0;
    const consolePrice = console
      ? basePricing.console[console as keyof typeof basePricing.console] || 0
      : 0;
    const addOnsPrice = addOns
      ? basePricing.addOns[addOns as keyof typeof basePricing.addOns] || 0
      : 0;

    return roomPrice + consolePrice + addOnsPrice;
  };

  // Update price when options change
  const updatePrice = (updatedUnit: Partial<Unit>) => {
    const calculatedPrice = calculatePrice(
      updatedUnit.room || "",
      updatedUnit.console || "",
      updatedUnit.addOns || "-"
    );

    return {
      ...updatedUnit,
      rentPrice: calculatedPrice,
    };
  };

  // Handle room change
  const handleRoomChange = (value: string) => {
    setNewUnit((prev) => updatePrice({ ...prev, room: value }));
  };

  // Handle console change
  const handleConsoleChange = (value: string) => {
    setNewUnit((prev) => updatePrice({ ...prev, console: value }));
  };

  // Handle add-ons change
  const handleAddOnsChange = (value: string) => {
    setNewUnit((prev) => updatePrice({ ...prev, addOns: value }));
  };

  // Handler for CRUD operations
  const handleAddUnit = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setCurrentUnit(unit);
    setNewUnit({
      name: unit.name,
      room: unit.room,
      console: unit.console,
      addOns: unit.addOns,
      rentPrice: unit.rentPrice,
      status: unit.status,
      games: unit.games,
    });
    setSelectedGames(unit.games || []);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    setCurrentUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewUnit({
      name: "",
      room: "",
      console: "",
      addOns: "",
      rentPrice: 0,
      status: "Available",
      games: [],
    });
    setSelectedGames([]);
    setGameSearchInput("");
  };

  const submitAddUnit = () => {
    const unitToAdd: Unit = {
      id: String(units.length + 1),
      name: newUnit.name || "",
      room: newUnit.room || "",
      console: newUnit.console || "",
      addOns: newUnit.addOns || "-",
      rentPrice: newUnit.rentPrice || 0,
      status: newUnit.status || "Available",
      games: selectedGames,
    };
    setUnits([...units, unitToAdd]);
    resetForm();
    setIsAddDialogOpen(false);

    // Tambahkan toast notification sukses
    toast.success("Unit added successfully!", {
      description: `Unit "${unitToAdd.name}" has been added to the system.`,
      duration: 3000,
    });
  };

  const submitEditUnit = () => {
    if (!currentUnit) return;
    const updatedUnits = units.map((unit) => {
      if (unit.id === currentUnit.id) {
        return {
          ...unit,
          name: newUnit.name || unit.name,
          room: newUnit.room || unit.room,
          console: newUnit.console || unit.console,
          addOns: newUnit.addOns || unit.addOns,
          rentPrice: newUnit.rentPrice ?? unit.rentPrice,
          status: newUnit.status || unit.status,
          games: selectedGames,
        };
      }
      return unit;
    });
    setUnits(updatedUnits);
    setCurrentUnit(null);
    resetForm();
    setIsEditDialogOpen(false);

    // Tambahkan toast notification sukses edit
    toast.success("Unit updated successfully!", {
      description: `Unit "${newUnit.name}" has been updated.`,
      duration: 3000,
    });
  };

  const submitDeleteUnit = () => {
    if (!currentUnit) return;
    const updatedUnits = units.filter((unit) => unit.id !== currentUnit.id);
    setUnits(updatedUnits);
    setCurrentUnit(null);
    setIsDeleteDialogOpen(false);

    // Tambahkan toast notification sukses delete
    toast.success("Unit deleted successfully!", {
      description: `Unit "${currentUnit.name}" has been removed from the system.`,
      duration: 3000,
    });
  };

  // Handle opening game list modal
  const handleOpenGameList = (unit: Unit) => {
    setSelectedUnit(unit);
    setGames(unit.games || gameData);
    setIsGameListOpen(true);
  };

  // Move game function for drag and drop
  const moveGame = (dragIndex: number, hoverIndex: number) => {
    const dragGame = games[dragIndex];
    const newGames = [...games];
    newGames.splice(dragIndex, 1);
    newGames.splice(hoverIndex, 0, dragGame);
    setGames(newGames);
  };

  // Filter games based on search
  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(gameSearchTerm.toLowerCase())
  );

  // Filter games for search results
  const gameSearchResults = gameData
    .filter(
      (game) =>
        (gameSearchInput.length === 0 ||
          game.title.toLowerCase().includes(gameSearchInput.toLowerCase())) &&
        !selectedGames.some((sg) => sg.id === game.id)
    )
    .slice(0, 8); // Limit to 8 results

  // Add game to selection
  const handleAddGame = (game: Game) => {
    setSelectedGames([...selectedGames, game]);
    setGameSearchInput("");
    // Don't hide search results after adding a game
  };

  // Remove game from selection
  const handleRemoveGame = (gameId: string) => {
    setSelectedGames(selectedGames.filter((game) => game.id !== gameId));
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
                    ADD-ONS
                  </TableHead>
                  <TableHead className="font-bold text-black">
                    RENT PRICE
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
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24">
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
                      <TableCell>{unit.room}</TableCell>
                      <TableCell>{unit.console}</TableCell>
                      <TableCell>{unit.addOns}</TableCell>
                      <TableCell>{formatPrice(unit.rentPrice)}</TableCell>
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
                          {unit.status}
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
              {Math.min(lastIndex, filteredData.length)} of{" "}
              {filteredData.length} entries
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
                {selectedUnit?.console} Unit {selectedUnit?.name} Game List
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
                      {roomOptions.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}{" "}
                          {room !== "Regular"
                            ? `(+${formatPrice(
                                basePricing.room[
                                  room as keyof typeof basePricing.room
                                ]
                              )})`
                            : ""}
                        </SelectItem>
                      ))}
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
                      {consoleOptions.map((console) => (
                        <SelectItem key={console} value={console}>
                          {console} (+
                          {formatPrice(
                            basePricing.console[
                              console as keyof typeof basePricing.console
                            ]
                          )}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="addOns" className="text-sm font-medium">
                    Add-Ons
                  </Label>
                  <Select
                    value={newUnit.addOns || ""}
                    onValueChange={handleAddOnsChange}
                  >
                    <SelectTrigger id="addOns" className="mt-1">
                      <SelectValue placeholder="Select add-ons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">None</SelectItem>
                      {addOnOptions.map((addon) => (
                        <SelectItem key={addon} value={addon}>
                          {addon} (+
                          {formatPrice(
                            basePricing.addOns[
                              addon as keyof typeof basePricing.addOns
                            ]
                          )}
                          )
                        </SelectItem>
                      ))}
                      <SelectItem value="Netflix, Nintendo">
                        Netflix, Nintendo (+
                        {formatPrice(basePricing.addOns["Netflix, Nintendo"])})
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
                      onChange={(e) =>
                        setNewUnit({
                          ...newUnit,
                          rentPrice: Number(e.target.value),
                        })
                      }
                      className="bg-gray-100"
                      disabled
                    />
                    <div className="absolute right-3 top-2 text-xs text-gray-500">
                      Auto calculated
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.status || "Available"}
                    onValueChange={(value) =>
                      setNewUnit({
                        ...newUnit,
                        status: value as "Available" | "On Service",
                      })
                    }
                  >
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="On Service">On Service</SelectItem>
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
                            src={game.image || "/images/game-placeholder.png"}
                            alt={game.title}
                            fill
                            className="object-cover rounded-sm"
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
                                  src={
                                    game.image || "/images/game-placeholder.png"
                                  }
                                  alt={game.title}
                                  fill
                                  className="object-cover"
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
                      {roomOptions.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}{" "}
                          {room !== "Regular"
                            ? `(+${formatPrice(
                                basePricing.room[
                                  room as keyof typeof basePricing.room
                                ]
                              )})`
                            : ""}
                        </SelectItem>
                      ))}
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
                      {consoleOptions.map((console) => (
                        <SelectItem key={console} value={console}>
                          {console} (+
                          {formatPrice(
                            basePricing.console[
                              console as keyof typeof basePricing.console
                            ]
                          )}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-addOns" className="text-sm font-medium">
                    Add-Ons
                  </Label>
                  <Select
                    value={newUnit.addOns || ""}
                    onValueChange={handleAddOnsChange}
                  >
                    <SelectTrigger id="edit-addOns" className="mt-1">
                      <SelectValue placeholder="Select add-ons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">None</SelectItem>
                      {addOnOptions.map((addon) => (
                        <SelectItem key={addon} value={addon}>
                          {addon} (+
                          {formatPrice(
                            basePricing.addOns[
                              addon as keyof typeof basePricing.addOns
                            ]
                          )}
                          )
                        </SelectItem>
                      ))}
                      <SelectItem value="Netflix, Nintendo">
                        Netflix, Nintendo (+
                        {formatPrice(basePricing.addOns["Netflix, Nintendo"])})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="edit-rentPrice"
                    className="text-sm font-medium"
                  >
                    Rent Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="edit-rentPrice"
                      type="number"
                      placeholder="Rent Price"
                      value={newUnit.rentPrice || ""}
                      onChange={(e) =>
                        setNewUnit({
                          ...newUnit,
                          rentPrice: Number(e.target.value),
                        })
                      }
                      className="bg-gray-100"
                      disabled
                    />
                    <div className="absolute right-3 top-2 text-xs text-gray-500">
                      Auto calculated
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newUnit.status || "Available"}
                    onValueChange={(value) =>
                      setNewUnit({
                        ...newUnit,
                        status: value as "Available" | "On Service",
                      })
                    }
                  >
                    <SelectTrigger id="edit-status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="On Service">On Service</SelectItem>
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
                            src={game.image || "/images/game-placeholder.png"}
                            alt={game.title}
                            fill
                            className="object-cover rounded-sm"
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
                                  src={
                                    game.image || "/images/game-placeholder.png"
                                  }
                                  alt={game.title}
                                  fill
                                  className="object-cover"
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
                disabled={
                  !newUnit.name ||
                  !newUnit.room ||
                  !newUnit.console ||
                  selectedGames.length === 0
                }
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

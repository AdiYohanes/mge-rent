"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Pencil, Trash2, PlusCircle, GripVertical, Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Game {
  id: string;
  name: string;
  image: string;
  console: string;
  genre: string;
  units: string[];
}

// Sample data
const sampleGames: Game[] = [
  {
    id: "1",
    name: "A Hat in Time",
    image: "/images/food/beef.jpg", // Placeholder, replace with actual game images
    console: "Playstation 4",
    genre: "Multiplayer, Co-op, Action, Adventure",
    units: ["Unit A", "Unit B", "Unit C"],
  },
  {
    id: "2",
    name: "Fallout",
    image: "/images/food/chicken.jpg",
    console: "Playstation 5",
    genre: "Multiplayer, Co-op, Action, Adventure",
    units: ["Unit A", "Unit B", "Unit C"],
  },
  {
    id: "3",
    name: "It Takes Two",
    image: "/images/food/noodle1.jpg",
    console: "Playstation 5",
    genre: "Multiplayer, Co-op, Action, Adventure",
    units: ["Unit A", "Unit B", "Unit D"],
  },
  {
    id: "4",
    name: "Gran Turismo",
    image: "/images/food/soda.jpg",
    console: "Playstation 4",
    genre: "Single, Co-op, Sports, Adventure",
    units: ["Unit A"],
  },
  {
    id: "5",
    name: "Grand Theft Auto V",
    image: "/images/food/mineral.jpg",
    console: "Playstation 4",
    genre: "Single, Co-op, Sports, Adventure",
    units: ["Unit A", "Unit B"],
  },
  {
    id: "6",
    name: "Cuphead",
    image: "/images/food/popcorn.jpg",
    console: "Playstation 5",
    genre: "Single, Co-op, Sports, Adventure",
    units: ["Unit A", "Unit B", "Unit D"],
  },
  {
    id: "7",
    name: "Uncharted 4",
    image: "/images/food/noodle2.jpg",
    console: "Playstation 4",
    genre: "Single, Co-op, Sports, Adventure",
    units: ["Unit A", "Unit B", "Unit C"],
  },
];

// Game Item Component with Drag and Drop functionality
const GameItem = ({
  game,
  index,
  moveGame,
  handleEdit,
  handleDelete,
}: {
  game: Game;
  index: number;
  moveGame: (dragIndex: number, hoverIndex: number) => void;
  handleEdit: (game: Game) => void;
  handleDelete: (game: Game) => void;
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "GAME",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "GAME",
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
        <div className="relative h-16 w-12 rounded-sm overflow-hidden">
          <Image
            src={game.image || "/placeholder.svg"}
            alt={game.name}
            fill
            className="object-cover"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{game.name}</TableCell>
      <TableCell>{game.console}</TableCell>
      <TableCell>{game.genre}</TableCell>
      <TableCell>{game.units.join(", ")}</TableCell>
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

export function GamelistTable() {
  // State for data and filtering
  const [games, setGames] = useState<Game[]>(sampleGames);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: "",
    image: "",
    console: "",
    genre: "",
    units: [],
  });

  // New state for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to create preview URL when file is selected
  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setNewGame({ ...newGame, image: objectUrl });

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Function to handle file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  // Function to handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload an image file");
      }
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
      name: "",
      image: "",
      console: "",
      genre: "",
      units: [],
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // Filter data based on search
  const filteredData = games.filter((game) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      game.name.toLowerCase().includes(searchLower) ||
      game.console.toLowerCase().includes(searchLower) ||
      game.genre.toLowerCase().includes(searchLower)
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
  const handleAddGame = () => {
    resetFormWithFile();
    setIsAddDialogOpen(true);
  };

  const handleEditGame = (game: Game) => {
    setCurrentGame(game);
    setNewGame({
      name: game.name,
      image: game.image,
      console: game.console,
      genre: game.genre,
      units: game.units,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteGame = (game: Game) => {
    setCurrentGame(game);
    setIsDeleteDialogOpen(true);
  };

  // Override submitAddGame to handle the file
  const submitAddGame = () => {
    if (!newGame.name || !newGame.console || !newGame.genre) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // In a real app, you would upload the file to a server and get a URL back
    // For this demo, we're using the object URL, which will only work temporarily
    const gameToAdd: Game = {
      id: String(games.length + 1),
      name: newGame.name || "",
      image: previewUrl || "/placeholder.svg", // Use the preview URL
      console: newGame.console || "",
      genre: newGame.genre || "",
      units: newGame.units || [],
    };

    setGames([...games, gameToAdd]);
    setIsAddDialogOpen(false);
    resetFormWithFile();

    toast.success("Game added successfully!", {
      description: `${gameToAdd.name} has been added to the library.`,
    });
  };

  const submitEditGame = () => {
    if (!currentGame) return;

    if (!newGame.name || !newGame.console || !newGame.genre) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const updatedGames = games.map((game) => {
      if (game.id === currentGame.id) {
        return {
          ...game,
          name: newGame.name || game.name,
          image: newGame.image || game.image,
          console: newGame.console || game.console,
          genre: newGame.genre || game.genre,
          units: newGame.units || game.units,
        };
      }
      return game;
    });

    setGames(updatedGames);
    setCurrentGame(null);
    setIsEditDialogOpen(false);

    toast.success("Game updated successfully!", {
      description: `${newGame.name} has been updated.`,
    });
  };

  const submitDeleteGame = () => {
    if (!currentGame) return;

    const updatedGames = games.filter((game) => game.id !== currentGame.id);
    setGames(updatedGames);
    setCurrentGame(null);
    setIsDeleteDialogOpen(false);

    toast.success("Game deleted successfully!", {
      description: `${currentGame.name} has been removed from the library.`,
    });
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
                    CONSOLE
                  </TableHead>
                  <TableHead className="font-bold text-black">GENRE</TableHead>
                  <TableHead className="font-bold text-black">
                    UNIT AVAILABILITY
                  </TableHead>
                  <TableHead className="font-bold text-black text-center">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
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
              {Math.min(lastIndex, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>

            <div className="flex gap-1 self-center sm:self-auto">
              {generatePaginationButtons()}
            </div>
          </div>
        </CardContent>

        {/* Modified Add Game Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) resetFormWithFile();
          setIsAddDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle>Add Game</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div>
                <Label htmlFor="image-upload" className="text-sm font-medium block mb-1">
                  Image
                </Label>
                <div
                  className="border-2 border-dashed border-amber-200 rounded-md p-4 text-center cursor-pointer hover:bg-amber-50 transition-colors flex flex-col items-center justify-center h-32"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={handleDropzoneClick}
                >
                  <input
                    type="file"
                    id="image-upload"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 rounded-full p-1 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl("");
                          setNewGame({ ...newGame, image: "" });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-amber-500 mb-2" />
                      <span className="text-amber-500 text-sm font-medium">Drop files here or click to upload</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-sm font-medium block mb-1">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={newGame.name || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="console" className="text-sm font-medium block mb-1">
                  Console <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.console || ""}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, console: value })
                  }
                >
                  <SelectTrigger id="console">
                    <SelectValue placeholder="Phone Number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Playstation 4">Playstation 4</SelectItem>
                    <SelectItem value="Playstation 5">Playstation 5</SelectItem>
                    <SelectItem value="Xbox Series X">Xbox Series X</SelectItem>
                    <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="genre" className="text-sm font-medium block mb-1">
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newGame.genre || ""}
                  onValueChange={(value) =>
                    setNewGame({ ...newGame, genre: value })
                  }
                >
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Superadmin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Action">Action</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="RPG">RPG</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Multiplayer, Co-op, Action, Adventure">Multiplayer, Co-op, Action, Adventure</SelectItem>
                    <SelectItem value="Single, Co-op, Sports, Adventure">Single, Co-op, Sports, Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="units" className="text-sm font-medium block mb-1">
                  Unit Availability
                </Label>
                <Select
                  value={newGame.units?.length ? "units" : ""}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setNewGame({ 
                        ...newGame, 
                        units: ["Unit A", "Unit B", "Unit C", "Unit D"] 
                      });
                    } else if (value) {
                      setNewGame({ 
                        ...newGame, 
                        units: [value] 
                      });
                    }
                  }}
                >
                  <SelectTrigger id="units">
                    <SelectValue placeholder="Superadmin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="Unit A">Unit A</SelectItem>
                    <SelectItem value="Unit B">Unit B</SelectItem>
                    <SelectItem value="Unit C">Unit C</SelectItem>
                    <SelectItem value="Unit D">Unit D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitAddGame}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={!newGame.name || !newGame.console || !newGame.genre}
              >
                Add Game
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Game Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="Game Name"
                    value={newGame.name || ""}
                    onChange={(e) =>
                      setNewGame({ ...newGame, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-console" className="text-sm font-medium">
                    Console <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newGame.console || ""}
                    onValueChange={(value) =>
                      setNewGame({ ...newGame, console: value })
                    }
                  >
                    <SelectTrigger id="edit-console" className="mt-1">
                      <SelectValue placeholder="Select console" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Playstation 4">
                        Playstation 4
                      </SelectItem>
                      <SelectItem value="Playstation 5">
                        Playstation 5
                      </SelectItem>
                      <SelectItem value="Xbox Series X">
                        Xbox Series X
                      </SelectItem>
                      <SelectItem value="Nintendo Switch">
                        Nintendo Switch
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-genre" className="text-sm font-medium">
                  Genre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-genre"
                  placeholder="Game Genre (e.g., Action, Adventure, RPG)"
                  value={newGame.genre || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, genre: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-image" className="text-sm font-medium">
                  Image URL
                </Label>
                <Input
                  id="edit-image"
                  placeholder="Image URL"
                  value={newGame.image || ""}
                  onChange={(e) =>
                    setNewGame({ ...newGame, image: e.target.value })
                  }
                  className="mt-1"
                />
                <div className="flex items-center gap-3 mt-2">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                    <Image
                      src={newGame.image || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Current image preview
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button
                onClick={submitEditGame}
                className="bg-amber-500 hover:bg-amber-600 w-full"
                disabled={!newGame.name || !newGame.console || !newGame.genre}
              >
                Save Changes
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
                <span className="font-medium">{currentGame?.name}</span>? This
                action cannot be undone.
              </p>
              {currentGame && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                    <Image
                      src={currentGame.image || "/placeholder.svg"}
                      alt={currentGame.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{currentGame.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentGame.console}
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
                onClick={submitDeleteGame}
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

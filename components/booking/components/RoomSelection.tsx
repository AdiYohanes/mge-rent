import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { roomsData, specificRoomsData, gamesData } from "@/data/mockData";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Gamepad2, Check } from "lucide-react";

// Define types for room data
type Room = {
  id: number;
  category: string;
  description: string;
  price: number;
  image: string;
};

type SpecificRoom = {
  id: number;
  name: string;
  type: string;
  available: boolean;
};

type Game = {
  id: number;
  name: string;
  unit: string;
  available: boolean;
  image: string;
  description: string;
};

// Extended mock data for additional units and games
const extendedUnits: SpecificRoom[] = [
  ...specificRoomsData,
  { id: 7, name: "Unit G", type: "Regular", available: true },
  { id: 8, name: "Unit H", type: "VIP", available: true },
  { id: 9, name: "Unit I", type: "Regular", available: true },
  { id: 10, name: "Unit J", type: "VVIP", available: true },
  { id: 11, name: "Unit K", type: "VIP", available: true },
];

// Extended mock data for additional games
const extendedGames: Game[] = [
  ...gamesData,
  {
    id: 13,
    name: "Balsalgi",
    unit: "Unit G",
    available: true,
    image: "/images/games/1.png",
    description: "A popular card game with strategic gameplay mechanics.",
  },
  {
    id: 14,
    name: "Police",
    unit: "Unit H",
    available: true,
    image: "/images/games/2.png",
    description: "An action-packed law enforcement simulation game.",
  },
  {
    id: 15,
    name: "Cooking Academy 2",
    unit: "Unit I",
    available: true,
    image: "/images/games/3.png",
    description:
      "Learn to cook various dishes in this fun culinary simulation.",
  },
  {
    id: 16,
    name: "Cash Connection 2",
    unit: "Unit J",
    available: true,
    image: "/images/games/4.png",
    description: "Build your business empire in this economic strategy game.",
  },
  {
    id: 17,
    name: "League of Legends",
    unit: "Unit K",
    available: true,
    image: "/images/games/5.png",
    description: "A competitive multiplayer online battle arena game.",
  },
  {
    id: 18,
    name: "Red Dead Redemption II",
    unit: "Unit G",
    available: true,
    image: "/images/games/6.png",
    description: "An epic Western-themed action-adventure game.",
  },
  {
    id: 19,
    name: "Grand Theft Auto V",
    unit: "Unit H",
    available: true,
    image: "/images/games/7.png",
    description: "An open-world action game with multiple playable characters.",
  },
  {
    id: 20,
    name: "Valorant",
    unit: "Unit I",
    available: true,
    image: "/images/games/8.png",
    description: "A tactical first-person hero shooter game.",
  },
  {
    id: 21,
    name: "DOTA 2",
    unit: "Unit J",
    available: true,
    image: "/images/games/9.png",
    description: "A multiplayer online battle arena game with diverse heroes.",
  },
];

const RoomSelection: React.FC = () => {
  const [numberOfPeople, setNumberOfPeople] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [availableUnits, setAvailableUnits] = useState<SpecificRoom[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Handle client-side rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update available units when room selection changes
  useEffect(() => {
    if (selectedRoom) {
      const filteredUnits = extendedUnits.filter(
        (unit) => unit.type === selectedRoom.category && unit.available
      );
      setAvailableUnits(filteredUnits);
      setSelectedUnit("all"); // Reset selected unit when room changes

      // Show all games for the selected room type
      const roomTypeUnits = filteredUnits.map((unit) => unit.name);
      const availableGames = extendedGames.filter(
        (game) => roomTypeUnits.includes(game.unit) && game.available
      );
      setFilteredGames(availableGames);
      setSelectedGame(null); // Reset selected game when room changes
    } else {
      setAvailableUnits([]);
      setSelectedUnit(null);
      setFilteredGames([]);
      setSelectedGame(null);
    }
  }, [selectedRoom]);

  // Filter games based on selected unit
  useEffect(() => {
    if (selectedUnit === "all" || (selectedUnit === null && selectedRoom)) {
      // If "all" is selected or no unit selected yet but room is, show all games for that room type
      const roomTypeUnits = availableUnits.map((unit) => unit.name);
      const availableGames = extendedGames.filter(
        (game) => roomTypeUnits.includes(game.unit) && game.available
      );
      setFilteredGames(availableGames);
    } else if (selectedUnit) {
      // Show games specific to the selected unit
      const games = extendedGames.filter(
        (game) => game.unit === selectedUnit && game.available
      );
      setFilteredGames(games);
    } else {
      setFilteredGames([]);
    }
    setSelectedGame(null); // Reset selected game when unit changes
  }, [selectedUnit, selectedRoom, availableUnits]);

  // Handle change in the selected number of people
  const handlePeopleChange = (value: string) => {
    setNumberOfPeople(Number(value));
  };

  // Handle room selection
  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  // Handle unit selection
  const handleUnitChange = (value: string) => {
    setSelectedUnit(value);
  };

  // Handle game selection
  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  // Render skeleton for consistent server/client UI
  const renderSkeleton = () => (
    <div className="flex flex-col mb-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-64 mb-8 mx-auto"></div>
      <div className="h-8 bg-gray-200 rounded w-72 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );

  // For consistent server-side and client-side rendering
  return (
    <>
      {!mounted && renderSkeleton()}
      {mounted && (
        <div className="flex flex-col mb-8">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-center font-minecraft">
            Pilih Tipe Room
          </h2>

          {/* Select People */}
          <div className="flex flex-col md:flex-row justify-start items-start md:items-center mb-8 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-semibold mr-4 mb-2 md:mb-0 flex items-center">
              <div className="h-6 w-1 bg-[#B99733] mr-2"></div>
              Number of People:
            </h2>
            <Select
              value={numberOfPeople?.toString()}
              onValueChange={handlePeopleChange}
            >
              <SelectTrigger className="w-full md:w-64 max-w-xs rounded-none cursor-pointer border-[#B99733]/30 focus:ring-[#B99733]/20">
                <SelectValue placeholder="Select number of people" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((num) => (
                  <SelectItem
                    key={num}
                    value={num.toString()}
                    className="cursor-pointer"
                  >
                    {num} {num === 1 ? "person" : "people"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 md:px-0">
            {roomsData.map((room) => (
              <Card
                key={room.id}
                className={`cursor-pointer transition-all hover:shadow-md rounded-none group ${
                  selectedRoom?.id === room.id
                    ? "border-2 border-[#B99733]"
                    : "border border-gray-200 hover:border-[#B99733]/50"
                }`}
                onClick={() => handleRoomSelect(room)}
              >
                <div className="relative h-48">
                  <Image
                    src={room.image || "/placeholder.svg"}
                    alt={room.category}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=200&width=300";
                    }}
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle
                    className={`${
                      selectedRoom?.id === room.id
                        ? "text-[#B99733]"
                        : "group-hover:text-[#B99733]"
                    } transition-colors`}
                  >
                    {room.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">{room.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full rounded-none ${
                      selectedRoom?.id === room.id
                        ? "bg-[#B99733] hover:bg-[#B99733]/90"
                        : "bg-gray-200 text-gray-800 hover:bg-[#B99733]/20 hover:text-[#B99733] border border-gray-300"
                    } transition-colors`}
                  >
                    {selectedRoom?.id === room.id ? "Selected" : "Select"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* PS Unit Selection */}
          {selectedRoom && (
            <div className="mb-8 px-4 md:px-0">
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center mb-6">
                <h2 className="text-2xl font-semibold mr-4 mb-2 md:mb-0 flex items-center">
                  <div className="h-6 w-1 bg-[#B99733] mr-2"></div>
                  PS Unit Selection:
                </h2>
                <Select
                  value={selectedUnit || "all"}
                  onValueChange={handleUnitChange}
                  disabled={availableUnits.length === 0}
                >
                  <SelectTrigger className="w-full md:w-64 max-w-xs rounded-none cursor-pointer border-[#B99733]/30 focus:ring-[#B99733]/20">
                    <SelectValue placeholder="Select PS unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All Units
                    </SelectItem>
                    {availableUnits.map((unit) => (
                      <SelectItem
                        key={unit.id}
                        value={unit.name}
                        className="cursor-pointer"
                      >
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Available Game List */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <h3 className="text-xl font-bold flex items-center">
                    <Gamepad2 className="mr-2 h-5 w-5 text-[#B99733]" />
                    Game List{" "}
                    {selectedUnit && selectedUnit !== "all"
                      ? selectedUnit
                      : "for " + selectedRoom.category}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Please select the first game you want to play:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredGames.length > 0 ? (
                    filteredGames.map((game) => (
                      <Card
                        key={game.id}
                        className={`overflow-hidden rounded-none border transition-all cursor-pointer hover:shadow-sm group 
                          ${
                            selectedGame?.id === game.id
                              ? "border-2 border-[#B99733] bg-[#B99733]/5"
                              : "border-gray-200 hover:border-[#B99733]/50 hover:bg-gray-50"
                          }`}
                        onClick={() => handleGameSelect(game)}
                      >
                        <div className="flex items-center p-3">
                          {/* Game Image - Square on the left */}
                          <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 bg-gray-100 border border-gray-200 group-hover:border-[#B99733] transition-colors">
                            <Image
                              src={game.image || "/placeholder.svg"}
                              alt={game.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/placeholder.svg?height=64&width=64";
                              }}
                            />
                            {selectedGame?.id === game.id && (
                              <div className="absolute -top-2 -right-2 bg-[#B99733] rounded-full p-0.5 border-2 border-white">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Game Title - Right side */}
                          <div className="ml-3 flex-1">
                            <h4
                              className={`font-medium text-sm sm:text-base truncate 
                              ${
                                selectedGame?.id === game.id
                                  ? "text-[#B99733]"
                                  : "group-hover:text-[#B99733]"
                              } 
                              transition-colors`}
                            >
                              {game.name}
                            </h4>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 rounded-full bg-[#B99733] mr-1"></div>
                              <p className="text-xs text-gray-500">
                                Unit: {game.unit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10 bg-gray-50">
                      <Gamepad2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">
                        No games available for this selection.
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Game Summary */}
                {selectedGame && (
                  <div className="mt-6 p-4 bg-[#B99733]/10 border border-[#B99733]/20 rounded-sm">
                    <div className="flex items-center">
                      <Gamepad2 className="h-5 w-5 text-[#B99733] mr-2" />
                      <h4 className="font-medium text-[#B99733]">
                        Selected Game
                      </h4>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#B99733] mr-2"></div>
                      <p className="text-sm">
                        {selectedGame.name} ({selectedGame.unit})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RoomSelection;

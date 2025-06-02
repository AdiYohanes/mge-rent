// @ts-nocheck
// @jsx React.createElement
// @jsxRuntime classic
/// <reference types="react" />
"use client";

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
import { gamesData } from "@/data/mockData";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Gamepad2, Check, Loader2, AlertCircle } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import useBookingItemStore from "@/store/BookingItemStore";
import { RoomItem, getRoomsForDisplay } from "@/api/room/publicRoomApi";
import { UnitItem, getUnitsForDisplay } from "@/api/booking/unitPublicApi";

// Room type from the store
interface StoreRoom {
  id: number;
  category: string;
  description: string;
  price: number;
  image: string;
}

// For display in this component
interface DisplayRoom extends RoomItem {
  formattedType: string; // Capitalized room_type for display
  description: string; // Description from ROOM_DESCRIPTIONS
}

// Define game interface for consistency
type Game = {
  id: number;
  name: string;
  unit: string;
  available: boolean;
  image: string;
  description: string;
};

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

// Room descriptions by type - since API doesn't provide detailed descriptions
const ROOM_DESCRIPTIONS: Record<string, string> = {
  regular:
    "Our Regular Room offers a cozy and inviting atmosphere, perfect for relaxation and socializing.",
  vip: "Experience luxury in our VIP Room, designed for those who appreciate the finer things in life.",
  vvip: "Indulge in opulence with our VVIP Room, featuring exclusive amenities and unparalleled service.",
};

const RoomSelection: React.FC = () => {
  const [numberOfPeople, setNumberOfPeople] = useState<number>(4);
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUnits, setIsLoadingUnits] = useState<boolean>(false);
  const [unitError, setUnitError] = useState<string | null>(null);

  const { selectedRoom, setSelectedRoom } = useBookingItemStore();
  const { selectedUnitName: selectedUnit, setSelectedUnitName } =
    useBookingItemStore();
  const { selectedGame, setSelectedGame } = useBookingItemStore();
  const { selectedConsole } = useBookingItemStore();
  const [availableUnits, setAvailableUnits] = useState<UnitItem[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const mounted = useMounted();

  // Helper function to format room type
  const formatRoomType = (roomType: string): string => {
    return roomType.charAt(0).toUpperCase() + roomType.slice(1);
  };

  // Helper function to get room description
  const getRoomDescription = (roomType: string): string => {
    return (
      ROOM_DESCRIPTIONS[roomType] ||
      "A comfortable gaming space designed for ultimate entertainment."
    );
  };

  // Fetch rooms based on number of people
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const roomsData = await getRoomsForDisplay(numberOfPeople);
        console.log("Rooms from API:", roomsData);

        // Transform API data to include formatted type and description
        const enhancedRooms = roomsData.map((room) => ({
          ...room,
          formattedType: formatRoomType(room.room_type),
          description: getRoomDescription(room.room_type),
        }));

        setRooms(enhancedRooms);
      } catch (err) {
        console.error("Error fetching room data:", err);
        setError("Failed to load rooms. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [numberOfPeople]);

  // Update available units when room selection changes
  useEffect(() => {
    const fetchUnits = async () => {
      if (selectedRoom) {
        try {
          setIsLoadingUnits(true);
          setUnitError(null);

          // Get the room type (lowercase for API)
          const roomType = selectedRoom.category.toLowerCase();

          // Make sure we have a valid console model
          if (!selectedConsole || !selectedConsole.model) {
            console.log("No console selected or invalid console model");
            setUnitError("Please select a valid console first");
            setIsLoadingUnits(false);
            return;
          }

          // Use model property instead of name for API calls
          const consoleModel = selectedConsole.model; // Use the original model value (PS4, PS5)

          console.log(
            `Fetching units for console: ${consoleModel}, room type: ${roomType}`
          );

          const unitsData = await getUnitsForDisplay(consoleModel, roomType);
          console.log("Units from API:", unitsData);

          setAvailableUnits(unitsData);
          setSelectedUnitName("all"); // Reset selected unit when room changes

          // Filter games based on available units
          const unitNames = unitsData.map((unit) => unit.name);
          const availableGames = extendedGames.filter(
            (game) => unitNames.includes(game.unit) && game.available
          );
          setFilteredGames(availableGames);
          setSelectedGame(null); // Reset selected game when room changes
        } catch (err) {
          console.error("Error fetching unit data:", err);
          setUnitError("Failed to load units. Please try again later.");
          setAvailableUnits([]);
        } finally {
          setIsLoadingUnits(false);
        }
      } else {
        // Reset when no room or console is selected
        setAvailableUnits([]);
        setSelectedUnitName(null);
        setFilteredGames([]);
        setSelectedGame(null);
      }
    };

    fetchUnits();
  }, [selectedRoom, selectedConsole, setSelectedUnitName]);

  // Filter games based on selected unit
  useEffect(() => {
    if (selectedUnit === "all" || (selectedUnit === null && selectedRoom)) {
      // If "all" is selected or no unit selected yet but room is, show all games for that room type
      const unitNames = availableUnits.map((unit) => unit.name);
      const availableGames = extendedGames.filter(
        (game) => unitNames.includes(game.unit) && game.available
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

  // Handle room selection - convert DisplayRoom to StoreRoom format
  const handleRoomSelect = (room: DisplayRoom) => {
    if (selectedRoom?.id === room.id) {
      setSelectedRoom(null);
    } else {
      // Convert to the format expected by the store
      const storeRoom: StoreRoom = {
        id: room.id,
        category: formatRoomType(room.room_type), // Use formatted room type as category
        description: getRoomDescription(room.room_type),
        price: parseInt(room.price),
        image: room.image,
      };

      setSelectedRoom(storeRoom);
      console.log("Room selected:", room.name, "with ID:", room.id);
    }
  };

  // Handle unit selection
  const handleUnitChange = (value: string) => {
    setSelectedUnitName(value);
    console.log("Unit selected:", value);
  };

  // Handle game selection
  const handleGameSelect = (game: Game) => {
    if (selectedGame?.id === game.id) {
      setSelectedGame(null);
      console.log("Game deselected:", game.name);
    } else {
      setSelectedGame(game);
      console.log(
        "Game selected:",
        game.name,
        "ID:",
        game.id,
        "Unit:",
        game.unit
      );
    }
  };

  // Format price for display
  const formatPrice = (price: string): string => {
    const priceNum = parseInt(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(priceNum);
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
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#B99733]" />
              <span className="ml-2 text-xl">Loading rooms...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              <p>{error}</p>
              <Button
                className="mt-4 bg-[#B99733] hover:bg-[#8a701c]"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 md:px-0">
              {rooms.map((room) => (
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
                      alt={room.name}
                      fill
                      className="object-cover"
                      unoptimized={true}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/rooms/reguler.png?height=200&width=300";
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
                      {room.formattedType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">{room.description}</p>
                    <p className="text-sm font-semibold mt-2">
                      Capacity:{" "}
                      <span className="text-[#B99733]">
                        {room.max_visitors} people
                      </span>
                    </p>
                    <p className="text-sm font-bold mt-1 text-[#B99733]">
                      {formatPrice(room.price)}/hour
                    </p>
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
          )}

          {/* PS Unit Selection */}
          {selectedRoom && (
            <div className="mb-8 px-4 md:px-0">
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center mb-6">
                <h2 className="text-2xl font-semibold mr-4 mb-2 md:mb-0 flex items-center">
                  <div className="h-6 w-1 bg-[#B99733] mr-2"></div>
                  PS Unit Selection:
                </h2>

                {isLoadingUnits ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[#B99733] mr-2" />
                    <span className="text-sm">Loading units...</span>
                  </div>
                ) : unitError ? (
                  <div className="flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">{unitError}</span>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Available Game List */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <h3 className="text-xl font-bold flex items-center">
                    <Gamepad2 className="mr-2 h-5 w-5 text-[#B99733]" />
                    Game List{" "}
                    {selectedUnit && selectedUnit !== "all"
                      ? selectedUnit
                      : selectedRoom
                      ? "for " + selectedRoom.category
                      : ""}
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

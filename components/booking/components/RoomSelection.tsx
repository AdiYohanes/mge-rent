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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Gamepad2, Check, Loader2, AlertCircle } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import useBookingItemStore, { Game } from "@/store/BookingItemStore";
import { RoomItem, getRoomsForDisplay } from "@/api/room/publicRoomApi";
import { UnitItem, getUnitsForDisplay } from "@/api/booking/unitPublicApi";
import { PublicGame, publicGameList } from "@/api/game/gameApi";

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

// Use PublicGame interface from the API for consistency

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
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(false);
  const [gamesError, setGamesError] = useState<string | null>(null);

  const { selectedRoom, setSelectedRoom } = useBookingItemStore();
  const {
    selectedUnitName: selectedUnit,
    setSelectedUnitName,
    setSelectedUnitId,
  } = useBookingItemStore();
  const { selectedGame, setSelectedGame } = useBookingItemStore();
  const { selectedConsole } = useBookingItemStore();
  const [availableUnits, setAvailableUnits] = useState<UnitItem[]>([]);
  const [filteredGames, setFilteredGames] = useState<PublicGame[]>([]);
  const [allGames, setAllGames] = useState<PublicGame[]>([]);
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

          // Reset games when units change
          setFilteredGames([]);
          setAllGames([]);
          setSelectedGame(null);
        } catch (err) {
          console.error("Error fetching unit data:", err);
          setUnitError("Failed to load units. Please try again later.");
          setAvailableUnits([]);
          setFilteredGames([]);
        } finally {
          setIsLoadingUnits(false);
        }
      } else {
        // Reset when no room or console is selected
        setAvailableUnits([]);
        setSelectedUnitName(null);
        setFilteredGames([]);
        setAllGames([]);
        setSelectedGame(null);
      }
    };

    fetchUnits();
  }, [selectedRoom, selectedConsole, setSelectedUnitName]);

  // Fetch and filter games when a specific unit is selected
  useEffect(() => {
    const fetchGamesForUnit = async () => {
      // Only fetch games if a specific unit (not "all") is selected
      if (selectedUnit && selectedUnit !== "all" && selectedRoom) {
        setIsLoadingGames(true);
        setGamesError(null);

        try {
          // Find the selected unit in the available units
          const selectedUnitObj = availableUnits.find(
            (unit) => unit.name === selectedUnit
          );

          if (!selectedUnitObj) {
            setGamesError("Selected unit not found");
            setFilteredGames([]);
            setIsLoadingGames(false);
            return;
          }

          // Fetch games for the selected unit
          console.log(`Fetching games for unit ID: ${selectedUnitObj.id}`);
          const gamesData = await publicGameList(selectedUnitObj.id);
          console.log("Games from API:", gamesData);

          // Check for empty response
          if (!gamesData || gamesData.length === 0) {
            console.log("No games available for this unit");
            setAllGames([]);
            setFilteredGames([]);
            // Don't set an error here, just show an empty state
          } else if (Array.isArray(gamesData)) {
            // Store all fetched games
            setAllGames(gamesData);

            // Filter games that are available
            const availableGames = gamesData.filter((game) => game.available);
            setFilteredGames(availableGames);

            console.log(
              `Found ${availableGames.length} available games out of ${gamesData.length} total`
            );
          } else {
            console.error("Games data is not an array:", gamesData);
            setGamesError("Invalid games data format from server");
            setAllGames([]);
            setFilteredGames([]);
          }
        } catch (error) {
          console.error("Error fetching games:", error);
          setGamesError("Failed to load games. Please try again later.");
          setFilteredGames([]);
        } finally {
          setIsLoadingGames(false);
        }
      } else if (selectedUnit === "all") {
        // When "all" is selected, clear games and show a message to select a specific unit
        setFilteredGames([]);
      } else {
        setFilteredGames([]);
      }

      // Always reset selected game when unit changes
      setSelectedGame(null);
    };

    fetchGamesForUnit();
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
    console.log("=== Unit Selection Debug ===");
    console.log("Selected Unit Value:", value);

    // Find the selected unit object from availableUnits
    const selectedUnitObj = availableUnits.find((unit) => unit.name === value);
    console.log("Selected Unit Object:", selectedUnitObj);
    console.log("Selected Unit ID:", selectedUnitObj?.id);

    // Log current store state before update
    console.log("Store State Before Update:", {
      selectedUnitName: useBookingItemStore.getState().selectedUnitName,
      selectedUnitId: useBookingItemStore.getState().selectedUnitId,
      selectedRoom: useBookingItemStore.getState().selectedRoom,
      selectedConsole: useBookingItemStore.getState().selectedConsole,
    });

    // Update store with both name and ID
    setSelectedUnitName(value);
    setSelectedUnitId(selectedUnitObj?.id || null);

    // Log store state after update
    console.log("Store State After Update:", {
      selectedUnitName: useBookingItemStore.getState().selectedUnitName,
      selectedUnitId: useBookingItemStore.getState().selectedUnitId,
      selectedRoom: useBookingItemStore.getState().selectedRoom,
      selectedConsole: useBookingItemStore.getState().selectedConsole,
    });

    console.log("=== End Unit Selection Debug ===");
  };

  // Handle game selection
  const handleGameSelect = (game: PublicGame) => {
    if (selectedGame?.id === game.id) {
      setSelectedGame(null);
      console.log("Game deselected:", game.name);
    } else {
      // Convert PublicGame to Game type
      const gameForStore: Game = {
        id: game.id,
        name: game.name,
        unit: game.unit,
        available: game.available,
        image: game.image || "/placeholder.svg",
        description: game.description || "No description available",
      };

      setSelectedGame(gameForStore);
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

                {isLoadingGames ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-[#B99733] mr-2" />
                    <span>Loading games...</span>
                  </div>
                ) : gamesError ? (
                  <div className="col-span-full text-center py-10 bg-gray-50">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 mb-2">{gamesError}</p>
                    <Button
                      className="bg-[#B99733] hover:bg-[#8a701c]"
                      onClick={() => {
                        setGamesError(null);
                        // Trigger re-fetch of games
                        if (selectedUnit === "all") {
                          const unitNames = availableUnits.map(
                            (unit) => unit.name
                          );
                          const availableGames = allGames.filter(
                            (game) =>
                              unitNames.includes(game.unit) && game.available
                          );
                          setFilteredGames(availableGames);
                        } else if (selectedUnit) {
                          const games = allGames.filter(
                            (game) =>
                              game.unit === selectedUnit && game.available
                          );
                          setFilteredGames(games);
                        }
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
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
                )}

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

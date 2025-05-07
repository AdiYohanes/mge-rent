"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Filter,
  X,
  Calendar,
  Star,
  Clock,
  Users,
  Gamepad2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Define TypeScript interfaces
interface Game {
  id: number;
  title: string;
  category: string;
  room: "reguler" | "vip" | "vvip";
  image: string;
  rating: number;
  players: string;
  duration: string;
  description: string;
  popular: boolean;
}

interface FilterState {
  room: string;
  category: string;
  rating: number;
  popularOnly: boolean;
  search: string;
}

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface GameDetailModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for games
const gamesData: Game[] = [
  {
    id: 1,
    title: "Game One",
    category: "Playstation 3",
    room: "reguler",
    image: "/images/games/1.png",
    rating: 4.5,
    players: "1-4",
    duration: "30-60 min",
    description:
      "Experience the thrill of adventure in this action-packed game.",
    popular: true,
  },
  {
    id: 2,
    title: "Game Two",
    category: "Playstation 4",
    room: "vip",
    image: "/images/games/2.png",
    rating: 4.8,
    players: "2-6",
    duration: "45-90 min",
    description: "Immerse yourself in a world of fantasy and strategy.",
    popular: false,
  },
  {
    id: 3,
    title: "Game Three",
    category: "Playstation 5",
    room: "vvip",
    image: "/images/games/3.png",
    rating: 4.9,
    players: "1-2",
    duration: "60-120 min",
    description: "The latest installment in this award-winning franchise.",
    popular: true,
  },
  {
    id: 4,
    title: "Game Four",
    category: "Playstation 3",
    room: "reguler",
    image: "/images/games/4.png",
    rating: 4.2,
    players: "1-4",
    duration: "20-40 min",
    description: "A classic game reimagined for modern consoles.",
    popular: false,
  },
  {
    id: 5,
    title: "Game Five",
    category: "Playstation 4",
    room: "vip",
    image: "/images/games/5.png",
    rating: 4.7,
    players: "1-8",
    duration: "30-60 min",
    description: "Compete with friends in this exciting multiplayer game.",
    popular: true,
  },
  {
    id: 6,
    title: "Game Six",
    category: "Playstation 5",
    room: "vvip",
    image: "/images/games/6.png",
    rating: 4.6,
    players: "1-4",
    duration: "40-80 min",
    description: "Explore vast open worlds with stunning graphics.",
    popular: false,
  },
  {
    id: 7,
    title: "Game Seven",
    category: "Playstation 3",
    room: "reguler",
    image: "/images/games/7.png",
    rating: 4.0,
    players: "1-2",
    duration: "15-30 min",
    description: "A nostalgic journey through gaming history.",
    popular: false,
  },
  {
    id: 8,
    title: "Game Eight",
    category: "Playstation 5",
    room: "vip",
    image: "/images/games/8.png",
    rating: 4.9,
    players: "1-6",
    duration: "50-100 min",
    description: "The most anticipated game of the year.",
    popular: true,
  },
  {
    id: 9,
    title: "Game Nine",
    category: "Playstation 4",
    room: "reguler",
    image: "/images/games/9.png",
    rating: 4.3,
    players: "1-4",
    duration: "25-50 min",
    description: "An indie gem with unique gameplay mechanics.",
    popular: false,
  },
  {
    id: 10,
    title: "Game Ten",
    category: "Playstation 3",
    room: "vip",
    image: "/images/games/10.png",
    rating: 4.1,
    players: "1-2",
    duration: "30-45 min",
    description: "A challenging puzzle game for strategic minds.",
    popular: false,
  },
  {
    id: 11,
    title: "Game Eleven",
    category: "Playstation 5",
    room: "vvip",
    image: "/images/games/11.png",
    rating: 4.8,
    players: "1-8",
    duration: "60-120 min",
    description: "The ultimate party game for friends and family.",
    popular: true,
  },
  {
    id: 12,
    title: "Game Twelve",
    category: "Playstation 3",
    room: "vip",
    image: "/images/games/12.png",
    rating: 4.2,
    players: "1-4",
    duration: "20-40 min",
    description: "A thrilling racing experience with realistic physics.",
    popular: false,
  },
  {
    id: 13,
    title: "Game Thirteen",
    category: "Playstation 4",
    room: "vvip",
    image: "/images/games/13.png",
    rating: 4.7,
    players: "1-2",
    duration: "40-80 min",
    description: "An immersive story-driven adventure.",
    popular: true,
  },
  {
    id: 14,
    title: "Game Fourteen",
    category: "Playstation 5",
    room: "reguler",
    image: "/images/games/14.png",
    rating: 4.5,
    players: "1-4",
    duration: "30-60 min",
    description: "Next-gen graphics meet innovative gameplay.",
    popular: false,
  },
  {
    id: 15,
    title: "Game Fifteen",
    category: "Playstation 3",
    room: "vvip",
    image: "/images/games/15.png",
    rating: 4.0,
    players: "1-6",
    duration: "25-50 min",
    description: "A classic RPG with hundreds of hours of content.",
    popular: false,
  },
  {
    id: 16,
    title: "Game Sixteen",
    category: "Playstation 4",
    room: "reguler",
    image: "/images/games/16.png",
    rating: 4.6,
    players: "1-4",
    duration: "35-70 min",
    description: "An action-packed shooter with multiplayer modes.",
    popular: true,
  },
];

// Game Card Component with enhanced UI
const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#c8a84b]/30 hover:border-[#c8a84b]"
      onClick={onClick}
    >
      {/* Popular badge */}
      {game.popular && (
        <div className="absolute top-0 right-0 z-10">
          <Badge className="bg-[#c8a84b] text-white m-2 px-2 py-1">
            Popular
          </Badge>
        </div>
      )}

      {/* Game image with overlay */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={game.image || "/placeholder.svg"}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = "/placeholder.svg?height=400&width=600";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm line-clamp-2">{game.description}</p>
        </div>
      </div>

      {/* Game info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[#c8a84b] group-hover:text-[#b08a2e] transition-colors duration-300">
            {game.title}
          </h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="ml-1 text-sm font-medium">{game.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center">
            <Badge
              variant="outline"
              className="flex gap-1 items-center text-xs text-gray-600"
            >
              <Gamepad2 className="h-3 w-3" />
              {game.category}
            </Badge>
          </div>
          <div className="flex items-center ">
            <Badge
              variant="outline"
              className="flex gap-1 items-center text-xs text-gray-600"
            >
              <Users className="h-3 w-3" />
              {game.players}
            </Badge>
          </div>
          <div className="flex items-center ">
            <Badge
              variant="outline"
              className="flex gap-1 items-center text-xs text-gray-600"
            >
              <Clock className="h-3 w-3" />
              {game.duration}
            </Badge>
          </div>
        </div>

        {/* Room type indicator */}
        <div className="mt-3 flex items-center">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              game.room === "reguler"
                ? "bg-green-500"
                : game.room === "vip"
                ? "bg-blue-500"
                : "bg-purple-500"
            }`}
          ></span>
          <span className="text-xs text-gray-500 capitalize">
            {game.room} room
          </span>
        </div>
      </div>

      {/* Hover overlay with button */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button className="bg-[#c8a84b] hover:bg-[#b08a2e] text-white cursor-pointer">
          View Details
        </Button>
      </div>
    </motion.div>
  );
};

// Filter sidebar component
const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-xl z-50 overflow-y-auto"
        >
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Room Type Filter */}
            <div>
              <h3 className="font-semibold mb-2">Room Type</h3>
              <div className="space-y-2">
                {["All", "reguler", "vip", "vvip"].map((room) => (
                  <div key={room} className="flex items-center">
                    <input
                      type="radio"
                      id={`room-${room}`}
                      name="roomType"
                      checked={filters.room === room}
                      onChange={() => setFilters({ ...filters, room })}
                      className="h-4 w-4 text-[#c8a84b] focus:ring-[#c8a84b]"
                    />
                    <label
                      htmlFor={`room-${room}`}
                      className="ml-2 text-sm capitalize"
                    >
                      {room}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="space-y-2">
                {[
                  "Show All",
                  "Playstation 3",
                  "Playstation 4",
                  "Playstation 5",
                ].map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category}`}
                      name="category"
                      checked={filters.category === category}
                      onChange={() => setFilters({ ...filters, category })}
                      className="h-4 w-4 text-[#c8a84b] focus:ring-[#c8a84b]"
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="ml-2 text-sm"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-semibold mb-2">Minimum Rating</h3>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    rating: Number.parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c8a84b]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm font-medium">
                  {filters.rating}+ Stars
                </span>
              </div>
            </div>

            {/* Popular Only Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="popular-only"
                checked={filters.popularOnly}
                onChange={() =>
                  setFilters({ ...filters, popularOnly: !filters.popularOnly })
                }
                className="h-4 w-4 text-[#c8a84b] focus:ring-[#c8a84b] rounded"
              />
              <label htmlFor="popular-only" className="ml-2 text-sm">
                Popular games only
              </label>
            </div>

            {/* Apply and Reset Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setFilters({
                    room: "All",
                    category: "Show All",
                    rating: 0,
                    popularOnly: false,
                    search: "",
                  })
                }
              >
                Reset
              </Button>
              <Button
                className="flex-1 bg-[#c8a84b] hover:bg-[#b08a2e] text-white"
                onClick={onClose}
              >
                Apply
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Game Detail Modal
const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  isOpen,
  onClose,
}) => {
  // Close modal when clicking outside
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!game || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            ref={modalRef}
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="relative h-64 sm:h-80">
              <Image
                src={game.image || "/placeholder.svg"}
                alt={game.title}
                fill
                className="object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = "/placeholder.svg?height=400&width=600";
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
              {game.popular && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-[#c8a84b] text-white">Popular</Badge>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[#c8a84b]">
                  {game.title}
                </h2>
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">{game.rating}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{game.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Gamepad2 className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="font-medium">{game.category}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Players</div>
                    <div className="font-medium">{game.players}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{game.duration}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    className={`h-5 w-5 rounded-full mr-2 ${
                      game.room === "reguler"
                        ? "bg-green-500"
                        : game.room === "vip"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    }`}
                  ></div>
                  <div>
                    <div className="text-sm text-gray-500">Room Type</div>
                    <div className="font-medium capitalize">{game.room}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-[#c8a84b] hover:bg-[#b08a2e] text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book This Game
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="px-3">
                        <Star className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add to favorites</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Games Page Component
const GamesPage: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    room: "All",
    category: "Show All",
    rating: 0,
    popularOnly: false,
    search: "",
  });

  // State for UI
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] =
    useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [view, setView] = useState<"grid" | "list">("grid"); // 'grid' or 'list'

  // Router for navigation
  const router = useRouter();

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter games based on all criteria
  const filteredGames = gamesData.filter((game) => {
    // Room filter
    if (filters.room !== "All" && game.room !== filters.room) return false;

    // Category filter
    if (filters.category !== "Show All" && game.category !== filters.category)
      return false;

    // Rating filter
    if (game.rating < filters.rating) return false;

    // Popular only filter
    if (filters.popularOnly && !game.popular) return false;

    // Search filter
    if (
      filters.search &&
      !game.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;

    return true;
  });

  // Handle game card click
  const handleGameClick = (game: Game): void => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  // Handle book room button click
  const handleBookRoom = (): void => {
    router.push("/booking");
  };

  // Decoration elements
  const decorationColors = ["bg-[#c8a84b]", "bg-black", "bg-[#c8a84b]"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar would be here */}

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-center font-minecraft text-4xl md:text-7xl font-bold text-gray-800 mb-4">
            Our Games Collection
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Explore our extensive library of games across multiple platforms.
            Filter by room type, console, or search for your favorite titles.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            {decorationColors.map((color, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.1,
                }}
                className={`w-6 h-6 md:w-10 md:h-10 ${color} shadow-lg`}
              />
            ))}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 shadow-md mb-8 sticky top-0 z-30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search games..."
                className="pl-10 border-gray-300 focus:border-[#c8a84b] focus:ring focus:ring-[#c8a84b]/20"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.room}
                onValueChange={(value) =>
                  setFilters({ ...filters, room: value })
                }
              >
                <SelectTrigger className="w-[140px] border-gray-300">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Rooms</SelectItem>
                  <SelectItem value="reguler">Regular</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="vvip">VVIP</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsFilterSidebarOpen(true)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>

              <div className="hidden md:flex border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${
                    view === "grid" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setView("grid")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${
                    view === "list" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setView("list")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.room !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Room:{" "}
                <span className="font-medium capitalize">{filters.room}</span>
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters({ ...filters, room: "All" })}
                />
              </Badge>
            )}
            {filters.category !== "Show All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category:{" "}
                <span className="font-medium">{filters.category}</span>
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() =>
                    setFilters({ ...filters, category: "Show All" })
                  }
                />
              </Badge>
            )}
            {filters.rating > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: <span className="font-medium">{filters.rating}+</span>
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters({ ...filters, rating: 0 })}
                />
              </Badge>
            )}
            {filters.popularOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Popular Only
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters({ ...filters, popularOnly: false })}
                />
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: <span className="font-medium">{filters.search}</span>
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFilters({ ...filters, search: "" })}
                />
              </Badge>
            )}
            {(filters.room !== "All" ||
              filters.category !== "Show All" ||
              filters.rating > 0 ||
              filters.popularOnly ||
              filters.search) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={() =>
                  setFilters({
                    room: "All",
                    category: "Show All",
                    rating: 0,
                    popularOnly: false,
                    search: "",
                  })
                }
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {["Show All", "Playstation 3", "Playstation 4", "Playstation 5"].map(
            (category) => (
              <Button
                key={category}
                variant={filters.category === category ? "default" : "outline"}
                className={
                  filters.category === category
                    ? "bg-[#c8a84b] hover:bg-[#b08a2e] text-white border-none"
                    : "border-gray-300 hover:border-[#c8a84b] hover:text-[#c8a84b]"
                }
                onClick={() => setFilters({ ...filters, category })}
              >
                {category}
              </Button>
            )
          )}
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-medium">{filteredGames.length}</span>{" "}
            games
          </p>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border-2 border-gray-100">
                <Skeleton className="h-64 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}
          >
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No games found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search term
            </p>
            <Button
              onClick={() =>
                setFilters({
                  room: "All",
                  category: "Show All",
                  rating: 0,
                  popularOnly: false,
                  search: "",
                })
              }
              className="bg-[#c8a84b] hover:bg-[#b08a2e] text-white"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Book a Room Button */}
        <motion.div
          className="w-full my-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleBookRoom}
            className="w-full py-8 bg-[#c8a84b] hover:bg-[#b08a2e] text-white text-xl font-bold font-minecraft rounded-none tracking-widest"
          >
            Book a Room Now
          </Button>
        </motion.div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Game Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Footer would be here */}
    </div>
  );
};

export default GamesPage;

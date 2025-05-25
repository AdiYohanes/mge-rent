"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, STORAGE_URL } from "@/api";

// Define types for our data
interface Game {
  id: number;
  title: string;
  genre: string;
  description: string | null;
  platform: string;
  quantity_available: number;
  ordering: number;
  image: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Room {
  id: number;
  name: string;
  room_type: string;
  description: string;
  price: string;
  max_visitors: number;
  is_available: boolean;
  image: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Console {
  id: number;
  model: string;
  serial_number: string;
  price: string;
  notes: string;
  image: string | null;
  is_available: boolean;
  available_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Unit {
  id: number;
  room_id: number;
  console_id: number;
  name: string;
  game_ids: string[];
  description: string;
  status: string;
  features: string[];
  available_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface DashboardData {
  games: Game[];
  rooms: Room[];
  consoles: Console[];
  units: Unit[];
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
}

// Function to fetch games for public display
const fetchPublicGames = async (): Promise<Game[]> => {
  try {
    // Using the dashboard API endpoint
    const response = await axios.get<DashboardResponse>(
      `${API_BASE_URL}/dashboard/`,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    console.log("Dashboard API response:", response.data);

    // Check if the response has the expected structure
    if (
      response.data &&
      response.data.success === true &&
      response.data.data &&
      response.data.data.games &&
      Array.isArray(response.data.data.games)
    ) {
      return response.data.data.games;
    }

    // If data structure is unexpected, return empty array
    console.warn("Unexpected API response structure:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching public games:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API error response:", error.response.data);
      throw new Error(
        `API error: ${error.response.status} - ${error.response.statusText}`
      );
    }
    throw error;
  }
};

// Helper function to get complete image URL
const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return "/images/games/1.png";

  // If it's already a full URL, return it
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it's a path that starts with images/
  if (imagePath.startsWith("images/")) {
    return `${STORAGE_URL}/${imagePath}`;
  }

  // For paths that include storage/images
  if (imagePath.includes("storage/images")) {
    return `${STORAGE_URL}/${imagePath}`;
  }

  // Otherwise, assume it's a relative path
  return `${STORAGE_URL}/storage/${imagePath}`;
};

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        // Use our public games function
        const gamesData = await fetchPublicGames();
        setGames(gamesData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch games:", err);
        setError(err instanceof Error ? err.message : "Failed to load games");
        // No fallback to dummy data - we'll show an error message
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mb-10">
      {/* Games title at the top */}
      <div className="flex w-full p-4 gap-4 items-center justify-center mb-8">
        <div className="bg-[#B99733] w-4 h-4" />
        <h1 className="text-9xl font-minecraft">Games</h1>
        <div className="bg-[#B99733] w-4 h-4" />
      </div>
      {/* Content below the title */}
      <div className="w-full p-4 text-center">
        <p className="text-xl mb-8">Here are the available games:</p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#B99733]" />
            <p className="mt-4 text-lg">Loading games...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 py-10">
            <p className="text-xl">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#B99733] hover:bg-[#9A7B20] text-white"
            >
              Retry
            </Button>
          </div>
        ) : (
          /* Display games in a grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.length > 0 ? (
              games.map((game) => (
                <div
                  key={game.id}
                  className="group relative rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
                >
                  {/* Game Image */}
                  <Image
                    src={getImageUrl(game.image)}
                    alt={game.title || "Game"}
                    width={500}
                    height={500}
                    className="w-full h-64 object-cover group-hover:opacity-80 transition-opacity duration-300"
                    onError={(e) => {
                      // Fall back to placeholder if image fails to load
                      (e.target as HTMLImageElement).src =
                        "/images/games/1.png";
                    }}
                  />

                  {/* Overlay on hover with more details */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer p-4">
                    <h2 className="text-white text-lg sm:text-2xl font-minecraft mb-2 text-center">
                      {game.title || "Untitled Game"}
                    </h2>
                    <div className="text-white text-sm opacity-80">
                      {game.platform && <p className="mb-1">{game.platform}</p>}
                      {game.genre && <p>{game.genre}</p>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10">
                <p className="text-xl">No games available at the moment.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/games">
            <Button
              variant="ghost"
              className="border border-black rounded-none cursor-pointer text-2xl px-6 py-6 font-minecraft transition duration-300 hover:bg-[#B99733] hover:text-white transform hover:scale-105"
            >
              <Image
                src="/images/dice-icon.png"
                width={30}
                height={30}
                alt="Dice Icon"
                className="mr-2"
              />
              View More Games
            </Button>
          </Link>
        </div>
        <div className="flex w-full justify-center gap-10 py-10">
          <div className="bg-[#B99733] w-4 h-4" />
          <div className="bg-black w-4 h-4" />
          <div className="bg-[#B99733] w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default Games;

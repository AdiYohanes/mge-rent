"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api";

// Function to fetch games for public display
const fetchPublicGames = async () => {
  try {
    // Using the new dashboard API endpoint
    const response = await axios.get(`${API_BASE_URL}/dashboard/`, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    console.log("Dashboard API response:", response.data);
    return response.data.data.games || [];
  } catch (error) {
    console.error("Error fetching public games:", error);
    throw error;
  }
};

const Games = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
                    src={game.image || "/images/games/placeholder.png"}
                    alt={game.title}
                    width={500}
                    height={500}
                    className="w-full h-64 object-cover group-hover:opacity-80 transition-opacity duration-300"
                  />

                  {/* Overlay on hover with more details */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer p-4">
                    <h2 className="text-white text-lg sm:text-2xl font-minecraft mb-2">
                      {game.title}
                    </h2>
                    <div className="text-white text-sm opacity-80">
                      <p>{game.platform}</p>
                      <p>{game.genre}</p>
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

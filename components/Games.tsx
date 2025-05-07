import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

const LIST_GAMES = [
  { id: 1, title: "World of War", image: "/images/games/1.png" },
  { id: 2, title: "Game 2", image: "/images/games/2.png" },
  { id: 3, title: "Game 3", image: "/images/games/3.png" },
  { id: 4, title: "Game 4", image: "/images/games/4.png" },
  { id: 5, title: "Game 5", image: "/images/games/5.png" },
  { id: 6, title: "Game 6", image: "/images/games/6.png" },
  { id: 7, title: "Game 7", image: "/images/games/7.png" },
  { id: 8, title: "Game 8", image: "/images/games/8.png" },
  { id: 9, title: "Game 9", image: "/images/games/9.png" },
  { id: 10, title: "Game 10", image: "/images/games/10.png" },
  { id: 11, title: "Game 11", image: "/images/games/11.png" },
  { id: 12, title: "Game 12", image: "/images/games/12.png" },
  { id: 13, title: "Game 13", image: "/images/games/13.png" },
  { id: 14, title: "Game 14", image: "/images/games/14.png" },
  { id: 15, title: "Game 15", image: "/images/games/15.png" },
  { id: 16, title: "Game 16", image: "/images/games/16.png" },
];

const Games = () => {
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

        {/* Display your game list in a grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {LIST_GAMES.map((game) => (
            <div
              key={game.id}
              className="group relative rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
            >
              {/* Game Image */}
              <Image
                src={game.image}
                alt={game.title}
                width={500}
                height={500}
                className="w-full h-64 object-cover group-hover:opacity-80 transition-opacity duration-300"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-white bg-opacity-30 opacity-0 group-hover:opacity-50 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                <h2 className="text-black text-lg sm:text-2xl font-minecraft">
                  {game.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
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

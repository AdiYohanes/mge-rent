"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  ConsoleItem,
  getConsolesFlattened,
} from "@/api/console/publicConsoleApi";

const Console = () => {
  const [consoles, setConsoles] = useState<ConsoleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default description to use for all consoles
  const defaultDescription =
    "This is a place for you to grab a PlayStation, dive into epic games, and play without limits—no commitments, just pure gaming joy!";

  useEffect(() => {
    const fetchConsoles = async () => {
      try {
        setIsLoading(true);
        const consoleData = await getConsolesFlattened();
        setConsoles(consoleData);
      } catch (err) {
        console.error("Error fetching console data:", err);
        setError("An error occurred while fetching console data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsoles();
  }, []);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex w-full p-4 gap-4">
          <div className="bg-[#B99733] w-4 h-4" />
          <h1 className="text-9xl font-minecraft">Our Consoles</h1>
          <div className="bg-[#B99733] w-4 h-4" />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#B99733]" />
            <span className="ml-2 text-xl">Loading consoles...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-10 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex p-4">
            <div className="w-1/2 p-2">
              <Image
                src="/images/console/ps5.png"
                width={500}
                height={500}
                alt="empty"
                className="object-cover w-full h-full"
              />
            </div>

            {/* Text content section (half width) */}
            <div className="flex flex-col w-1/2 p-4 space-y-6">
              {consoles.map((console) => (
                <div key={console.id} className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-6xl font-minecraft text-[#b99733]">
                      {console.model === "PS4"
                        ? "Playstation 4"
                        : console.model === "PS5"
                        ? "Playstation 5"
                        : console.model}
                    </h2>
                    <Image
                      src="/images/arrow-gold.png"
                      width={60}
                      height={60}
                      alt="Arrow Icon"
                      className="w-20 h-20"
                    />
                  </div>
                  <p className="text-xl font-light">{defaultDescription}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex w-full justify-center gap-10 py-10">
          <div className="bg-[#B99733] w-4 h-4" />
          <div className="bg-black w-4 h-4" />
          <div className="bg-[#B99733] w-4 h-4" />
        </div>
      </div>
    </>
  );
};

export default Console;

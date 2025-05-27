"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { RoomItem, getRoomsForDisplay } from "@/api/room/publicRoomApi";

// Room descriptions by type - since API doesn't provide descriptions
const ROOM_DESCRIPTIONS = {
  regular:
    "Our Regular Room offers a cozy and inviting atmosphere, perfect for relaxation and socializing.",
  vip: "Experience luxury in our VIP Room, designed for those who appreciate the finer things in life.",
  vvip: "Indulge in opulence with our VVIP Room, featuring exclusive amenities and unparalleled service.",
};

const Rooms = () => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const roomsData = await getRoomsForDisplay();
        setRooms(roomsData);
      } catch (err) {
        console.error("Error fetching room data:", err);
        setError("An error occurred while fetching room data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Function to get a formatted room type for display
  const formatRoomType = (roomType: string): string => {
    return roomType.charAt(0).toUpperCase() + roomType.slice(1);
  };

  // Function to get description for a room
  const getRoomDescription = (roomType: string): string => {
    return (
      ROOM_DESCRIPTIONS[roomType as keyof typeof ROOM_DESCRIPTIONS] ||
      "A comfortable gaming space designed for ultimate entertainment."
    );
  };

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mb-10">
      {/* Rooms title at the top */}
      <div className="flex w-full p-4 gap-4 items-center justify-center mb-8">
        <div className="bg-[#B99733] w-4 h-4" />
        <h1 className="text-9xl font-minecraft">Our Rooms</h1>
        <div className="bg-[#B99733] w-4 h-4" />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#B99733]" />
          <span className="ml-2 text-xl">Loading rooms...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center p-10 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden border-2 border-slate-200 rounded-lg shadow-md"
            >
              <div className="relative w-full h-64">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-[#B99733] font-minecraft text-5xl">
                  {formatRoomType(room.room_type)}
                </CardTitle>
                <CardDescription className="text-gray-700 text-lg">
                  {getRoomDescription(room.room_type)}
                </CardDescription>
                <p className="text-lg mt-2">
                  <span className="font-semibold">Capacity:</span>{" "}
                  {room.max_visitors} people
                </p>
                <p className="text-lg text-[#B99733] font-semibold">
                  Rp {parseInt(room.price).toLocaleString()}/hour
                </p>
              </CardHeader>
              <CardFooter>
                <Button className="w-full rounded-none bg-transparent text-black text-xl border-2 border-black cursor-pointer hover:bg-[#B99733]">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex w-full justify-center gap-10 py-10">
        <div className="bg-[#B99733] w-4 h-4" />
        <div className="bg-black w-4 h-4" />
        <div className="bg-[#B99733] w-4 h-4" />
      </div>
    </div>
  );
};

export default Rooms;

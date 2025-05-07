import React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "./ui/button";

const ROOMS = [
  {
    id: 1,
    category: "Regular",
    images: "/images/rooms/reguler.png",
    description:
      "Our Regular Room offers a cozy and inviting atmosphere, perfect for relaxation and socializing.",
  },
  {
    id: 2,
    category: "VIP",
    images: "/images/rooms/vip.png",
    description:
      "Experience luxury in our VIP Room, designed for those who appreciate the finer things in life.",
  },
  {
    id: 3,
    category: "VVIP",
    images: "/images/rooms/vvip.png",
    description:
      "Indulge in opulence with our VVIP Room, featuring exclusive amenities and unparalleled service.",
  },
];

const Rooms = () => {
  return (
    <div className="flex flex-col justify-start items-center min-h-screen mb-10">
      {/* Rooms title at the top */}
      <div className="flex w-full p-4 gap-4 items-center justify-center mb-8">
        <div className="bg-[#B99733] w-4 h-4" />
        <h1 className="text-9xl font-minecraft">Our Rooms</h1>
        <div className="bg-[#B99733] w-4 h-4" />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
        {ROOMS.map((room) => (
          <Card
            key={room.id}
            className="overflow-hidden border-2 border-slate-200 rounded-lg shadow-md"
          >
            <div className="relative w-full h-100">
              <Image
                src={room.images}
                alt={room.category}
                layout="fill"
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-[#B99733] font-minecraft text-5xl">
                {room.category}
              </CardTitle>
              <CardDescription className="text-gray-700 text-lg">
                {room.description}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full rounded-none bg-transparent text-black text-xl border-2 border-black cursor-pointer hover:bg-[#B99733]">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="flex w-full justify-center gap-10 py-10">
        <div className="bg-[#B99733] w-4 h-4" />
        <div className="bg-black w-4 h-4" />
        <div className="bg-[#B99733] w-4 h-4" />
      </div>
    </div>
  );
};

export default Rooms;

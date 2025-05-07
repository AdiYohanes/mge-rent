import React, { useState } from "react";
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
import { roomsData } from "@/data/mockData"; // Ensure the data is typed correctly
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Define types for room data
type Room = {
  id: number; // Changed id type to number to match imported room data
  category: string;
  description: string;
  price: number;
  image: string;
};

const RoomSelection: React.FC = () => {
  const [numberOfPeople, setNumberOfPeople] = useState<number | null>(null); // State for the number of people
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null); // Store selected room

  // Handle change in the selected number of people
  const handlePeopleChange = (value: string) => {
    setNumberOfPeople(Number(value)); // Convert string to number
  };

  // Handle room selection
  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  return (
    <div className="flex flex-col mb-8">
      <h2 className="text-6xl font-bold mb-4 text-center font-minecraft">
        Pilih Tipe Room
      </h2>

      {/* Select People */}
      <div className="flex justify-start items-center mb-8">
        <h2 className="text-2xl font-semibold mr-4">Number of People:</h2>
        <Select
          value={numberOfPeople?.toString()} // Ensure value is a string (for Select)
          onValueChange={handlePeopleChange} // Handle change on selection
        >
          <SelectTrigger className="w-full max-w-xs rounded-none cursor-pointer">
            <SelectValue placeholder="Select number of people" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((num) => (
              <SelectItem
                key={num}
                value={num.toString()} // Ensure the value is a string
                className="cursor-pointer"
              >
                {num} {num === 1 ? "person" : "people"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Room Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {roomsData.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all hover:shadow-md rounded-none ${
              selectedRoom?.id?.toString() === room.id.toString()
                ? "border-4 border-[#B99733]"
                : ""
            }`}
            onClick={() => handleRoomSelect(room)}
          >
            <div className="relative h-48">
              <Image
                src={room.image || "/placeholder.svg"}
                alt={room.category}
                fill
                className="object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=200&width=300";
                }}
              />
            </div>
            <CardHeader>
              <CardTitle>{room.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{room.description}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-none bg-[#B99733]">
                {selectedRoom?.id === room.id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoomSelection;

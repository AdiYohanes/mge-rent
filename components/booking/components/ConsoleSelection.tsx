import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

// Define the type for Console
interface Console {
  id: number;
  name: string;
  image: string;
  description: string;
  price: string;
}

// Simplified data with only 3 consoles
const consolesData: Console[] = [
  {
    id: 1,
    name: "PlayStation 4",
    image: "/images/console/ps3.png",
    description: "Classic gaming experience with extensive game library.",
    price: "18k",
  },
  {
    id: 2,
    name: "PlayStation 5",
    image: "/images/console/ps4.png",
    description:
      "Next-gen gaming with ultra-fast loading and stunning graphics.",
    price: "28k",
  },
  {
    id: 3,
    name: "Xbox Series X",
    image: "/images/console/ps5.png",
    description:
      "Powerful performance with Game Pass and backward compatibility.",
    price: "25k",
  },
];

const ConsoleSelection = () => {
  // Define the state with proper typing
  const [selectedConsole, setSelectedConsole] = useState<Console | null>(null);

  // Handle selection with type safety
  const handleSelect = (console: Console): void => {
    if (selectedConsole?.id === console.id) {
      setSelectedConsole(null);
    } else {
      setSelectedConsole(console);
    }
  };

  // Handle image error with type safety
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ): void => {
    e.currentTarget.src = "/placeholder.svg?height=200&width=300";
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Select Your Console
      </h2>
      <p className="text-center text-gray-600 mb-12">
        Choose your preferred gaming console. Each console has a different
        hourly rate.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {consolesData.map((console) => (
          <Card
            key={console.id}
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg border cursor-pointer rounded-none ${
              selectedConsole?.id === console.id
                ? "ring-2 ring-[#B99733]" // Gold ring for selected
                : "border-gray-200"
            }`}
            onClick={() => handleSelect(console)} // Add click to select card
          >
            <div className="relative">
              <Image
                src={console.image}
                alt={console.name}
                width={400}
                height={250}
                className="object-cover w-full h-48"
                onError={handleImageError}
              />

              {/* Price badge */}
              <Badge className="absolute top-[-1.5rem] right-0 bg-[#B99733] text-white px-2 py-1 flex flex-col items-end font-minecraft rounded-none">
                <span className="text-sm m-0">Starts From</span>
                <span className="text-4xl m-0">{console.price}</span>
              </Badge>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-gray-800">
                {console.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-6">
              <p className="text-gray-600 text-sm">{console.description}</p>
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                className={`w-full rounded-md font-medium transition-all duration-300 cursor-pointer ${
                  selectedConsole?.id === console.id
                    ? "bg-[#B99733] text-white hover:bg-[#695721] shadow-md"
                    : "bg-linear-to-r from-gray-100 to-gray-200 text-gray-800 hover:bg-[#f0f0f0] border border-gray-300"
                }`}
                onClick={() => handleSelect(console)}
                aria-label={`Select ${console.name}`}
              >
                <span className="flex items-center justify-center gap-2 py-1">
                  {selectedConsole?.id === console.id ? "Selected" : "Select"}
                  <ChevronRight
                    size={16}
                    className={
                      selectedConsole?.id === console.id ? "animate-pulse" : ""
                    }
                  />
                </span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConsoleSelection;

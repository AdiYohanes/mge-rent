"use client";

import { useEffect, useState } from "react";
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
import { ChevronRight, Loader2 } from "lucide-react";
import useBookingItemStore from "@/store/BookingItemStore"; // Import Zustand store
import { getConsolesFlattened } from "@/api/console/publicConsoleApi";

// Define our local console interface that extends the API ConsoleItem
interface Console {
  id: number;
  model: string; // Original model value from API (PS4, PS5)
  name: string; // Display name (PlayStation 4, PlayStation 5)
  price: string;
  image: string;
  description: string;
}

// Console descriptions by model
const CONSOLE_DESCRIPTIONS: Record<string, string> = {
  PS4: "Classic gaming experience with extensive game library.",
  PS5: "Next-gen gaming with ultra-fast loading and stunning graphics.",
  "Xbox Series X":
    "Powerful performance with Game Pass and backward compatibility.",
};

const ConsoleSelection = () => {
  // State for API data
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Using Zustand store to manage the selected console globally
  const { selectedConsole, setSelectedConsole, resetSelectedConsole } =
    useBookingItemStore((state) => state);

  // Fetch consoles from API on component mount
  useEffect(() => {
    const fetchConsoles = async () => {
      try {
        setIsLoading(true);
        const consolesData = await getConsolesFlattened();

        // Transform API data to match our local Console interface
        const enhancedConsoles = consolesData.map((item) => ({
          ...item,
          // Keep the original model value (PS4, PS5) for API calls
          model: item.model,
          // Use friendly display names
          name:
            item.model === "PS4"
              ? "PlayStation 4"
              : item.model === "PS5"
              ? "PlayStation 5"
              : item.model,
          description:
            CONSOLE_DESCRIPTIONS[item.model] ||
            "High-quality gaming experience with the latest features.",
        }));

        console.log("Consoles with images:", enhancedConsoles);
        setConsoles(enhancedConsoles as Console[]);
      } catch (err) {
        console.error("Error fetching console data:", err);
        setError("Failed to load consoles. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsoles();
  }, []);

  // Handle selection with Zustand global state
  const handleSelect = (console: Console): void => {
    if (selectedConsole?.id === console.id) {
      resetSelectedConsole(); // Deselect if the same console is clicked
    } else {
      // Pass the console object directly - it already has the model property correctly set
      setSelectedConsole(console);

      // Use window.console to avoid naming conflict
      window.console.log(
        "Console selected:",
        console.name,
        "with ID:",
        console.id,
        "Model for API:",
        console.model
      );
    }
  };

  // Handle image error with type safety
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ): void => {
    e.currentTarget.src = "/images/games/1.png?height=200&width=300";
  };

  // Format price for display
  const formatPrice = (price: string): string => {
    const priceValue = parseInt(price);
    if (priceValue >= 1000) {
      return `${priceValue / 1000}k`;
    }
    return price;
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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#B99733]" />
          <span className="ml-2 text-xl">Loading consoles...</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {consoles.map((console) => (
                <Card
                  key={console.id}
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg border rounded-none w-full max-w-sm cursor-pointer ${
                    selectedConsole?.id === console.id
                      ? "ring-2 ring-[#B99733]" // Gold ring for selected
                      : "border-gray-200"
                  }`}
                  onClick={() => handleSelect(console)} // Add click to select card
                >
                  <div className="relative">
                    {/* Image is now coming from API with STORAGE_URL already included */}
                    <Image
                      src={console.image}
                      alt={console.name}
                      width={400}
                      height={250}
                      className="object-cover w-full h-48"
                      onError={handleImageError}
                      unoptimized={true} // Important for external images
                    />

                    {/* Price badge */}
                    <Badge className="absolute top-[-1.5rem] right-0 bg-[#B99733] text-white px-2 py-1 flex flex-col items-end font-minecraft rounded-none">
                      <span className="text-sm m-0">Starts From</span>
                      <span className="text-4xl m-0">
                        {formatPrice(console.price)}
                      </span>
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-gray-800">
                      {console.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <p className="text-gray-600 text-sm">
                      {console.description}
                    </p>
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
                        {selectedConsole?.id === console.id
                          ? "Selected"
                          : "Select"}
                        <ChevronRight
                          size={16}
                          className={
                            selectedConsole?.id === console.id
                              ? "animate-pulse"
                              : ""
                          }
                        />
                      </span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsoleSelection;

"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type FoodItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  outOfStock?: boolean;
  popular?: boolean;
};

const foodItems: FoodItem[] = [
  {
    id: "1",
    name: "Blackpepper Ricebowl",
    price: 10000,
    image: "/images/food/beef.jpg",
    category: "ricebowl",
    popular: true,
  },
  {
    id: "2",
    name: "Paket Hemat",
    price: 10000,
    image: "/images/food/chicken.jpg",
    category: "ricebowl",
  },
  {
    id: "3",
    name: "Beef",
    price: 10000,
    image: "/images/food/beef.jpg",
    category: "ricebowl",
  },
  {
    id: "4",
    name: "Cheese",
    price: 10000,
    image: "/images/food/chicken.jpg",
    category: "ricebowl",
    outOfStock: true,
  },
  {
    id: "5",
    name: "Babi Panggang",
    price: 10000,
    image: "/images/food/beef.jpg",
    category: "ricebowl",
  },
  {
    id: "6",
    name: "Ikan Bakar",
    price: 10000,
    image: "/images/food/chicken.jpg",
    category: "ricebowl",
  },
  {
    id: "7",
    name: "Blackpepper Ricebowl",
    price: 10000,
    image: "/images/food/beef.jpg",
    category: "ricebowl",
  },
  {
    id: "8",
    name: "Paket Hemat",
    price: 10000,
    image: "/images/food/chicken.jpg",
    category: "ricebowl",
  },
  {
    id: "9",
    name: "Beef",
    price: 10000,
    image: "/images/food/beef.jpg",
    category: "ricebowl",
  },
  // Noodles category
  {
    id: "10",
    name: "Mie Goreng",
    price: 12000,
    image: "/images/food/noodle1.jpg",
    category: "noodles",
  },
  {
    id: "11",
    name: "Mie Kuah",
    price: 12000,
    image: "/images/food/noodle2.jpg",
    category: "noodles",
    popular: true,
  },
  {
    id: "12",
    name: "Kwetiau",
    price: 15000,
    image: "/images/food/noodle1.jpg",
    category: "noodles",
  },
  // Snacks category
  {
    id: "13",
    name: "French Fries",
    price: 8000,
    image: "/images/food/potcips.jpg",
    category: "snacks",
    popular: true,
  },
  {
    id: "14",
    name: "Chicken Wings",
    price: 15000,
    image: "/images/food/popcorn.jpg",
    category: "snacks",
  },
  // Drinks category
  {
    id: "15",
    name: "Ice Tea",
    price: 5000,
    image: "/images/food/soda.jpg",
    category: "drinks",
  },
  {
    id: "16",
    name: "Lemon Tea",
    price: 7000,
    image: "/images/food/mineral.jpg",
    category: "drinks",
  },
];

type CartItem = {
  id: string;
  quantity: number;
};

export default function FoodSelection() {
  const [activeTab, setActiveTab] = useState("ricebowl");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleAddToCart = (id: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const getItemQuantity = (id: string) => {
    const item = cart.find((item) => item.id === id);
    return item ? item.quantity : 0;
  };

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => {
    const foodItem = foodItems.find((food) => food.id === item.id);
    return acc + (foodItem?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#B99733]">Food Menu</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#B99733] text-[#B99733] hover:bg-[#B99733]/10"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>{totalItems} items</span>
            <span className="ml-2 font-bold">{formatPrice(totalPrice)}</span>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="ricebowl"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger
            value="ricebowl"
            className={cn(
              "data-[state=active]:bg-[#B99733] data-[state=active]:text-white cursor-pointer",
              "hover:bg-[#B99733]/10 transition-colors"
            )}
          >
            Ricebowl
          </TabsTrigger>
          <TabsTrigger
            value="noodles"
            className={cn(
              "data-[state=active]:bg-[#B99733] data-[state=active]:text-white cursor-pointer",
              "hover:bg-[#B99733]/10 transition-colors"
            )}
          >
            Noodles
          </TabsTrigger>
          <TabsTrigger
            value="snacks"
            className={cn(
              "data-[state=active]:bg-[#B99733] data-[state=active]:text-white cursor-pointer",
              "hover:bg-[#B99733]/10 transition-colors"
            )}
          >
            Snacks
          </TabsTrigger>
          <TabsTrigger
            value="drinks"
            className={cn(
              "data-[state=active]:bg-[#B99733] data-[state=active]:text-white cursor-pointer",
              "hover:bg-[#B99733]/10 transition-colors"
            )}
          >
            Drinks
          </TabsTrigger>
        </TabsList>

        {["ricebowl", "noodles", "snacks", "drinks"].map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {foodItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "overflow-hidden border border-[#B99733]/20 transition-all duration-200",
                      hoveredItem === item.id &&
                        !item.outOfStock &&
                        "shadow-md scale-[1.01]",
                      item.outOfStock && "opacity-70"
                    )}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="relative h-48">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.outOfStock && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-amber-500 text-white font-bold">
                            OUT
                          </Badge>
                        </div>
                      )}
                      {item.popular && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-[#B99733] text-white">
                            Popular
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-medium text-[#B99733]">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 font-medium">
                        {formatPrice(item.price)}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      {!item.outOfStock ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-full border-[#B99733]/50 text-[#B99733] cursor-pointer",
                              "hover:bg-[#B99733]/10 transition-colors",
                              getItemQuantity(item.id) === 0 && "opacity-50"
                            )}
                            onClick={() => handleRemoveFromCart(item.id)}
                            disabled={getItemQuantity(item.id) === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {getItemQuantity(item.id)}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-[#B99733]/50 text-[#B99733] hover:bg-[#B99733]/10 transition-colors cursor-pointer"
                            onClick={() => handleAddToCart(item.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Currently unavailable
                        </span>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

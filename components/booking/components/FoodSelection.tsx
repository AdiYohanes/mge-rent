"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import useBookingItemStore, { FoodItem } from "@/store/BookingItemStore";
import { getPublicFnbs, mapFnbItemToFoodItem } from "@/api";

export default function FoodSelection() {
  const [activeTab, setActiveTab] = useState("food");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    addFoodToCart,
    removeFoodFromCart,
    getFoodItemQuantity,
    getFoodCartTotalItems,
    getFoodCartTotalPrice,
  } = useBookingItemStore();

  // Fetch food items from API
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicFnbs();

        if (response.status === "success") {
          // Map API response to our FoodItem format
          const mappedItems: FoodItem[] = [
            ...response.data.food.map((item) => ({
              ...mapFnbItemToFoodItem(item),
              category: "food",
            })),
            ...response.data.beverage.map((item) => ({
              ...mapFnbItemToFoodItem(item),
              category: "drinks",
            })),
            ...response.data.snack.map((item) => ({
              ...mapFnbItemToFoodItem(item),
              category: "snacks",
            })),
          ];

          setFoodItems(mappedItems);
        } else {
          setError("Failed to fetch food items");
        }
      } catch (err) {
        console.error("Error fetching food items:", err);
        setError("Failed to load food items. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  const handleAddToCart = (item: FoodItem) => {
    addFoodToCart(item);
  };

  const handleRemoveFromCart = (id: string) => {
    removeFoodFromCart(id);
  };

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString("id-ID")}`;
  };

  const totalItemsInCart = getFoodCartTotalItems();
  const totalPriceOfCart = getFoodCartTotalPrice();

  // Get available categories from the loaded data
  const availableCategories = [
    ...new Set(foodItems.map((item) => item.category)),
  ];

  // If we don't have the active tab in available categories, set it to the first available
  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      !availableCategories.includes(activeTab)
    ) {
      setActiveTab(availableCategories[0]);
    }
  }, [availableCategories, activeTab]);

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
            <span>{totalItemsInCart} items</span>
            <span className="ml-2 font-bold">
              {formatPrice(totalPriceOfCart)}
            </span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col space-y-4 w-full">
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-64 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <Tabs
          defaultValue={availableCategories[0] || "food"}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 mb-6">
            {availableCategories.includes("food") && (
              <TabsTrigger
                value="food"
                className={cn(
                  "data-[state=active]:bg-[#B99733] data-[state=active]:text-white cursor-pointer",
                  "hover:bg-[#B99733]/10 transition-colors"
                )}
              >
                Food
              </TabsTrigger>
            )}
            {availableCategories.includes("snacks") && (
              <TabsTrigger
                value="snacks"
                className={cn(
                  "data-[state=active]:bg-[#B99733] data-[state=active]:text-white cursor-pointer",
                  "hover:bg-[#B99733]/10 transition-colors"
                )}
              >
                Snacks
              </TabsTrigger>
            )}
            {availableCategories.includes("drinks") && (
              <TabsTrigger
                value="drinks"
                className={cn(
                  "data-[state=active]:bg-[#B99733] data-[state=active]:text-white cursor-pointer",
                  "hover:bg-[#B99733]/10 transition-colors"
                )}
              >
                Drinks
              </TabsTrigger>
            )}
          </TabsList>

          {availableCategories.map((category) => (
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
                        {item.description && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
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
                                getFoodItemQuantity(item.id) === 0 &&
                                  "opacity-50"
                              )}
                              onClick={() => handleRemoveFromCart(item.id)}
                              disabled={getFoodItemQuantity(item.id) === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">
                              {getFoodItemQuantity(item.id)}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full border-[#B99733]/50 text-[#B99733] hover:bg-[#B99733]/10 transition-colors cursor-pointer"
                              onClick={() => handleAddToCart(item)}
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

              {foodItems.filter((item) => item.category === category).length ===
                0 && (
                <div className="text-center py-8 text-gray-500">
                  No items available in this category.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

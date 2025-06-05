"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import BookingSummary from "@/components/restaurant/BookingSummary";
import FoodItemComponent from "@/components/restaurant/FoodItem";
import { useRouter } from "next/navigation";
import useRestaurantStore, { FoodItem } from "@/store/RestaurantStore";
import { getPublicFnbs, mapFnbItemToFoodItem } from "@/api";
import { useMounted } from "@/hooks/use-mounted";

// Types
// type FoodItem = { ... };
// type CartItem = FoodItem & { ... };

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RestaurantPage() {
  const mounted = useMounted();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All"); // Set initial category to "All"
  const [isBookingSummaryOpen, setIsBookingSummaryOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Zustand store integration
  const {
    cart,
    addToCart: addToCartStore,
    removeFromCart: removeFromCartStore,
    getItemQuantity: getItemQuantityFromStore,
    getCartTotalPrice: getCartTotalPriceFromStore,
    getCartTotalItems: getCartTotalItemsFromStore,
  } = useRestaurantStore();

  // Mark component as hydrated
  useEffect(() => {
    setIsClient(true);
    setIsBookingSummaryOpen(true);
  }, []);

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
        // Fallback to sample data if API fails
        setFoodItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient) {
      fetchFoodItems();
    }
  }, [isClient]);

  // Filter food items based on search term and category
  const filteredItems = foodItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeCategory === "All" || item.category === activeCategory)
  );

  // Handle adding item to cart (now uses store action)
  const handleAddToCart = (item: FoodItem) => {
    addToCartStore(item);
  };

  // Handle removing item from cart (now uses store action)
  const handleRemoveFromCart = (itemId: number) => {
    removeFromCartStore(itemId);
  };

  // Calculate total price (now uses store getter)
  const totalPrice = getCartTotalPriceFromStore();
  const totalItems = getCartTotalItemsFromStore();

  // Get available categories from the loaded data
  const categories = [...new Set(foodItems.map((item) => item.category))];

  // Handle order submission
  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    // Only access localStorage on the client
    if (mounted) {
      localStorage.setItem("restaurantCart", JSON.stringify(cart));
      localStorage.setItem("restaurantTotal", totalPrice.toString());
    }

    // Navigate to order confirmation page
    router.push("/restaurant-invoice");
  };

  return (
    <motion.div
      className="min-h-screen bg-[#fffdf4] pb-32"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Header */}
      <div className="bg-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="font-minecraft text-4xl md:text-5xl text-center">
            Food & Drinks
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Booking Summary - Only render on client side */}
        {isClient && (
          <AnimatePresence>
            {isBookingSummaryOpen && ( // Removed bookingInfo check as component doesn't use it
              <BookingSummary onClose={() => setIsBookingSummaryOpen(false)} />
            )}
          </AnimatePresence>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search food & drinks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-12 text-lg border border-gray-300 rounded-lg focus:border-[#B99733] focus:outline-none"
          />
          <Search className="absolute left-4 top-4 text-gray-400" size={22} />
        </div>

        {/* Categories */}
        <motion.div
          className="flex overflow-x-auto mb-8 pb-3 gap-3 no-scrollbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 text-lg font-medium rounded-lg whitespace-nowrap ${
                activeCategory === category
                  ? "bg-[#B99733] text-white"
                  : "bg-white text-gray-800 border border-gray-300"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Food Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-16">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-64 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : isClient ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item) => (
              <FoodItemComponent
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                image={item.image}
                description={item.description}
                quantity={getItemQuantityFromStore(item.id)}
                onAdd={() => handleAddToCart(item)}
                onRemove={() => handleRemoveFromCart(item.id)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-16">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-64 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        )}

        {/* Show message when no items found */}
        {!isLoading && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 text-lg"
          >
            No items found. Try a different search term or category.
          </motion.div>
        )}

        {/* Show error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-red-500 text-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Order Button - Now at bottom but not fixed */}
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-5 font-minecraft text-xl text-white rounded-lg shadow mt-6 mb-10 bg-[#B99733] disabled:opacity-70"
          disabled={cart.length === 0}
          onClick={handleSubmitOrder}
        >
          {isClient && cart.length > 0
            ? `Order (${totalItems} items): Rp${totalPrice.toLocaleString()}`
            : "Order"}
        </motion.button>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import BookingSummary from "@/components/restaurant/BookingSummary";
import FoodItemComponent from "@/components/restaurant/FoodItem";
import { useRouter } from "next/navigation";
import useRestaurantStore, { FoodItem } from "@/store/RestaurantStore";

// Types
// type FoodItem = { ... };
// type CartItem = FoodItem & { ... };

type BookingInfo = {
  console: string;
  roomType: string;
  dateTime: string;
  foodAndDrinks: string[];
};

// Sample data
const foodItems: FoodItem[] = [
  {
    id: 1,
    name: "Blackpepper RiceBowl",
    price: 10000,
    image: "/images/food/chicken.jpg",
    category: "Ricebowl",
  },
  {
    id: 2,
    name: "Paket Hemat",
    price: 10000,
    image: "/images/food/chicken.jpg",
    category: "Ricebowl",
  },
  {
    id: 3,
    name: "Beef",
    price: 10000,
    image: "/images/food/beef.jpg",
    category: "Ricebowl",
  },
  {
    id: 4,
    name: "Cheese",
    price: 10000,
    image: "/images/food/noodle1.jpg",
    category: "Ricebowl",
  },
  {
    id: 5,
    name: "Bakil Panggang",
    price: 10000,
    image: "/images/food/noodle2.jpg",
    category: "Ricebowl",
  },
  {
    id: 6,
    name: "Ikan Bakar",
    price: 10000,
    image: "/images/food/noodle1.jpg",
    category: "Ricebowl",
  },
  {
    id: 7,
    name: "Mie Goreng",
    price: 12000,
    image: "/images/food/noodle1.jpg",
    category: "Noodles",
  },
  {
    id: 8,
    name: "Mie Kuah",
    price: 12000,
    image: "/images/food/noodle2.jpg",
    category: "Noodles",
  },
  {
    id: 9,
    name: "French Fries",
    price: 8000,
    image: "/images/food/popcorn.jpg",
    category: "Snacks",
  },
  {
    id: 10,
    name: "Chicken Nugget",
    price: 8000,
    image: "/images/food/potcips.jpg",
    category: "Snacks",
  },
  {
    id: 11,
    name: "Coca Cola",
    price: 7000,
    image: "/images/food/soda.jpg",
    category: "Drinks",
  },
  {
    id: 12,
    name: "Mineral Water",
    price: 5000,
    image: "/images/food/mineral.jpg",
    category: "Drinks",
  },
];

// Sample booking information
const sampleBooking: BookingInfo = {
  console: "Playstation 4",
  roomType: "Regular",
  dateTime: "Friday, 23rd February 2023 at 20:00 - 21:00",
  foodAndDrinks: ["Blackpepper RiceBowl (1)", "Nasi Putih (1)"],
};

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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Ricebowl");
  const [isBookingSummaryOpen, setIsBookingSummaryOpen] = useState(true);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
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

  // Fetch booking info from localStorage
  useEffect(() => {
    // In a real app, this would come from your backend or localStorage
    setBookingInfo(sampleBooking);
  }, []);

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

  // Categories
  const categories = ["Ricebowl", "Noodles", "Snacks", "Drinks"];

  // Handle order submission
  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    // Store cart items in localStorage or state management
    localStorage.setItem("restaurantCart", JSON.stringify(cart));
    localStorage.setItem("restaurantTotal", totalPrice.toString());

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
        {/* Booking Summary */}
        <AnimatePresence>
          {isBookingSummaryOpen && bookingInfo && (
            <BookingSummary
              bookingInfo={bookingInfo}
              onClose={() => setIsBookingSummaryOpen(false)}
            />
          )}
        </AnimatePresence>

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
              quantity={getItemQuantityFromStore(item.id)}
              onAdd={() => handleAddToCart(item)}
              onRemove={() => handleRemoveFromCart(item.id)}
            />
          ))}
        </motion.div>

        {/* Show message when no items found */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 text-lg"
          >
            No items found. Try a different search term or category.
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
          {cart.length > 0
            ? `Order (${totalItems} items): Rp${totalPrice.toLocaleString()}`
            : "Order"}
        </motion.button>
      </div>
    </motion.div>
  );
}

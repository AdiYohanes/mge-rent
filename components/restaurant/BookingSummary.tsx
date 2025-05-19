import { X } from "lucide-react";
import { motion } from "framer-motion";
import useRestaurantStore from "@/store/RestaurantStore";
import { format } from "date-fns";
import { useEffect, useState } from "react";

type BookingSummaryProps = {
  onClose: () => void;
};

export default function BookingSummary({ onClose }: BookingSummaryProps) {
  const { cart: foodCart } = useRestaurantStore();
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    setCurrentDateTime(format(new Date(), "EEEE, MMMM d, yyyy 'at' HH:mm"));
  }, []);

  const foodAndDrinksDisplay =
    foodCart.length > 0
      ? foodCart.map((item) => `${item.name} (x${item.quantity})`).join(", ")
      : "No items selected";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white mb-8 shadow-lg p-6 relative rounded-lg border border-[#B99733]/20"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors p-1 hover:bg-gray-100 rounded-full"
        aria-label="Close booking summary"
      >
        <X size={20} />
      </button>
      <h2 className="font-minecraft text-2xl text-[#B99733] mb-4">
        Booking Summary
      </h2>
      <div className="grid grid-cols-1 gap-4 text-base">
        <div className="space-y-1">
          <p className="text-gray-700 font-medium">Date & Time</p>
          <p className="font-semibold text-lg">
            {currentDateTime || "Loading..."}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-700 font-medium">Food & Drinks</p>
          <p className="font-semibold text-lg">{foodAndDrinksDisplay}</p>
        </div>
      </div>
    </motion.div>
  );
}

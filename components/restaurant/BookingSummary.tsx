import { X } from "lucide-react";
import { motion } from "framer-motion";

type BookingInfo = {
  console: string;
  roomType: string;
  dateTime: string;
  foodAndDrinks: string[];
};

type BookingSummaryProps = {
  bookingInfo: BookingInfo;
  onClose: () => void;
};

export default function BookingSummary({
  bookingInfo,
  onClose,
}: BookingSummaryProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
        <div className="space-y-1">
          <p className="text-gray-700 font-medium">Console</p>
          <p className="font-semibold text-lg">{bookingInfo.console}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-700 font-medium">Room Type</p>
          <p className="font-semibold text-lg">{bookingInfo.roomType}</p>
        </div>
        <div className="space-y-1 col-span-full">
          <p className="text-gray-700 font-medium">Date & Time</p>
          <p className="font-semibold text-lg">{bookingInfo.dateTime}</p>
        </div>
        <div className="space-y-1 col-span-full">
          <p className="text-gray-700 font-medium">Food & Drinks</p>
          <p className="font-semibold text-lg">
            {bookingInfo.foodAndDrinks.length > 0
              ? bookingInfo.foodAndDrinks.join(", ")
              : "No items selected"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

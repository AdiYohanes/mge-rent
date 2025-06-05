"use client";

import { useState, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  Info,
  Gamepad2,
  Coffee,
  Clock,
  Home,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { usePathname } from "next/navigation";
import useBookingItemStore from "@/store/BookingItemStore";

interface BookingSummaryProps {
  className?: string;
  selectedDate?: Date;
}

// Define type for promo codes
type PromoCodeKey = "DISCOUNT10" | "DISCOUNT20" | "DISCOUNT30";

type PromoCodesType = {
  [key in PromoCodeKey]: number;
};

export default function BookingSummary({
  className,
  selectedDate: selectedDateProp,
}: BookingSummaryProps) {
  const pathname = usePathname();
  const showPromoCode = pathname === "/booking-confirm";

  const selectedConsole = useBookingItemStore((state) => state.selectedConsole);
  const selectedRoom = useBookingItemStore((state) => state.selectedRoom);
  const selectedUnitName = useBookingItemStore(
    (state) => state.selectedUnitName
  );
  const selectedDateFromStore = useBookingItemStore(
    (state) => state.selectedDate
  );
  const duration = useBookingItemStore((state) => state.duration);
  const selectedTime = useBookingItemStore((state) => state.selectedTime);
  const foodCart = useBookingItemStore((state) => state.foodCart);
  const getFoodCartTotalPrice = useBookingItemStore(
    (state) => state.getFoodCartTotalPrice
  );
  const endTime = useBookingItemStore((state) => state.endTime);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightTotal, setHighlightTotal] = useState(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [promoMessage, setPromoMessage] = useState("");

  // Check if summary is empty (no selections made)
  const hasConsole = Boolean(selectedConsole);
  const hasRoom = Boolean(selectedRoom);
  const hasTime = Boolean(selectedTime);
  const hasFood = foodCart.length > 0;

  // Consider summary empty if no actual selections have been made
  const isEmptySummary = !hasConsole && !hasRoom && !hasTime && !hasFood;

  // Predefined promo codes with discount percentages
  const promoCodes: PromoCodesType = {
    DISCOUNT10: 0.1, // 10% discount
    DISCOUNT20: 0.2, // 20% discount
    DISCOUNT30: 0.3, // 30% discount
  };

  // Auto-expand summary when selections are made
  useEffect(() => {
    if (!isEmptySummary && !isOpen) {
      setIsOpen(true);
    }
  }, [
    selectedConsole,
    selectedRoom,
    selectedTime,
    foodCart.length,
    isEmptySummary,
    isOpen,
  ]);

  // Tambahkan validasi untuk memastikan unit dipilih
  useEffect(() => {
    if (selectedRoom && !selectedUnitName) {
      console.warn("Room dipilih tapi unit belum dipilih");
    }
  }, [selectedRoom, selectedUnitName]);

  // Helper function to parse console price string (e.g., "18k") into a number
  const parseConsolePrice = (priceStr: string | undefined): number => {
    if (!priceStr) return 0;
    const priceLower = priceStr.toLowerCase();
    if (priceLower.endsWith("k")) {
      return parseFloat(priceLower.replace("k", "")) * 1000;
    }
    return parseFloat(priceLower) || 0;
  };

  const items = [
    {
      type: "Console",
      description: selectedConsole
        ? `${selectedConsole.name}`
        : "No console selected",
      quantity: 1,
      total: selectedConsole ? parseConsolePrice(selectedConsole.price) : 0,
      icon: <Gamepad2 size={16} className="text-indigo-500" />,
      hasUnitSelection: false,
    },
    {
      type: "Room Type",
      description: selectedRoom
        ? `${selectedRoom.category}${
            selectedUnitName ? ` - ${selectedUnitName}` : " (Pilih unit)"
          }`
        : "No room selected",
      quantity: 1,
      total: selectedRoom ? selectedRoom.price : 0,
      icon: <Home size={16} className="text-emerald-500" />,
      hasUnitSelection: false,
    },
    // Only include duration when a time has been selected
    ...(selectedTime
      ? [
          {
            type: "Duration",
            description: `${duration} Hour${duration > 1 ? "s" : ""}${
              selectedTime ? ` | Start From ${selectedTime}` : ""
            }${endTime ? ` (Ends at ${format(endTime, "HH:mm")})` : ""}`,
            quantity: 1,
            total: 30000, // This total seems static, assuming duration cost is calculated elsewhere or included in room/console
            icon: <Clock size={16} className="text-amber-500" />,
          },
        ]
      : []),
    {
      type: "Food & Drinks",
      description:
        foodCart.length > 0
          ? foodCart
              .map((item) => `${item.name} (x${item.quantity})`)
              .join(", ")
          : "No food or drinks selected",
      quantity: foodCart.reduce((acc, item) => acc + item.quantity, 0),
      total: getFoodCartTotalPrice(),
      icon: <Coffee size={16} className="text-rose-500" />,
    },
  ];

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * 0.1; // Tax calculated after discount
  const total = discountedSubtotal + tax; // Final total with tax

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      setPromoStatus("error");
      setPromoMessage("Please enter a promo code");
      return;
    }

    // Type check if the promoCode is a valid key
    if (promoCode in promoCodes) {
      const discountAmount = subtotal * promoCodes[promoCode as PromoCodeKey];
      setDiscount(discountAmount);
      setPromoStatus("success");
      setPromoMessage(
        `${
          promoCodes[promoCode as PromoCodeKey] * 100
        }% discount applied successfully!`
      );

      // Highlight total effect
      setHighlightTotal(true);
      setTimeout(() => setHighlightTotal(false), 1500);
    } else {
      setDiscount(0);
      setPromoStatus("error");
      setPromoMessage("Invalid promo code");
    }

    // Auto-hide the message after 4 seconds
    setTimeout(() => {
      setPromoStatus("idle");
      setPromoMessage("");
    }, 4000);
  };

  // Enter key to apply promo code
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApplyPromoCode();
    }
  };

  // If selectedDate is not provided, use a mock date
  // Prioritize store date, then prop, then mock date
  const dateToDisplay =
    selectedDateFromStore || selectedDateProp || new Date("2025-05-10");

  return (
    <div
      className={`w-full border border-[#B99733] rounded-lg bg-white shadow-md transition-all duration-300 ${className}`}
    >
      <div
        className="flex justify-between items-center p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1 md:gap-2">
          <h2 className="text-lg md:text-2xl font-minecraft text-[#B99733]">
            Booking Summary
          </h2>
          <Badge
            variant="outline"
            className={`text-xs md:text-sm ${
              isEmptySummary
                ? "bg-gray-50 border-gray-200 text-gray-500"
                : "bg-indigo-50 border-indigo-200"
            }`}
          >
            {isEmptySummary ? "Empty" : `${items.length} items`}
          </Badge>
        </div>
        <button
          className="text-gray-500 hover:text-indigo-600 transition-colors p-1 md:p-2 rounded-full hover:bg-indigo-50"
          aria-label={
            isOpen ? "Collapse booking summary" : "Expand booking summary"
          }
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </button>
      </div>

      {/* Date Display */}
      <div className="p-3 md:p-4 bg-[#B99733]/10 border-b border-[#B99733]/30">
        <div className="text-base md:text-lg font-semibold text-[#B99733]">
          Selected Date
        </div>
        <div className="text-sm md:text-md text-gray-700">
          {selectedDateFromStore || selectedDateProp
            ? format(dateToDisplay, "EEEE, MMMM d, yyyy")
            : "No date selected"}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 md:p-5 border-t border-gray-100">
              {/* Empty State */}
              {isEmptySummary ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <Info className="h-12 w-12 text-[#B99733]/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No selections made yet
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Your booking summary will appear here after you select a
                    console, room, and time.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-lg border border-gray-200 overflow-hidden mb-4">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableCell className="text-sm font-medium text-gray-600 py-3">
                            Item
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-600 py-3">
                            Details
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-600 py-3 text-center">
                            Qty
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-600 py-3 text-right">
                            Price
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            <TableCell className="py-3 font-medium">
                              <div className="flex items-center gap-2">
                                {item.icon}
                                {item.type}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                {item.description}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="py-3 text-right font-medium">
                              {item.total.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={3} className="py-3">
                            <div className="font-medium text-gray-700">
                              Subtotal
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-right font-medium">
                            {subtotal.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            })}
                          </TableCell>
                        </TableRow>

                        {/* Discount Row - Only show when discount exists */}
                        {discount > 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="py-3">
                              <div className="font-medium text-green-600">
                                Discount
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right font-medium text-green-600">
                              -{" "}
                              {discount.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Tax Row */}
                        <TableRow>
                          <TableCell colSpan={3} className="py-3">
                            <div className="font-medium text-gray-700">
                              Tax (10%)
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-right font-medium">
                            {tax.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            })}
                          </TableCell>
                        </TableRow>

                        {/* Total Row */}
                        <TableRow className="border-t-2 border-gray-200">
                          <TableCell colSpan={3} className="py-4">
                            <div className="font-bold text-gray-900 text-lg">
                              Total
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <motion.div
                              className="font-bold text-lg text-black"
                              animate={{
                                scale: highlightTotal ? 1.05 : 1,
                                color: highlightTotal ? "#10b981" : "#000000",
                              }}
                              transition={{ duration: 0.5 }}
                            >
                              {total.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 mb-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full w-7 h-7 flex items-center justify-center bg-gray-100">
                              {item.icon}
                            </div>
                            <span className="font-medium text-sm">
                              {item.type}
                            </span>
                          </div>
                          <div className="font-semibold text-right text-sm">
                            {item.total.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            })}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <div>{item.description}</div>
                          <div>Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}

                    {/* Mobile Summary */}
                    <div className="bg-gray-50 p-3 rounded-lg mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-700">
                          Subtotal
                        </div>
                        <div className="font-medium">
                          {subtotal.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </div>
                      </div>

                      {/* Discount - Only show when discount exists */}
                      {discount > 0 && (
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-green-600">
                            Discount
                          </div>
                          <div className="font-medium text-green-600">
                            -{" "}
                            {discount.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-700">
                          Tax (10%)
                        </div>
                        <div className="font-medium">
                          {tax.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                        <div className="font-bold text-gray-900">Total</div>
                        <motion.div
                          className="font-bold"
                          animate={{
                            scale: highlightTotal ? 1.05 : 1,
                            color: highlightTotal ? "#10b981" : "#000000",
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {total.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Section with Status Feedback */}
                  {showPromoCode && (
                    <div className="mt-5">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div className="relative flex-grow">
                          <Input
                            type="text"
                            placeholder="Enter promo code"
                            className="w-full border-[#B99733] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 rounded-md pr-10"
                            value={promoCode}
                            onChange={(e) =>
                              setPromoCode(e.target.value.toUpperCase())
                            }
                            onKeyDown={handleKeyDown}
                          />
                          {promoStatus === "success" && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                          )}
                          {promoStatus === "error" && (
                            <X className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
                          )}
                        </div>
                        <Button
                          onClick={handleApplyPromoCode}
                          className="bg-[#B99733] hover:bg-[#9e8230] text-white rounded-md whitespace-nowrap px-6"
                        >
                          Apply Code
                        </Button>
                      </div>

                      {/* Promo code message */}
                      <AnimatePresence>
                        {promoStatus !== "idle" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div
                              className={`mt-2 text-sm ${
                                promoStatus === "success"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {promoMessage}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Promo code hints */}
                      <div className="mt-2 flex items-start gap-1">
                        <Info size={14} className="text-gray-400 mt-0.5" />
                        <span className="text-xs text-gray-500">
                          Try these promo codes: DISCOUNT10, DISCOUNT20,
                          DISCOUNT30
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

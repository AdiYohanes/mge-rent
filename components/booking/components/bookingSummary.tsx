"use client";

import { useState } from "react";
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

interface BookingSummaryProps {
  className?: string;
  selectedDate?: Date;
}

// Define types for console unit selection
type ConsoleUnitType = "A" | "B" | "C" | "D" | "E" | "F";

interface UnitOption {
  id: string;
  label: string;
  status: "available" | "occupied" | "maintenance";
}

// Define type for promo codes
type PromoCodeKey = "DISCOUNT10" | "DISCOUNT20" | "DISCOUNT30";
type PromoCodesType = {
  [key in PromoCodeKey]: number;
};

export default function BookingSummary({
  className,
  selectedDate,
}: BookingSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [highlightTotal, setHighlightTotal] = useState(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [promoMessage, setPromoMessage] = useState("");
  const [selectedConsoleUnit, setSelectedConsoleUnit] =
    useState<ConsoleUnitType | null>(null);
  const [showConsoleUnitSelector, setShowConsoleUnitSelector] = useState(false);

  // Predefined promo codes with discount percentages
  const promoCodes: PromoCodesType = {
    DISCOUNT10: 0.1, // 10% discount
    DISCOUNT20: 0.2, // 20% discount
    DISCOUNT30: 0.3, // 30% discount
  };

  // Console unit options
  const consoleUnits: UnitOption[] = [
    { id: "A", label: "PS4 - Unit A", status: "available" },
    { id: "B", label: "PS4 - Unit B", status: "occupied" },
    { id: "C", label: "PS4 - Unit C", status: "available" },
    { id: "D", label: "PS4 - Unit D", status: "maintenance" },
    { id: "E", label: "PS4 - Unit E", status: "available" },
    { id: "F", label: "Xbox - Unit F", status: "available" },
  ];

  const items = [
    {
      type: "Console",
      description: `PlayStation 4${
        selectedConsoleUnit ? ` (Unit ${selectedConsoleUnit})` : ""
      }`,
      quantity: 1,
      total: 10000,
      icon: <Gamepad2 size={16} className="text-indigo-500" />,
      hasUnitSelection: true,
      unitType: "console",
    },
    {
      type: "Room Type",
      description: "Premium Suite",
      quantity: 1,
      total: 25000,
      icon: <Home size={16} className="text-emerald-500" />,
      hasUnitSelection: false,
    },
    {
      type: "Duration",
      description: "3 Hours",
      quantity: 1,
      total: 30000,
      icon: <Clock size={16} className="text-amber-500" />,
    },
    {
      type: "Food & Drinks",
      description: "Snack Combo",
      quantity: 2,
      total: 15000,
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

  // Handle unit selection
  const handleUnitSelection = (unitId: string) => {
    setSelectedConsoleUnit(unitId as ConsoleUnitType);
    setShowConsoleUnitSelector(false);

    // Highlight total effect after unit selection
    setHighlightTotal(true);
    setTimeout(() => setHighlightTotal(false), 1500);
  };

  // Toggle unit selectors
  const toggleConsoleUnitSelector = () => {
    setShowConsoleUnitSelector(!showConsoleUnitSelector);
  };

  // If selectedDate is not provided, use a mock date
  const dateToDisplay = selectedDate || new Date("2025-05-10");

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
            className="bg-indigo-50 border-indigo-200 text-xs md:text-sm"
          >
            {items.length} items
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
          {format(dateToDisplay, "EEEE, MMMM d, yyyy")}
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

                          {/* Console Unit Selector */}
                          {item.hasUnitSelection && showConsoleUnitSelector && (
                            <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm p-2 max-h-[200px] overflow-y-auto grid grid-cols-3 gap-1">
                              {consoleUnits.map((unit) => (
                                <button
                                  key={unit.id}
                                  onClick={() => handleUnitSelection(unit.id)}
                                  disabled={unit.status !== "available"}
                                  className={`text-xs py-1 px-2 rounded flex items-center justify-between ${
                                    unit.status === "available"
                                      ? "hover:bg-indigo-50 cursor-pointer"
                                      : "opacity-50 cursor-not-allowed bg-gray-100"
                                  } ${
                                    selectedConsoleUnit === unit.id
                                      ? "bg-indigo-100 border border-indigo-300"
                                      : ""
                                  }`}
                                >
                                  <span>{unit.label}</span>
                                  <span
                                    className={`ml-1 h-2 w-2 rounded-full ${
                                      unit.status === "available"
                                        ? "bg-green-500"
                                        : unit.status === "occupied"
                                        ? "bg-red-500"
                                        : "bg-amber-500"
                                    }`}
                                  ></span>
                                </button>
                              ))}
                            </div>
                          )}
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
                        <span className="font-medium text-sm">{item.type}</span>
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

                    {/* Mobile Unit Selection */}
                    {item.hasUnitSelection && (
                      <div className="mt-1">
                        <Button
                          onClick={() => toggleConsoleUnitSelector()}
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300"
                        >
                          {selectedConsoleUnit
                            ? `Console Unit: ${selectedConsoleUnit}`
                            : "Select Console Unit"}
                        </Button>

                        {/* Mobile Console Unit Selector */}
                        {showConsoleUnitSelector && (
                          <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm p-2 max-h-[150px] overflow-y-auto grid grid-cols-2 gap-1">
                            {consoleUnits.map((unit) => (
                              <button
                                key={unit.id}
                                onClick={() => handleUnitSelection(unit.id)}
                                disabled={unit.status !== "available"}
                                className={`text-xs py-1 px-2 rounded flex items-center justify-between ${
                                  unit.status === "available"
                                    ? "hover:bg-indigo-50 cursor-pointer"
                                    : "opacity-50 cursor-not-allowed bg-gray-100"
                                } ${
                                  selectedConsoleUnit === unit.id
                                    ? "bg-indigo-100 border border-indigo-300"
                                    : ""
                                }`}
                              >
                                <span>{unit.label}</span>
                                <span
                                  className={`ml-1 h-2 w-2 rounded-full ${
                                    unit.status === "available"
                                      ? "bg-green-500"
                                      : unit.status === "occupied"
                                      ? "bg-red-500"
                                      : "bg-amber-500"
                                  }`}
                                ></span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
                    Try these promo codes: DISCOUNT10, DISCOUNT20, DISCOUNT30
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
import { format } from "date-fns"; // Import format to display the date

interface BookingSummaryProps {
  className?: string;
  selectedDate?: Date; // Pass selected date as a prop
}

export default function BookingSummary({
  className,
  selectedDate,
}: BookingSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [highlightTotal, setHighlightTotal] = useState(false);

  // Simulate highlighting animation for the total when component mounts
  useEffect(() => {
    setTimeout(() => setHighlightTotal(true), 500);
    setTimeout(() => setHighlightTotal(false), 2500);
  }, []);

  const items = [
    {
      type: "Console",
      description: "PlayStation 4",
      quantity: 1,
      total: "Rp10.000",
      icon: <Gamepad2 size={16} className="text-indigo-500" />,
    },
    {
      type: "Room Type",
      description: "Premium Suite",
      quantity: 1,
      total: "Rp25.000",
      icon: <Home size={16} className="text-emerald-500" />,
    },
    {
      type: "Duration",
      description: "3 Hours",
      quantity: 1,
      total: "Rp30.000",
      icon: <Clock size={16} className="text-amber-500" />,
    },
    {
      type: "Food & Drinks",
      description: "Snack Combo",
      quantity: 2,
      total: "Rp15.000",
      icon: <Coffee size={16} className="text-rose-500" />,
    },
  ];

  const subtotal = "Rp80.000";

  // If selectedDate is not provided, use a mock date
  const dateToDisplay = selectedDate || new Date("2025-05-06"); // Hardcoded date for demonstration

  return (
    <div
      className={`w-full border border-[#B99733] rounded-none bg-white shadow-sm transition-all duration-300 ${className}`}
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
            4 items
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
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
                        </TableCell>
                        <TableCell className="py-3 text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="py-3 text-right font-medium">
                          {item.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="border-t-2 border-gray-200">
                      <TableCell colSpan={3} className="py-4">
                        <div className="font-bold text-gray-900">Subtotal</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Tax included
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <motion.div
                          className="font-bold text-lg text-black"
                          animate={{ scale: highlightTotal ? 1.05 : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {subtotal}
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
                        {item.total}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <div>{item.description}</div>
                      <div>Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}

                {/* Mobile Subtotal */}
                <div className="border-t-2 border-gray-200 pt-3 mt-4 flex justify-between items-end">
                  <div>
                    <div className="font-bold text-gray-900">Subtotal</div>
                    <div className="text-xs text-gray-500">Tax included</div>
                  </div>
                  <motion.div
                    className="font-bold text-base text-black"
                    animate={{ scale: highlightTotal ? 1.05 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {subtotal}
                  </motion.div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs md:text-sm text-gray-500 mt-2 md:mt-4 px-1 md:px-2">
                <div className="flex items-center gap-1">
                  <Info size={12} className="md:w-4 md:h-4" />
                  <span>Prices may change based on final duration</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

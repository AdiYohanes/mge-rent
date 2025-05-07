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
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors "
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-minecraft text-[#B99733]">
            Booking Summary
          </h2>
          <Badge variant="outline" className="bg-indigo-50 border-indigo-200">
            4 items
          </Badge>
        </div>
        <button
          className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
          aria-label={
            isOpen ? "Collapse booking summary" : "Expand booking summary"
          }
        >
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Date Display */}
      <div className="p-4 bg-[#B99733]/10 border-b border-[#B99733]/30">
        <div className="text-lg font-semibold text-[#B99733]">
          Selected Date
        </div>
        <div className="text-md text-gray-700">
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
            <div className="p-5 border-t border-gray-100">
              <div className="rounded-lg border border-gray-200 overflow-hidden mb-4">
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

              <div className="flex justify-between items-center text-sm text-gray-500 mt-4 px-2">
                <div className="flex items-center gap-1">
                  <Info size={14} />
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

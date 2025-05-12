"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RestaurantSuccessPage() {
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderDate, setOrderDate] = useState<string>("");

  useEffect(() => {
    // Generate random order number
    const randomOrderNumber = `ORD-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    setOrderNumber(randomOrderNumber);

    // Set current date
    const now = new Date();
    setOrderDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF4] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Success Image */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="animate-bounce-slow">
            <Image
              src="/images/success.png"
              width={240}
              height={240}
              alt="Success Logo"
              className="drop-shadow-lg w-auto h-auto"
              priority
            />
          </div>
          <div className="absolute -top-4 -right-4">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-[#B99733] animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-4">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[#B99733] animate-pulse" />
          </div>
        </div>

        {/* Main Text */}
        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 text-[#B99733] drop-shadow-sm px-2">
          Your Order has been placed!
        </h1>

        {/* Order ID */}
        <div className="mb-4 sm:mb-6 text-center w-full px-2">
          <div className="bg-[#B99733]/10 py-3 px-4 sm:px-6 rounded-lg border border-[#B99733]/20">
            <p className="text-gray-700 mb-1 font-medium text-sm sm:text-base">
              Order ID
            </p>
            <p className="text-[#B99733] text-lg sm:text-xl font-bold">
              {orderNumber}
            </p>
          </div>
        </div>

        {/* Order Date */}
        <div className="mb-4 sm:mb-6 text-center w-full px-2">
          <div className="bg-[#B99733]/10 py-3 px-4 sm:px-6 rounded-lg border border-[#B99733]/20">
            <p className="text-gray-700 mb-1 font-medium text-sm sm:text-base">
              Order Date
            </p>
            <p className="text-[#B99733] text-base sm:text-lg font-medium">
              {orderDate}
            </p>
          </div>
        </div>

        {/* Delivery Message */}
        <div className="mb-6 sm:mb-8 text-center bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100 w-full mx-2">
          <p className="text-gray-700 text-sm sm:text-base">
            Your food will be ready in approximately{" "}
            <span className="font-bold text-green-600">15-20 minutes</span>.
          </p>
          <p className="text-gray-700 font-medium text-sm sm:text-base">
            We&apos;ll deliver it to your room soon!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full px-2">
          <Link href="/restaurant" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#B99733] text-[#B99733] hover:bg-[#B99733]/10 h-10 sm:h-12 text-sm sm:text-base rounded-none"
            >
              Back to Menu
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full bg-[#B99733] hover:bg-[#B99733]/90 h-10 sm:h-12 text-sm sm:text-base rounded-none">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

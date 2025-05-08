// pages/booking-success.tsx
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

const BookingSuccess = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id") || "ASHFK123490FK";

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
          Your Booking has been made!
        </h1>

        {/* Booking ID */}
        <div className="mb-4 sm:mb-6 text-center w-full px-2">
          <div className="bg-[#B99733]/10 py-3 px-4 sm:px-6 rounded-lg border border-[#B99733]/20">
            <p className="text-gray-700 mb-1 font-medium text-sm sm:text-base">
              Booking ID
            </p>
            <p className="text-[#B99733] text-lg sm:text-xl font-bold">
              {bookingId}
            </p>
          </div>
        </div>

        {/* WhatsApp Message */}
        <div className="mb-6 sm:mb-8 text-center bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100 w-full mx-2">
          <p className="text-gray-700 text-sm sm:text-base">
            We will send you a confirmation and payment information through{" "}
            <span className="font-bold text-green-600">Whatsapp</span>.
          </p>
          <p className="text-gray-700 font-medium text-sm sm:text-base">
            Please sit tight!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full px-2">
          <Link href="/booking/history" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#B99733] text-[#B99733] hover:bg-[#B99733]/10 h-10 sm:h-12 text-sm sm:text-base rounded-none"
            >
              See Booking History
            </Button>
          </Link>
          <Link href="/booking" className="flex-1">
            <Button className="w-full bg-[#B99733] hover:bg-[#B99733]/90 h-10 sm:h-12 text-sm sm:text-base rounded-none">
              Book Another Room
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

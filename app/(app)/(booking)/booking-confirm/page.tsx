"use client";

import { useState } from "react";
import BookingSummary from "@/components/booking/components/bookingSummary";
import PersonalInfo from "@/components/booking/components/PersonalInfo";
import PaymentMethod, {
  type PaymentType,
} from "@/components/booking/components/PaymentMethod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/booking/components/confirmationModal";

interface BookingConfirmCompProps {
  onConfirm?: () => Promise<void>;
  className?: string;
}

const BookingConfirmComponent = ({
  onConfirm,
  className,
}: BookingConfirmCompProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("qris");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePaymentClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);
      // If onConfirm is provided, call it
      if (onConfirm) {
        await onConfirm();
      }
      // Simulate API call if no handler is provided
      else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      // Close the modal after successful processing
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error confirming booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("container mx-auto", className)}>
      <div className="flex flex-col lg:flex-row justify-between items-start min-h-screen p-12 bg-gray-100">
        {/* Left Column (Personal Info & Payment Method) */}
        <div className="flex flex-col w-full lg:w-1/2 mb-8 lg:mb-0 lg:mr-6 space-y-6">
          {/* Personal Info Card */}
          <div className="flex flex-col bg-white shadow-xl rounded-lg p-8">
            <h2 className="text-3xl font-semibold text-[#333] mb-6">
              Personal Info
            </h2>
            <PersonalInfo />
          </div>

          {/* Payment Method Card */}
          <div className="flex flex-col bg-white shadow-xl rounded-lg p-8">
            <PaymentMethod onSelect={setPaymentMethod} />
          </div>
        </div>

        {/* Right Column (Booking Summary) */}
        <div className="flex flex-col w-full lg:w-1/2 bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-3xl font-semibold text-[#333] mb-6">
            Booking Summary
          </h2>
          <BookingSummary />

          {/* Button Confirm */}
          <div className="mt-8">
            <Button
              onClick={handlePaymentClick}
              disabled={isSubmitting}
              className="w-full mt-6 bg-[#B99733] text-white rounded-none py-4 text-xl hover:bg-[#b99733]/80 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            >
              Book a Room
            </Button>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              By confirming, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        paymentMethod={paymentMethod}
        amount="Rp 1.250.000"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default function BookingConfirmPage() {
  return <BookingConfirmComponent />;
}

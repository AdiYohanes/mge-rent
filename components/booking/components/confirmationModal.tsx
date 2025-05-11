"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentMethod: string;
  amount: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  amount,
  isLoading = false,
}: ConfirmationModalProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>("");

  useEffect(() => {
    // Generate booking ID only on client side
    setBookingId(`BK-${Math.floor(Math.random() * 10000)}`);
  }, []);

  const handleConfirm = () => {
    onConfirm();
    router.push(`/booking-success?id=${bookingId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Confirm Your Booking
          </DialogTitle>
          <DialogDescription className="text-center">
            Please review your booking details before proceeding with payment
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="bg-amber-50 rounded-full p-6 mb-4">
            <Image
              src="/images/ask.png"
              alt="Logo"
              width={40}
              height={40}
              className="h-auto w-auto object-contain"
            />
          </div>

          <h3 className="text-lg font-semibold mb-2">
            Ready to complete your booking?
          </h3>
          <p className="text-center text-muted-foreground mb-4">
            You&apos;re about to confirm your booking and proceed with payment
            using {paymentMethod}.
          </p>

          <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium">
                {paymentMethod === "qris" ? "QRIS" : "Bank Transfer"}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold text-[#B99733]">{amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Booking ID:</span>
              <span className="font-medium">{bookingId || "Loading..."}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:flex-1 cursor-pointer"
            disabled={isLoading}
          >
            Change details
          </Button>
          <Button
            onClick={handleConfirm}
            className="sm:flex-1 bg-[#B99733] hover:bg-[#b99733]/80 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

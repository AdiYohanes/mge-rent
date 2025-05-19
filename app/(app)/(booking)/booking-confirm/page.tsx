"use client";

import { useState, useEffect } from "react";
import BookingSummary from "@/components/booking/components/bookingSummary";
import PersonalInfo from "@/components/booking/components/PersonalInfo";
import PaymentMethod, {
  type PaymentType,
} from "@/components/booking/components/PaymentMethod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/booking/components/confirmationModal";
import { useMounted } from "@/hooks/use-mounted";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Define a type for the user data we expect from the cookie
interface UserData {
  username: string;
  email?: string; // Optional, adjust based on your actual user object
  phone?: string; // Optional
  // Add other relevant fields
}

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
  const [loggedInUser, setLoggedInUser] = useState<UserData | null>(null);
  const [isPersonalInfoValid, setIsPersonalInfoValid] = useState(false);
  const [useAccountInfo, setUseAccountInfo] = useState(false);
  const mounted = useMounted();

  // Helper function to get a cookie by name (can be moved to a utils file)
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null; // Guard for SSR
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  useEffect(() => {
    if (mounted) {
      const userCookie = getCookie("loggedInUser");
      if (userCookie) {
        try {
          const parsedUser: UserData = JSON.parse(userCookie);
          setLoggedInUser(parsedUser);
          // If user data is present, consider auto-checking the box and pre-validating if applicable
          // For now, we'll let the user explicitly check the box.
        } catch (e) {
          console.error("Error parsing user cookie:", e);
          setLoggedInUser(null);
        }
      }
    }
  }, [mounted]);

  const handleUseAccountInfoChange = (checked: boolean) => {
    if (checked) {
      if (loggedInUser) {
        setUseAccountInfo(true);
        // Optionally, if PersonalInfo could be immediately validated with loggedInUser data:
        // checkIfUserDataIsValid(loggedInUser); // You would need a function like this
      } else {
        toast.error("Please log in to use your saved information.");
        setUseAccountInfo(false); // Keep it unchecked or uncheck it
      }
    } else {
      setUseAccountInfo(false);
      // When unchecked, PersonalInfo might need to be cleared or re-validated as empty
      // setIsPersonalInfoValid(false); // Or let PersonalInfo handle its own validity when data is cleared
    }
  };

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
            {mounted && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useAccountInfoCheckbox"
                    checked={useAccountInfo}
                    onCheckedChange={handleUseAccountInfoChange}
                    className="data-[state=checked]:bg-[#B99733] data-[state=checked]:border-[#B99733] border-gray-400"
                  />
                  <Label
                    htmlFor="useAccountInfoCheckbox"
                    className="cursor-pointer text-sm font-medium text-gray-700"
                  >
                    Use my account information
                  </Label>
                </div>
              </div>
            )}
            {mounted ? (
              <PersonalInfo
                initialData={
                  useAccountInfo && loggedInUser ? loggedInUser : null
                }
                onValidityChange={setIsPersonalInfoValid}
                key={useAccountInfo ? "autofilled" : "manual"}
              />
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            )}
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
              disabled={isSubmitting || (mounted && !isPersonalInfoValid)}
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

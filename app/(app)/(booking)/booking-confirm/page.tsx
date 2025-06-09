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
import { getUserFromCookie } from "@/utils/cookieUtils";
import useBookingItemStore from "@/store/BookingItemStore";
import { post } from "@/api/apiUtils";
import { BOOKING_ENDPOINTS } from "@/api/constants";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Define types for the API response
interface PaymentDetails {
  qr_code?: string;
  bank_accounts?: Array<{
    bank_name: string;
    account_number: string;
    account_name: string;
  }>;
}

interface BookingResponse {
  status: string;
  message: string;
  data: {
    id: number;
    booking_number: string;
    payment_details?: PaymentDetails;
  };
}

// Define a type for the user data we expect from the cookie
interface UserData {
  id: string;
  name?: string;
  email?: string;
  username: string;
  phoneNumber?: string;
  phone?: string;
  role: "ADMN" | "SADMN" | "CUST";
  [key: string]: string | undefined;
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
  const router = useRouter();

  // Get user data from cookies
  useEffect(() => {
    if (mounted) {
      const userData = getUserFromCookie();
      if (userData) {
        setLoggedInUser(userData);

        // If user has complete information, auto-check the box
        if (
          userData.email &&
          (userData.phoneNumber || userData.phone) &&
          userData.name
        ) {
          setUseAccountInfo(true);
          setIsPersonalInfoValid(true);
        }
      }
    }
  }, [mounted]);

  const handleUseAccountInfoChange = (checked: boolean) => {
    if (checked) {
      if (loggedInUser) {
        // Check if user has all required information
        if (
          loggedInUser.email &&
          (loggedInUser.phoneNumber || loggedInUser.phone) &&
          loggedInUser.name
        ) {
          setUseAccountInfo(true);
          setIsPersonalInfoValid(true);
        } else {
          toast.error(
            "Your account information is incomplete. Please update your profile first."
          );
          setUseAccountInfo(false);
        }
      } else {
        toast.error("Please log in to use your saved information.");
        setUseAccountInfo(false);
      }
    } else {
      setUseAccountInfo(false);
      setIsPersonalInfoValid(false);
    }
  };

  const handlePaymentClick = async () => {
    try {
      setIsSubmitting(true);

      // Validate required data
      if (!useBookingItemStore.getState().selectedRoom?.id) {
        toast.error("Please select a room first");
        return;
      }

      // Set default game if none selected
      const selectedGame = useBookingItemStore.getState().selectedGame;
      if (!selectedGame?.id) {
        // Create a default game object
        const defaultGame = {
          id: 1, // Default game ID
          name: "Default Game",
          unit: useBookingItemStore.getState().selectedUnitName || "Unit A",
          available: true,
          image: "/placeholder.svg",
          description: "Default game for booking",
        };
        useBookingItemStore.getState().setSelectedGame(defaultGame);
      }

      if (!useBookingItemStore.getState().selectedDate) {
        toast.error("Please select a date first");
        return;
      }

      if (!useBookingItemStore.getState().selectedTime) {
        toast.error("Please select a time first");
        return;
      }

      if (!useBookingItemStore.getState().duration) {
        toast.error("Please select a duration first");
        return;
      }

      // Validate customer data
      if (!useAccountInfo || !loggedInUser) {
        toast.error("Please fill in your personal information");
        return;
      }

      // Get booking summary data from store
      const bookingData = {
        unit_id: useBookingItemStore.getState().selectedUnitId!,
        game_id: useBookingItemStore.getState().selectedGame!.id,
        booking_date: format(
          useBookingItemStore.getState().selectedDate!,
          "yyyy-MM-dd"
        ),
        start_time: useBookingItemStore.getState().selectedTime,
        duration: useBookingItemStore.getState().duration,
        customer_data: {
          firstname: loggedInUser.name?.split(" ")[0] || "",
          lastname:
            loggedInUser.name?.split(" ").slice(1).join(" ") ||
            loggedInUser.name?.split(" ")[0] ||
            "",
          name: loggedInUser.name || "",
          email: loggedInUser.email || "",
          phone: loggedInUser.phoneNumber || loggedInUser.phone || "",
        },
        payment_method_id: paymentMethod === "qris" ? 1 : 2, // 1 for QRIS, 2 for Bank Transfer
        total_customer: 4, // This should be dynamic based on user input
        fnb_items: useBookingItemStore.getState().foodCart.map((item) => ({
          id: parseInt(item.id),
          quantity: item.quantity,
        })),
        promo_code: "", // This should be dynamic based on user input
        event_name: "", // This should be dynamic based on user input
      };

      console.log("Booking Summary:", bookingData);

      // Call the API to create booking using the new endpoint
      const response = await post<BookingResponse>(
        BOOKING_ENDPOINTS.CREATE_CUSTOMER_BOOKING,
        bookingData
      );
      console.log("Booking Response:", response);

      // Show success message
      toast.success("Booking created successfully!");

      // Close the modal
      setShowConfirmModal(false);

      // Redirect to booking success page with booking number
      router.push(
        `/booking-success?booking_number=${response.data.booking_number}`
      );
    } catch (error: unknown) {
      console.error("Error creating booking:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response?.status === 401
      ) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push("/login");
      } else {
        toast.error("Gagal membuat booking. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);
      if (onConfirm) {
        await onConfirm();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking. Please try again.");
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
                  useAccountInfo && loggedInUser
                    ? {
                        username: loggedInUser.username,
                        email: loggedInUser.email,
                        phone: loggedInUser.phoneNumber || loggedInUser.phone,
                      }
                    : null
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

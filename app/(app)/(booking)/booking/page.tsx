"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import BookingSteps from "@/components/booking/components/bookingStep";
import BookingSummary from "@/components/booking/components/bookingSummary";
import ConsoleSelection from "@/components/booking/components/ConsoleSelection";
import RoomSelection from "@/components/booking/components/RoomSelection";
import FoodSelection from "@/components/booking/components/FoodSelection";
import { Button } from "@/components/ui/button";
import DateTimeSelection from "@/components/booking/components/DateTimeSelection";

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter(); // Initialize the router

  const handleNextStep = () => {
    if (currentStep === 4) {
      // Navigate to the booking success page when on step 4
      router.push("/booking-confirm"); // Navigate to the success page
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1); // Proceed to the next step
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1); // Go back to the previous step
    }
  };

  return (
    <div className="flex flex-col justify-start items-center min-h-screen pt-8 bg-gray-50">
      {/* Header */}
      <h1 className="font-minecraft text-5xl font-semibold mb-6 text-center">
        Book an <span className="text-[#b99733]">Appointment</span>
      </h1>

      {/* Progress Bar */}
      <div className="w-full mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 w-1/4 ${
                currentStep >= step ? "bg-[#B99733]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Booking Summary */}
      <div className="w-full px-8 md:px-16 lg:px-32">
        <BookingSummary />
      </div>

      {/* Booking Steps */}
      <div className="w-full px-8 md:px-16 lg:px-32 mt-8">
        <BookingSteps
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          className="mb-8"
        />
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          {currentStep === 1 && <ConsoleSelection />}
          {currentStep === 2 && <RoomSelection />}
          {currentStep === 3 && <DateTimeSelection />}
          {currentStep === 4 && <FoodSelection />}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full px-8 md:px-16 lg:px-32 mt-8 flex justify-between mb-10">
        <Button
          onClick={handlePreviousStep}
          className="px-6 py-2 bg-gray-300 text-black rounded-none hover:bg-gray-400 transition-all cursor-pointer"
          disabled={currentStep === 1}
          title="Go to the previous step"
        >
          Previous
        </Button>
        <Button
          onClick={handleNextStep}
          title={currentStep === 4 ? "Confirm Booking" : "Go to the next step"}
          className="bg-[#B99733] px-6 py-2 rounded-none hover:bg-[#A1852E] transition-all cursor-pointer"
        >
          {currentStep === 4 ? "Confirm Booking" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default BookingPage;

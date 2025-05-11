"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

const steps = [
  { id: 1, title: "Console", icon: "/images/console-icon.png" },
  { id: 2, title: "Room", icon: "/images/room-icon.png" },
  { id: 3, title: "Date & Time", icon: "/images/date-icon.png" },
  { id: 4, title: "Food & Drinks", icon: "/images/food-icon.png" },
];

interface BookingStepsProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
  className?: string;
}

export default function BookingSteps({
  currentStep,
  onStepClick,
  className,
}: BookingStepsProps) {
  const [prevStep, setPrevStep] = useState(currentStep);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track direction of step change for animations
  useEffect(() => {
    if (currentStep > prevStep) {
      setDirection(1); // forward
    } else if (currentStep < prevStep) {
      setDirection(-1); // backward
    }
    setPrevStep(currentStep);
  }, [currentStep, prevStep]);

  // Initial mount and client-side check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we're on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mounted]);

  // Animation for step icon
  const iconVariants = {
    inactive: { scale: 1, opacity: 0.5 },
    active: {
      scale: [1, 1.2, 1.1],
      opacity: 1,
      transition: {
        duration: 0.3,
        times: [0, 0.6, 1],
      },
    },
    completed: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };

  // Render consistent UI for server and client
  if (!mounted) {
    return (
      <div className={cn("bg-white rounded-lg shadow-md", className)}>
        {/* Loading State or SSR-safe UI */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="ml-3">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile view shows only current step with navigator
  if (isMobile) {
    return (
      <div className={cn("bg-white rounded-lg shadow-md", className)}>
        {/* Mobile Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-t-lg overflow-hidden">
          <motion.div
            className="h-full bg-[#b99733]"
            initial={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Current Step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{
              x: direction >= 0 ? 50 : -50,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: direction >= 0 ? -50 : 50,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.div
                  initial="inactive"
                  animate="active"
                  variants={iconVariants}
                  className="w-12 h-12 rounded-full bg-[#b99733] flex items-center justify-center mr-3"
                >
                  <Image
                    src={steps[currentStep - 1].icon}
                    alt={`${steps[currentStep - 1].title} icon`}
                    width={30}
                    height={30}
                    className="filter brightness-0 invert"
                  />
                </motion.div>
                <div>
                  <p className="text-xs text-gray-500">
                    Step {currentStep} of {steps.length}
                  </p>
                  <h3 className="text-lg font-semibold text-[#b99733]">
                    {steps[currentStep - 1].title}
                  </h3>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    currentStep > 1 && onStepClick(currentStep - 1)
                  }
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border",
                    currentStep > 1
                      ? "border-[#b99733] text-[#b99733]"
                      : "border-gray-200 text-gray-300 cursor-not-allowed"
                  )}
                  disabled={currentStep <= 1}
                >
                  <ChevronRight className="w-4 h-4 transform rotate-180" />
                </button>
                <button
                  onClick={() =>
                    currentStep < steps.length && onStepClick(currentStep + 1)
                  }
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border",
                    currentStep < steps.length
                      ? "border-[#b99733] text-[#b99733]"
                      : "border-gray-200 text-gray-300 cursor-not-allowed"
                  )}
                  disabled={currentStep >= steps.length}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Pills */}
            <div className="flex justify-center mt-4 space-x-2">
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className={cn(
                    "h-2 rounded-full cursor-pointer transition-all",
                    step.id === currentStep
                      ? "bg-[#b99733] w-6"
                      : step.id < currentStep
                      ? "bg-[#b99733]/40 w-4"
                      : "bg-gray-200 w-4"
                  )}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => step.id <= currentStep && onStepClick(step.id)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Desktop View - Back to original layout but with animations
  return (
    <div
      className={cn(
        "flex border border-gray-200 rounded-lg bg-white",
        className
      )}
    >
      {steps.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const formattedStepId = String(step.id).padStart(2, "0");

        return (
          <div
            key={step.id}
            className={cn(
              "flex-1 py-4 px-2 text-center cursor-pointer transition-all duration-300 hover:shadow-md",
              isActive
                ? "bg-[#b99733] text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            )}
            onClick={() => {
              if (step.id <= currentStep) {
                onStepClick(step.id);
              }
            }}
          >
            <div className="flex items-center justify-center space-x-4">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-transform duration-300",
                  isActive
                    ? "bg-white text-[#b99733] border-2 border-[#b99733] scale-110"
                    : isCompleted
                    ? "bg-[#b99733] text-white"
                    : "bg-white text-gray-500 opacity-50 hover:opacity-75"
                )}
              >
                {isActive ? (
                  <Image
                    src={step.icon}
                    alt={`${step.title} icon`}
                    width={30}
                    height={30}
                    className="filter brightness-0 sepia-[.5] hue-rotate-[340deg] saturate-[6]"
                  />
                ) : isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  formattedStepId
                )}
              </div>
              <span
                className={cn(
                  "text-xl font-medium transition-all duration-300",
                  isActive && "font-semibold"
                )}
              >
                {step.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

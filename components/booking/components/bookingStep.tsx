"use client";

import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
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
              "flex-1 py-4 px-2 text-center cursor-pointer transition-all duration-300",
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
                  "flex items-center justify-center w-12 h-12 rounded-full",
                  isActive
                    ? "bg-[#b99733] text-white transform scale-110"
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
                  />
                ) : isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  formattedStepId
                )}
              </div>
              <span className="text-xl">{step.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

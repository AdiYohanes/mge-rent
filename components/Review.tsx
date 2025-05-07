/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Define review type for better type safety
type Review = {
  id: number;
  name: string;
  image: string;
  rating: number;
  text: string;
  position: string;
};

// Sample review data
const reviewData: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "Absolutely love this product! It exceeded all my expectations and the quality is outstanding. Will definitely purchase again.",
    position: "Marketing Director",
  },
  {
    id: 2,
    name: "Michael Chen",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4,
    text: "Great value for money. The customer service was excellent and they resolved my issue promptly.",
    position: "Software Engineer",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "I've been using this for 3 months now and it's made such a difference. Highly recommend to anyone considering it.",
    position: "Fitness Instructor",
  },
  {
    id: 4,
    name: "David Thompson",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4,
    text: "Very impressed with the quality and attention to detail. The shipping was fast and everything arrived in perfect condition.",
    position: "Architect",
  },
  {
    id: 5,
    name: "Jessica Williams",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "This is exactly what I was looking for! The product is intuitive to use and has all the features I need.",
    position: "Product Manager",
  },
];

const Review = () => {
  // State for carousel API and current slide
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Update current slide index when carousel changes
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    // Cleanup
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const handleNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      api?.scrollNext();
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="flex flex-col mt-10">
      {/* Title section */}
      <div className="flex w-full p-4 gap-2 md:gap-4 justify-center items-center mb-6 md:mb-10">
        <div className="bg-[#B99733] w-3 h-3 md:w-4 md:h-4" />
        <h1 className="text-3xl md:text-6xl lg:text-9xl font-minecraft text-center">
          Customer Review
        </h1>
        <div className="bg-[#B99733] w-3 h-3 md:w-4 md:h-4" />
      </div>

      {/* Carousel section */}
      <div className="w-full max-w-7xl mx-auto px-8 md:px-12 lg:px-16 relative">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {reviewData.map((review) => (
              <CarouselItem
                key={review.id}
                className="pl-4 sm:basis-full md:basis-1/2 lg:basis-1/3 transition-opacity duration-300"
              >
                <ReviewCard review={review} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation arrows - positioned away from cards */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-8 z-10">
          <NavigationButton
            direction="previous"
            onClick={handlePrevious}
            className="hidden sm:flex"
            aria-label="Previous review"
          />
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-8 z-10">
          <NavigationButton
            direction="next"
            onClick={handleNext}
            className="hidden sm:flex"
            aria-label="Next review"
          />
        </div>

        {/* Mobile navigation buttons */}
        <div className="flex justify-center gap-4 mt-6 sm:hidden">
          <NavigationButton
            direction="previous"
            onClick={handlePrevious}
            size="small"
            aria-label="Previous review"
          />
          <NavigationButton
            direction="next"
            onClick={handleNext}
            size="small"
            aria-label="Next review"
          />
        </div>

        {/* Pagination indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                current === index ? "bg-[#B99733] w-4" : "bg-gray-300"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Extracted component for review cards
const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <Card className="border-2 border-gray-200 h-full transition-all duration-300 hover:shadow-lg hover:border-[#B99733]/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#B99733]">
            <Image
              src={review.image || "/placeholder.svg"}
              alt={review.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{review.name}</h3>
            <p className="text-sm text-gray-500">{review.position}</p>
          </div>
        </div>
        <div className="flex mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? "fill-[#B99733] text-[#B99733]"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-700">{review.text}</p>
      </CardContent>
      <CardFooter className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400">Verified Customer</p>
      </CardFooter>
    </Card>
  );
};

// Reusable navigation button component
const NavigationButton = ({
  direction,
  onClick,
  className,
  size = "normal",
  ...props
}: {
  direction: "previous" | "next";
  onClick: () => void;
  className?: string;
  size?: "normal" | "small";
  [key: string]: any;
}) => {
  // Arrow image path based on direction (previous or next)
  const arrowImage =
    direction === "previous"
      ? "/images/arrow-gold.png"
      : "/images/arrow-gold-v2.png";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center text-[#B99733] hover:text-[#8a7127] transition-colors duration-300 focus:outline-none cursor-pointer",
        size === "normal" ? "w-14 h-14" : "w-12 h-12",
        className
      )}
      {...props}
    >
      {/* Use Image component for the custom arrow */}
      <Image
        src={arrowImage}
        alt={`Arrow ${direction}`}
        width={40}
        height={40}
      />
    </button>
  );
};

export default Review;

// Shared types for the booking system
export interface Room {
  id: number;
  category: "Regular" | "VIP" | "VVIP";
  price: number;
  description: string;
  image: string;
}

// This interface is deprecated and replaced by the one in api/console/consoleApi.ts
// Keeping it here for backward compatibility with other parts of the app
export interface Console {
  id: number;
  model: string;
  serial_number: string;
  price: string;
  notes?: string;
  image: string | null;
  is_available: boolean;
  available_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SpecificRoom {
  id: number;
  name: string;
  type: "Regular" | "VIP" | "VVIP";
  available: boolean;
}

export interface FoodDrink {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: "Ricebowl" | "Noodles" | "Snacks" | "Drinks";
  soldOut?: boolean;
}

export interface BookingData {
  id?: string;
  userId?: number;
  roomCategory: string | null;
  roomName: string | null;
  consoleType: string | null;
  date: string | null;
  time: string | null;
  duration?: number;
  food: { name: string; quantity: number }[];
  totalPrice: number;
  paymentMethod: string | null;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: "bank" | "ewallet" | "qris" | "card";
}

export interface StepInfo {
  id: number;
  title: string;
  icon: string;
  activeIcon: string;
}
export interface Game {
  id: number;
  name: string;
  unit: string; // PS unit name where the game is available
  available: boolean; // Whether the game is available in that unit
  image: string; // Path to the game's image
  description: string; // Short description of the game
}

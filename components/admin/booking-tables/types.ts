import { BookingStatus } from "./shared-components";

// Base booking interface with common properties
export interface BaseBooking {
  id: string;
  transactionNumber: string;
  customerName: string;
  phoneNumber: string;
  status: BookingStatus;
  date: string;
  amount: number;
  paymentMethod: string;
}

// Room booking specific fields
export interface RoomBooking extends BaseBooking {
  console: string;
  roomType: string;
  unitNumber: string;
  totalPerson: number;
  startTime: string;
  endTime: string;
  time?: string;
  duration: string;
  gameId?: number;
  gameTitle?: string;
}

// Event booking specific fields
export interface EventBooking extends BaseBooking {
  eventName: string;
  eventDescription: string;
  console: string;
  roomType: string; // called "room" in some parts
  unitNumber: string; // called "unit" in some parts
  totalPerson: number;
  startTime: string;
  endTime: string;
  duration: string;
  eventType: string;
}

// Food booking specific fields
export interface FoodBooking extends BaseBooking {
  foodItems: string[];
  foodTypes: string[];
}

// Common table props
export interface BookingTableBaseProps {
  filterStatus?: BookingStatus | BookingStatus[] | null;
}

// Utility functions
export const formatCurrency = (amount: number | undefined): string => {
  // Handle invalid number values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "Rp0";
  }

  // Format to Indonesian Rupiah
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\s/g, "");
};

// Dummy data simplified - will be imported separately in each component

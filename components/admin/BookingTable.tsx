"use client";

import RoomBookingTable from "./booking-tables/RoomBookingTable";
import EventBookingTable from "./booking-tables/EventBookingTable";
import FoodBookingTable from "./booking-tables/FoodBookingTable";

export type BookingStatus =
  | "booking_success"
  | "booking_ongoing"
  | "booking_finish"
  | "booking_canceled"
  | "booking_reschedule"
  | "return";

export type BookingType = "food" | "event" | "room";

interface BookingTableProps {
  bookingType?: BookingType;
}

export function BookingTable({ bookingType = "room" }: BookingTableProps) {
  switch (bookingType) {
    case "food":
      return <FoodBookingTable />;
    case "event":
      return <EventBookingTable />;
    default:
      return <RoomBookingTable />;
  }
}

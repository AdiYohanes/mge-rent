"use client";

import { useState } from "react";
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
  filterStatus?: BookingStatus | BookingStatus[] | null;
  bookingType?: BookingType;
}

export function BookingTable({
  filterStatus = null,
  bookingType = "room",
}: BookingTableProps) {
  switch (bookingType) {
    case "food":
      return <FoodBookingTable filterStatus={filterStatus} />;
    case "event":
      return <EventBookingTable filterStatus={filterStatus} />;
    default:
      return <RoomBookingTable filterStatus={filterStatus} />;
  }
}

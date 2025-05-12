"use client";

import { RoomTable } from "@/components/admin/RoomTable";

export default function RoomPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Room Management</h1>
      <RoomTable />
    </div>
  );
}

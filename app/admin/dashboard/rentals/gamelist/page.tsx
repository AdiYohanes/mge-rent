"use client";

import { GamelistTable } from "@/components/admin/GamelistTable";

export default function GamelistPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Game List Management</h1>
      <GamelistTable />
    </div>
  );
}

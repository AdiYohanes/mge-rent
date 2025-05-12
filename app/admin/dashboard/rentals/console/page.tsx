"use client";

import { ConsoleTable } from "@/components/admin/ConsoleTable";

export default function ConsolePage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold">Console List</h1>
      <ConsoleTable />
    </div>
  );
}

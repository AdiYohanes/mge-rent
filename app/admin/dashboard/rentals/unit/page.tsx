"use client";

import { UnitTable } from "@/components/admin/UnitTable";

export default function UnitPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Unit Management</h1>
      <UnitTable />
    </div>
  );
}

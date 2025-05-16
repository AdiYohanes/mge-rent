"use client";

import { CustomerTable } from "@/components/admin/CustomerTable";

export default function CustomerPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Customer Account Management</h1>
      <CustomerTable />
    </div>
  );
}

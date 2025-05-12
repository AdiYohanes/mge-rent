"use client";

import { UserAdminTable } from "@/components/admin/UserAdminTable";

export default function AdminUserPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Admin User Management</h1>
      <UserAdminTable />
    </div>
  );
}

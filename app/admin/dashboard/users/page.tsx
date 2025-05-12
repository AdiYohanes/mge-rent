"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the customer page
    router.push("/admin/dashboard/users/customer");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );
}

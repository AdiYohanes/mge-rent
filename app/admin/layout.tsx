import type React from "react";
import type { Metadata } from "next";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Admin || MGE",
  description: "Admin dashboard for managing bookings, users, and more",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Toaster position="top-right" />
      {children}
    </main>
  );
}

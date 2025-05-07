"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/register") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/newPassword") ||
    pathname.startsWith("/forgotPassword");
  return (
    <div className="relative min-h-screen">
      {!isAuthPage && <Navbar />}
      <main>{children}</main>
      <Toaster position="top-right" />
      {!isAuthPage && <Footer />}
    </div>
  );
}

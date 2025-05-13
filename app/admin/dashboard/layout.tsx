"use client";

import "../../globals.css";
import { DashboardSidebar } from "@/components/admin/DashboardSidebar";
import { DashboardHeader } from "@/components/admin/Dashboardheader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <motion.div
          className="flex flex-col flex-1 w-full overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </motion.div>
      </div>
    </SidebarProvider>
  );
}

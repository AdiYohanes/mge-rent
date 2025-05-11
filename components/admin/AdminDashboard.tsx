"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";

export function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  // Handle responsive sidebar collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else if (window.innerWidth > 1200) {
        setCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#f9f9f9]">
        <div className="md:w-1/5 md:min-w-[250px] md:max-w-full transition-all duration-300">
          <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Mobile overlay to close sidebar */}
        {collapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setCollapsed(true)}
            aria-hidden="true"
          />
        )}
      </div>
    </SidebarProvider>
  );
}

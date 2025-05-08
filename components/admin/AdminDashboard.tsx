"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./Dashboardheader";
import { DashboardContent } from "./DashboardContent.jsx";

export function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else if (window.innerWidth > 1200) {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#f9f9f9]">
        <div
          className={`${isMobile ? "fixed z-40 h-screen" : "relative"} ${
            collapsed && isMobile ? "w-[60px]" : ""
          }`}
        >
          <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        <div
          className={`flex flex-col flex-1 transition-all duration-300 ${
            isMobile && !collapsed ? "opacity-50" : "opacity-100"
          }`}
        >
          <DashboardHeader
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isMobile={isMobile}
          />
          <div
            className="relative flex-1 transition-all duration-300"
            onClick={() => isMobile && !collapsed && setCollapsed(true)}
          >
            <DashboardContent />
          </div>
        </div>

        {/* Mobile overlay to close sidebar */}
        {isMobile && !collapsed && (
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

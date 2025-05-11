"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  LayoutDashboard,
  CalendarCheck,
  Users,
  Home,
  Coffee,
  CreditCard,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  id: string;
  name: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
  expandable: boolean;
  subItems?: SubMenuItem[];
}

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

type ExpandedMenusState = {
  [key: string]: boolean;
};

export function DashboardSidebar({
  collapsed,
  setCollapsed,
}: DashboardSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenusState>({
    booking: false,
    user: false,
    rental: false,
    food: false,
    setting: false,
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: true,
      expandable: false,
    },
    {
      id: "booking",
      name: "Booking",
      icon: CalendarCheck,
      href: "#",
      active: false,
      expandable: true,
      subItems: [
        { name: "All Bookings", href: "#" },
        { name: "Pending", href: "#" },
        { name: "Confirmed", href: "#" },
      ],
    },
    {
      id: "user",
      name: "User",
      icon: Users,
      href: "#",
      active: false,
      expandable: true,
      subItems: [
        { name: "All Users", href: "#" },
        { name: "Admins", href: "#" },
        { name: "Customers", href: "#" },
      ],
    },
    {
      id: "rental",
      name: "Rental",
      icon: Home,
      href: "#",
      active: false,
      expandable: true,
      subItems: [
        { name: "All Units", href: "#" },
        { name: "VVIP Units", href: "#" },
        { name: "VIP Units", href: "#" },
        { name: "Regular Units", href: "#" },
      ],
    },
    {
      id: "food",
      name: "Food & Drinks",
      icon: Coffee,
      href: "#",
      active: false,
      expandable: true,
      subItems: [
        { name: "All Items", href: "#" },
        { name: "Food", href: "#" },
        { name: "Drinks", href: "#" },
      ],
    },
    {
      id: "transaction",
      name: "Transaction",
      icon: CreditCard,
      href: "#",
      active: false,
      expandable: false,
    },
    {
      id: "setting",
      name: "Setting",
      icon: Settings,
      href: "#",
      active: false,
      expandable: true,
      subItems: [
        { name: "Profile", href: "#" },
        { name: "Security", href: "#" },
        { name: "Appearance", href: "#" },
      ],
    },
  ];

  return (
    <Sidebar className="border-r bg-white shadow-md">
      <div className="flex items-center justify-between h-20 px-4 border-b bg-gradient-to-r from-[#f9f5e7] to-[#f3edd5]">
        <Link href="/admin" className="flex items-center gap-3">
          {collapsed ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute w-11 h-11 rounded-full bg-[#B99733]/10 animate-pulse"></div>
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center relative z-10 border border-[#B99733]/20">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain transition-transform hover:scale-105"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-11 h-11 rounded-full bg-[#B99733]/10 animate-pulse"></div>
                <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center relative z-10 border border-[#B99733]/20">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#B99733] text-lg leading-tight">
                  MGE
                </span>
                <span className="text-xs text-[#B99733]/80 font-medium">
                  Playstation
                </span>
              </div>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-[#e9deb6] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={18} className="text-[#B99733]" />
        </button>
      </div>
      <SidebarContent className="py-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id} className="px-2 py-1">
              {item.expandable ? (
                <>
                  <SidebarMenuButton
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "justify-between transition-all duration-200 rounded-lg hover:bg-[#f9f7ef] cursor-pointer",
                      item.active
                        ? "bg-[#B99733] text-white hover:bg-[#B99733] hover:text-white shadow-sm"
                        : "hover:translate-x-1"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={cn(
                          "w-5 h-5 mr-2 transition-transform",
                          expandedMenus[item.id] && "text-[#B99733]"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        expandedMenus[item.id] && "rotate-90 text-[#B99733]"
                      )}
                    />
                  </SidebarMenuButton>
                  {expandedMenus[item.id] && (
                    <SidebarMenuSub className="animate-in slide-in-from-top-2 duration-200">
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.name} className="px-1">
                          <SidebarMenuSubButton
                            asChild
                            className="transition-all duration-200 rounded-md hover:bg-[#f3edd5] hover:translate-x-1"
                          >
                            <Link href={subItem.href}>{subItem.name}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "rounded-lg transition-all duration-200",
                    item.active
                      ? "bg-[#B99733] text-white hover:bg-[#B99733] hover:text-white shadow-sm"
                      : "hover:bg-[#f9f7ef] hover:translate-x-1"
                  )}
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="w-5 h-5 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

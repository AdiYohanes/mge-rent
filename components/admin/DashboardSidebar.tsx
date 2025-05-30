"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  CalendarCheck,
  Users,
  Home,
  Coffee,
  CreditCard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

// Define interface for submenu items
interface SubMenuItem {
  name: string;
  href: string;
  badge?: number;
}

// Define interface for menu items
interface MenuItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
  active: boolean;
  expandable: boolean;
  badge?: number;
  subItems?: SubMenuItem[];
}

export function DashboardSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();

  // Initialize open menus based on current path with proper type
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Define menu items wrapped in useMemo
  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
        active: pathname === "/admin/dashboard",
        expandable: false,
      },
      {
        id: "booking",
        name: "Booking",
        icon: CalendarCheck,
        href: "/admin/dashboard/booking",
        active: pathname.includes("/admin/dashboard/booking"),
        expandable: true,
        badge: 3,
        subItems: [
          {
            name: "Room",
            href: "/admin/dashboard/booking?type=room",
            badge: 2,
          },
          {
            name: "Food & Drink",
            href: "/admin/dashboard/booking?type=food",
            badge: 1,
          },
          { name: "Event", href: "/admin/dashboard/booking?type=event" },
        ],
      },
      {
        id: "user",
        name: "User",
        icon: Users,
        href: "/admin/dashboard/users",
        active: pathname.includes("/admin/dashboard/users"),
        expandable: true,
        subItems: [
          {
            name: "Customer MGE Rental",
            href: "/admin/dashboard/users/customer",
          },
          { name: "User Admin", href: "/admin/dashboard/users/admin" },
        ],
      },
      {
        id: "rental",
        name: "Rental",
        icon: Home,
        href: "/admin/dashboard/rentals",
        active: pathname.includes("/admin/dashboard/rentals"),
        expandable: true,
        subItems: [
          { name: "Console", href: "/admin/dashboard/rentals/console" },
          { name: "Room", href: "/admin/dashboard/rentals/room" },
          { name: "Unit", href: "/admin/dashboard/rentals/unit" },
          { name: "Gamelist", href: "/admin/dashboard/rentals/gamelist" },
        ],
      },
      {
        id: "food",
        name: "Food & Drinks",
        icon: Coffee,
        href: "/admin/dashboard/food",
        active: pathname.includes("/admin/dashboard/food"),
        expandable: false,
      },
      {
        id: "transaction",
        name: "Transaction",
        icon: CreditCard,
        href: "/admin/dashboard/transactions",
        active: pathname.includes("/admin/dashboard/transactions"),
        expandable: false,
      },
    ],
    [pathname]
  );

  // Secondary menu items wrapped in useMemo
  const secondaryMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        id: "settings",
        name: "Settings",
        icon: Settings,
        href: "/admin/dashboard/settings",
        active: pathname.includes("/admin/dashboard/settings"),
        expandable: true,
        subItems: [
          { name: "Promo management", href: "/admin/dashboard/settings/promo" },
          { name: "FAQ", href: "/admin/dashboard/settings/faq" },
          {
            name: "Food&drink category",
            href: "/admin/dashboard/settings/food-category",
          },
          {
            name: "Landing Page",
            href: "/admin/dashboard/settings/landing-page",
          },
        ],
      },
    ],
    [pathname]
  );

  // Initialize open menus based on active state
  useEffect(() => {
    const initialOpenMenus: Record<string, boolean> = {};

    // Open menus that contain active items
    [...menuItems, ...secondaryMenuItems].forEach((item) => {
      if (
        item.expandable &&
        (item.active ||
          item.subItems?.some((subItem) => pathname.includes(subItem.href)))
      ) {
        initialOpenMenus[item.id] = true;
      }
    });

    setOpenMenus(initialOpenMenus);
  }, [pathname, menuItems, secondaryMenuItems]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b h-16 flex items-center px-4 bg-gray-100/90">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 w-full"
        >
          <motion.div
            className="relative flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="absolute w-10 h-10 rounded-full bg-amber-200/50 animate-pulse"></div>
            <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center relative z-10 border border-amber-200">
              <Image
                src="/images/logo.png"
                alt="MGE Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </motion.div>

          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="font-bold text-black/80 text-lg leading-tight">
                MGE
              </span>
              <span className="text-xs text-amber-600/80 font-medium">
                Playstation
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Main Menu */}
        <div className="mb-1 px-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Main Menu
          </h3>
        </div>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              {item.expandable ? (
                <Collapsible
                  open={openMenus[item.id]}
                  onOpenChange={() => toggleMenu(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "justify-between group transition-all duration-200",
                        item.active &&
                          "bg-[#B99733] text-white hover:bg-amber-700"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-2 h-5 px-1.5 bg-amber-200 text-amber-800"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openMenus[item.id] && "rotate-90"
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.name}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.href}
                            className="transition-all duration-200"
                          >
                            <Link
                              href={subItem.href}
                              className="flex items-center justify-between"
                            >
                              <span>{subItem.name}</span>
                              {subItem?.badge && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 px-1.5 bg-amber-100 text-amber-800"
                                >
                                  {subItem.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        className={cn(
                          "transition-all duration-200",
                          item.active &&
                            "bg-[#B99733] text-white hover:bg-amber-700"
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <item.icon className="h-4 w-4 mr-2" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 bg-amber-200 text-amber-800"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="hidden md:block">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Secondary Menu */}
        <div className="mt-6 mb-1 px-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            System
          </h3>
        </div>
        <SidebarMenu>
          {secondaryMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              {item.expandable ? (
                <Collapsible
                  open={openMenus[item.id]}
                  onOpenChange={() => toggleMenu(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "justify-between group transition-all duration-200",
                        item.active &&
                          "bg-[#B99733] text-white hover:bg-amber-700"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-2 h-5 px-1.5 bg-[#B99733] text-amber-800"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openMenus[item.id] && "rotate-90"
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.name}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.href}
                            className="transition-all duration-200"
                          >
                            <Link href={subItem.href}>{subItem.name}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        className={cn(
                          "transition-all duration-200",
                          item.active &&
                            "bg-[#B99733] text-white hover:bg-amber-700"
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <item.icon className="h-4 w-4 mr-2" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 bg-amber-200 text-amber-800"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="hidden md:block">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

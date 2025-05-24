"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserData {
  id: string;
  username: string;
  role: "ADMN" | "SADMN" | "CUST";
  email?: string;
}

export function DashboardHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications] = useState(3);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  // Detect scroll for shadow effect on header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get user data from localStorage
  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    if (userStorage) {
      try {
        const parsedUser = JSON.parse(userStorage) as UserData;
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Show success toast
    toast.success("Logged out successfully", {
      description: "You have been logged out of your account",
      duration: 3000,
    });

    // Navigate to login page
    router.push("/signin");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-40 flex w-full h-[72px] items-center justify-between border-b bg-white px-6 transition-shadow duration-200",
        scrolled ? "shadow-md" : ""
      )}
    >
      <div className="flex items-center gap-5">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground h-6 w-6" />

        <div
          className={cn("relative", searchOpen ? "w-full md:w-96" : "w-auto")}
        >
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 h-11 w-full text-base rounded-md"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="px-3 py-2 h-11 hidden md:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground text-base">
                Search...
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-12 w-12 rounded-full"
          >
            <Bell className="h-6 w-6 text-muted-foreground" />
          </Button>
          {notifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs border-2 border-white"
            >
              {notifications}
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-3 h-12 pl-3 pr-4 rounded-full"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-amber-100">
                <Image
                  src="/images/logo.png"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start text-left  md:flex">
                <span className="text-base font-medium leading-tight">
                  {userData?.username}
                </span>
                <span className="text-sm text-muted-foreground leading-tight mt-1">
                  {userData?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-1">
            <DropdownMenuLabel className="text-base py-3">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-3 cursor-pointer">
              <User className="mr-3 h-5 w-5" />
              <span className="text-base">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 cursor-pointer">
              <Settings className="mr-3 h-5 w-5" />
              <span className="text-base">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer py-3"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="text-base">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

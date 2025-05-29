"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFromCookie, clearAuthCookies } from "@/utils/cookieUtils";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/api";
import { format } from "date-fns";

interface UserData {
  id: string;
  username: string;
  role: "ADMN" | "SADMN" | "CUST";
  email?: string;
}

export function DashboardHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const router = useRouter();

  // Detect scroll for shadow effect on header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get user data from cookies
  useEffect(() => {
    const user = getUserFromCookie();
    if (user) {
      setUserData(user as UserData);
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError(null);
        const response = await getNotifications();
        setNotifications(response.data);

        // Calculate unread count from data
        const unreadNotifications = response.data.filter(
          (notification) => !notification.is_read
        );
        setUnreadCount(unreadNotifications.length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();

    // Set up a polling interval to check for new notifications
    const intervalId = setInterval(fetchNotifications, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  // Handle marking a notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );

      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      toast.error("Failed to update notification");
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      // Update local state - mark all unread notifications as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          !notification.is_read
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );

      // Reset unread count
      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("Failed to update notifications");
    }
  };

  // Format notification date as "Just now" or time format
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // If it's within the last 2 minutes, show "Just now"
    if (now.getTime() - date.getTime() < 2 * 60 * 1000) {
      return "Just now";
    }

    // If it's today, show time only
    if (date.toDateString() === now.toDateString()) {
      return "Just now";
    }

    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Show formatted date - Mar 15 12:50pm
    return format(date, "MMM d h:mma").toLowerCase();
  };

  // Handle logout
  const handleLogout = () => {
    // Clear cookies
    clearAuthCookies();

    // Show success toast
    toast.success("Logged out successfully", {
      description: "You have been logged out of your account",
      duration: 3000,
    });

    // Navigate to login page
    router.push("/signin");
  };

  // Handle notification click, navigate to link if available
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read first
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // If there's a link, navigate to it
    if (notification.link) {
      router.push(notification.link);
      setNotificationOpen(false); // Close dropdown after navigating
    }
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
        <DropdownMenu
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
        >
          <DropdownMenuTrigger asChild>
            <motion.div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-12 w-12 rounded-full overflow-hidden"
              >
                <motion.div
                  animate={
                    unreadCount > 0
                      ? {
                          scale: [1, 1.2, 1],
                          transition: {
                            repeat: 3,
                            repeatType: "mirror",
                            duration: 0.5,
                          },
                        }
                      : { scale: 1 }
                  }
                >
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </motion.div>
              </Button>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -right-1 -top-1"
                  >
                    <Badge
                      variant="destructive"
                      className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs border-2 border-white bg-[#B99733] text-white"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 mt-1 p-0 rounded-md overflow-hidden shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between p-4 bg-white">
              <motion.h3
                className="text-lg font-semibold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Notification
              </motion.h3>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                    {unreadCount} New
                  </Badge>
                </motion.div>
              )}
            </div>

            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
                        !notification.is_read && "bg-amber-50/60"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-900 mb-0.5 line-clamp-2">
                          {notification.message}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatNotificationDate(notification.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            )}

            <motion.div
              className="p-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="ghost"
                className="w-full h-12 bg-[#B99733] text-white hover:bg-amber-700 hover:text-white rounded-none font-medium"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Read All Notifications
              </Button>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

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

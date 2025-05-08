import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Menu,
  User,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader({ collapsed, setCollapsed, isMobile }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications] = useState(3); // Contoh notifikasi

  // Deteksi scroll untuk efek bayangan pada header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`flex items-center justify-between h-16 px-4 md:px-6 bg-white transition-all duration-300 ${
        scrolled ? "shadow-md" : "border-b border-[#B99733]/10"
      } sticky top-0 z-30`}
    >
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-none hover:bg-[#f9f7ef] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={20} className="text-[#B99733]" />
          </button>
        )}

        <div
          className={`relative ${
            searchOpen ? "flex-1 md:max-w-md" : "w-auto"
          } transition-all duration-300`}
        >
          <div
            className={`relative flex items-center ${
              searchOpen ? "w-full" : "w-auto"
            }`}
          >
            {searchOpen ? (
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-9 pr-4 border border-[#B99733]/20 outline-none focus:border-[#B99733] rounded-none bg-[#f9f7ef]/50"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-none hover:bg-[#f9f7ef] transition-colors hidden md:flex"
                aria-label="Search"
              >
                <Search size={18} className="text-gray-500" />
              </button>
            )}
            {searchOpen && (
              <Search size={18} className="absolute left-2 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-4">
        <div className="relative">
          <button
            className="p-2 rounded-none hover:bg-[#f9f7ef] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-[#B99733]" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {notifications}
              </span>
            )}
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-[#f9f7ef] p-1 md:p-2 rounded-none transition-colors">
              <div className="relative w-8 h-8 overflow-hidden border border-[#B99733]/20 rounded-none bg-[#f9f7ef]">
                <Image
                  src="/images/logo.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start hidden md:flex">
                <span className="text-sm font-medium leading-tight">Admin</span>
                <span className="text-xs text-gray-500 leading-tight">
                  admin@mge.com
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-gray-500 hidden md:block"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-none border-[#B99733]/20"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <User size={14} />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Settings size={14} />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 text-red-500 cursor-pointer">
              <LogOut size={14} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

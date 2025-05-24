"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { HiMenuAlt3 } from "react-icons/hi";
import { RiCloseFill } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  useEffect(() => {
    // Only access localStorage after component has mounted on client
    if (mounted) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
          localStorage.removeItem("user");
        }
      }
    }
  }, [mounted]);

  useEffect(() => {
    // Only add document event listeners after component has mounted
    if (!mounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mounted]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsProfileMenuOpen(false);
    router.push("/signin");
  };

  // Render a stripped-down version until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-white text-black shadow-md font-minecraft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="w-12 h-12 cursor-pointer"
            />
          </Link>
          <div className="h-[52px] w-[140px]"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white text-black shadow-md font-minecraft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="w-12 h-12 cursor-pointer"
          />
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link href="/" className="block text-black hover:text-[#B99733]">
            MGE Rental
          </Link>
          <Link
            href="/booking"
            className="block text-black hover:text-[#B99733]"
          >
            Rent
          </Link>
          <Link
            href="/restaurant"
            className="block text-black hover:text-[#B99733]"
          >
            Food & Drinks
          </Link>
          <Link href="/faq" className="block text-black hover:text-[#B99733]">
            FAQ
          </Link>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black focus:outline-none cursor-pointer"
          >
            {isMenuOpen ? (
              <RiCloseFill className="h-6 w-6" />
            ) : (
              <HiMenuAlt3 className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md p-4 space-y-4 z-20">
            <Link
              href="/"
              className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] transition-colors duration-200 cursor-pointer"
            >
              MGE Rental
            </Link>
            <Link
              href="/booking"
              className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] transition-colors duration-200 cursor-pointer"
            >
              Rent
            </Link>
            <Link
              href="/restaurant"
              className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] transition-colors duration-200 cursor-pointer"
            >
              Food & Drinks
            </Link>
            <Link
              href="/faq"
              className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] transition-colors duration-200 cursor-pointer"
            >
              FAQ
            </Link>
            {user && (
              <div className="relative">
                <div
                  className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] transition-colors duration-200 cursor-pointer flex items-center"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center overflow-hidden mr-2">
                    <Image
                      src="/images/button-icon.png"
                      alt="Profile"
                      width={24}
                      height={24}
                      className="pixelated"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <span>{user.username}</span>
                </div>
                {isProfileMenuOpen && (
                  <div className="absolute left-full -top-1 ml-1 bg-white border border-gray-200 shadow-lg z-30 w-48">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] border-b border-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href="/userBookings"
                      className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] border-b border-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Booking History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] transition-colors duration-200 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="hidden md:flex items-center">
          {user ? (
            <div className="flex items-center relative" ref={profileMenuRef}>
              <div
                className="flex items-center bg-[#1B1010] text-white px-4 py-2 cursor-pointer hover:bg-gray-900 transition-colors duration-200"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/button-icon.png"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="pixelated"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <span className="text-white">{user.username}</span>
                </div>
              </div>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-30 w-48">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] border-b border-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/userBookings"
                    className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] border-b border-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    Booking History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 hover:text-[#B99733] transition-colors duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/signin">
              <Button
                variant="ghost"
                className="bg-[#1B1010] text-white gap-4 px-8 py-6 rounded-none hover:bg-gray-900 hover:text-[#B99733] transition duration-300 cursor-pointer"
              >
                <Image
                  src="/images/button-icon.png"
                  alt="Login Icon"
                  width={20}
                  height={20}
                />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

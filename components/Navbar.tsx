"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { HiMenuAlt3 } from "react-icons/hi";
import { RiCloseFill } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/signin");
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <header className="bg-white text-black shadow-md font-minecraft">
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
    <header className="bg-white text-black shadow-md font-minecraft">
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
          <Link href="#" className="block text-black hover:text-[#B99733]">
            MGE Rental
          </Link>
          <Link href="#" className="block text-black hover:text-[#B99733]">
            Rent
          </Link>
          <Link href="#" className="block text-black hover:text-[#B99733]">
            Food & Drinks
          </Link>
          <Link href="#" className="block text-black hover:text-[#B99733]">
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
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md p-4 space-y-4 ">
            <a href="#" className="block text-black ">
              MGE Rental
            </a>
            <a href="#" className="block text-black">
              Rent
            </a>
            <a href="#" className="block text-black">
              Food & Drinks
            </a>
            <a href="#" className="block text-black">
              FAQ
            </a>
          </div>
        )}

        <div className="hidden md:flex items-center">
          {user ? (
            <div className="flex items-center">
              <p className="mr-4">Welcome, {user.username}!</p>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="bg-[#1B1010] text-white gap-4 px-8 py-6 rounded-none hover:bg-gray-900 hover:text-[#B99733] transition duration-300 cursor-pointer"
              >
                Logout
              </Button>
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

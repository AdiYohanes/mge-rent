"use client";

import Image from "next/image";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineChartBar,
} from "react-icons/hi";
import { BsStarFill } from "react-icons/bs";
import { MdOutlineSecurity } from "react-icons/md";
import { IoGameControllerOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check for admin credentials
      if (
        formData.username === "admin@example.com" &&
        formData.password === "adminPassword"
      ) {
        toast.success("Welcome back, Administrator!");

        // Save to localStorage
        const adminData = {
          username: formData.username,
          role: "admin",
          rememberMe,
        };

        if (rememberMe) {
          localStorage.setItem("admin", JSON.stringify(adminData));
        } else {
          sessionStorage.setItem("admin", JSON.stringify(adminData));
        }

        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 500);
      } else {
        toast.error("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-amber-100/30 to-orange-100/30">
        <div className="relative w-full max-w-2xl">
          {/* Main Character Illustration */}
          <div className="relative">
            <Image
              src="/images/adminsignin.png"
              alt="Admin Illustration"
              className="w-full drop-shadow-2xl"
              width={600}
              height={600}
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `
                  <div class="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl p-12 shadow-inner">
                    <div class="mb-8 p-6 bg-white rounded-full shadow-lg">
                      <svg class="w-24 h-24 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-amber-900 mb-3">Admin Dashboard</h3>
                    <p class="text-amber-700 text-center max-w-md">Manage your platform with powerful tools and real-time insights</p>
                  </div>
                `;
              }}
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute top-10 right-10 animate-float group cursor-pointer">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex items-center gap-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <div className="p-3 bg-amber-100 rounded-xl transition-colors group-hover:bg-amber-200">
                <HiOutlineChartBar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">70%</p>
                <p className="text-xs text-gray-600">Growth</p>
              </div>
            </div>
          </div>

          <div className="absolute top-1/3 left-0 animate-float-delayed group cursor-pointer">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex items-center gap-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <div className="p-3 bg-amber-100 rounded-xl transition-colors group-hover:bg-amber-200">
                <BsStarFill className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">80%</p>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 right-0 animate-float group cursor-pointer">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex items-center gap-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <div className="p-3 bg-amber-100 rounded-xl transition-colors group-hover:bg-amber-200">
                <IoGameControllerOutline className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">60%</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </div>

          <div className="absolute top-20 left-1/3 animate-float-scale">
            <div className="bg-amber-100/50 backdrop-blur-sm rounded-full p-4 shadow-lg">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-inner animate-pulse-glow">
                $
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-amber-100/50">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-1 shadow-lg transform rotate-3">
                    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden">
                      <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = `
                            <span class="text-2xl font-bold bg-gradient-to-br from-amber-600 to-amber-700 bg-clip-text text-transparent">VG</span>
                          `;
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full p-2 shadow-md">
                    <MdOutlineSecurity className="w-4 h-4 text-amber-700" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Sign In
              </h2>
              <p className="text-gray-600">
                Welcome back! Please login to your admin account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <HiOutlineMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="email"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all duration-200"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-12 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="rounded data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Not an admin?{" "}
                <a
                  href="/auth/login"
                  className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Go to user login
                </a>
              </p>
            </div>
          </div>

          {/* Test Credentials for Development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-medium text-amber-800 text-center mb-2">
                Development Credentials
              </p>
              <div className="text-center text-sm text-amber-700 space-y-1">
                <p>
                  Email:{" "}
                  <code className="px-2 py-1 bg-white rounded font-mono text-xs">
                    admin@example.com
                  </code>
                </p>
                <p>
                  Password:{" "}
                  <code className="px-2 py-1 bg-white rounded font-mono text-xs">
                    adminPassword
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

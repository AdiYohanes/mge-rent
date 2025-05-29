/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { register, RegisterRequestData, ErrorResponse } from "@/api";
import { AxiosError } from "axios";

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  // Set mounted state to true when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (
      !formData.fullName ||
      !formData.username ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("You must agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    // Prepare data for API request
    const apiRequestData: RegisterRequestData = {
      username: formData.username,
      role: "CUST", // Updated to match the expected role format
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    try {
      // Make API call to register endpoint
      const response = await register(apiRequestData);

      // Registration successful
      toast.success("Registration successful! You can now log in.");
      router.push("/signin");
    } catch (error) {
      console.error("Registration error:", error);

      const axiosError = error as AxiosError<ErrorResponse>;

      // Handle different error formats
      if (axiosError.response?.data?.errors) {
        // If the response contains validation errors
        const errors = axiosError.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const errorMessage = errors[firstErrorKey][0];
        toast.error(errorMessage || "Registration failed. Please try again.");
      } else if (axiosError.response?.data) {
        // Check for specific error formats
        const data = axiosError.response.data;
        if (typeof data === "object" && data !== null) {
          const firstErrorKey = Object.keys(data)[0];
          if (Array.isArray(data[firstErrorKey])) {
            toast.error(
              data[firstErrorKey][0] || "Registration failed. Please try again."
            );
          } else {
            toast.error(
              data.message || "Registration failed. Please try again."
            );
          }
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error(
          "An error occurred during registration. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Return a simple loading state if not mounted yet to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full min-h-screen flex items-start sm:items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-[90%] xs:max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg my-4">
          <div className="bg-white border border-[#1B1010] shadow-lg p-3 sm:p-4">
            <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-minecraft text-[#b99733]">
              Register
            </h2>
            <div className="h-[200px] sm:h-[500px]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-start justify-center py-0 px-4 overflow-y-auto pt-0">
      <div className="w-full max-w-[90%] xs:max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg mt-0 mb-6 sm:my-4">
        <div className="bg-white border border-[#1B1010] shadow-lg p-2 sm:p-4 md:p-6 scale-[0.85] sm:scale-100">
          <h2 className="text-center text-lg sm:text-2xl md:text-3xl font-minecraft text-[#b99733] mb-0.5 sm:mb-4">
            Register
          </h2>

          <form
            className="space-y-0.5 sm:space-y-3 md:space-y-4"
            onSubmit={handleSubmit}
          >
            {/* Full Name */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label
                htmlFor="fullName"
                className="text-xs sm:text-sm text-gray-700"
              >
                Full Name*
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-xs sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

            {/* Username */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label
                htmlFor="username"
                className="text-xs sm:text-sm text-gray-700"
              >
                Username*
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-xs sm:text-sm"
                placeholder="Choose a username"
              />
            </div>

            {/* Email */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label
                htmlFor="email"
                className="text-xs sm:text-sm text-gray-700"
              >
                Email Address*
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-xs sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label
                htmlFor="phone"
                className="text-xs sm:text-sm text-gray-700"
              >
                Phone Number*{" "}
                <span className="text-[9px] sm:text-xs">(WhatsApp)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-xs sm:text-sm"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Password */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label
                htmlFor="password"
                className="text-xs sm:text-sm text-gray-700"
              >
                Password*
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-xs sm:text-sm"
                placeholder="Create a password"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label
                htmlFor="confirmPassword"
                className="text-xs sm:text-sm text-gray-700"
              >
                Confirm Password*
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-xs sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start mt-0.5 sm:mt-2">
              <div className="flex items-center h-4">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-2 sm:ml-3">
                <label
                  htmlFor="agreeToTerms"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-700"
                >
                  By ticking, you agree to our{" "}
                  <a href="/terms" className="text-[#b99733] hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-1 sm:py-2 md:py-3 px-2 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-semibold text-white bg-linear-to-r from-[#967515] to-[#c8a84b] hover:from-[#866714] hover:to-[#b7973a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#967515] transition-all duration-300 rounded-none mt-0.5 sm:mt-4"
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            {/* Divider */}
            <div className="relative my-0.5 sm:my-3 md:my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs md:text-sm">
                <span className="px-2 sm:px-3 md:px-4 bg-white text-[#b99733]">
                  or
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              className="w-full flex justify-center items-center px-2 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 border border-gray-300 shadow-sm bg-white text-xs sm:text-sm md:text-base font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-none"
            >
              <Image
                className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 md:mr-3"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>

            {/* Login Link */}
            <div className="text-center text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-4">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/signin"
                className="text-[#b99733] underline hover:text-[#967515] transition-colors duration-300"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

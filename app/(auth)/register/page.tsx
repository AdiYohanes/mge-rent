/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "../layout";
import Link from "next/link";

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

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

    // Simulate API call
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful registration
      toast.success("Registration successful! You can now log in.");
      router.push("/signin");
    } catch (error) {
      toast.error("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Increased width here */}
      <div className="bg-white border border-[#1B1010] shadow-lg p-4">
        <h2 className="text-center text-3xl font-minecraft text-[#b99733]">
          Register
        </h2>

        <form className="space-y-1" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-sm text-gray-700">
              Full Name*
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <Label htmlFor="username" className="text-sm text-gray-700">
              Username*
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none"
              placeholder="Choose a username"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email Address*
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-sm text-gray-700">
              Phone Number* (Make sure this number is connected to WhatsApp)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm text-gray-700">
              Password*
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none"
              placeholder="Create a password"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
              Confirm Password*
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none"
              placeholder="Confirm your password"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToTerms" className="text-gray-700">
                By ticking, you are confirming that you have read, understood,
                and agree to our{" "}
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
            className="w-full py-3 px-6 text-base font-semibold text-white bg-linear-to-r from-[#967515] to-[#c8a84b] hover:from-[#866714] hover:to-[#b7973a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#967515] transition-all duration-300 rounded-none mt-6"
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#b99733]">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-none"
          >
            <Image
              className="h-5 w-5 mr-3"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            Sign in with Google
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm mt-6">
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
  );
};

export default RegisterPage;

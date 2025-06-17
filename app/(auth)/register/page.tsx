/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { register, RegisterRequestData, ErrorResponse } from "@/api";
import { AxiosError } from "axios";
import { z } from "zod";

// Password validation schema
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [passwordErrors, setPasswordErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

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

    // Validate passwords when either password field changes
    if (name === "password" || name === "confirmPassword") {
      try {
        passwordSchema.parse({
          password: name === "password" ? value : formData.password,
          confirmPassword:
            name === "confirmPassword" ? value : formData.confirmPassword,
        });
        setPasswordErrors({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: { [key: string]: string } = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
          setPasswordErrors(errors);
        }
      }
    }
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

    // Validate passwords using Zod
    try {
      passwordSchema.parse({
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
        return;
      }
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
    <div className="w-full flex items-start justify-center py-1 px-4">
      <div className="w-full max-w-[80%] xs:max-w-[70%] sm:max-w-[350px] -mt-4 sm:-mt-6">
        <div className="bg-white/95 backdrop-blur-sm border border-[#1B1010] shadow-lg p-3 sm:p-4">
          <h2 className="text-center text-sm sm:text-lg font-minecraft text-[#b99733] mb-2">
            Register
          </h2>

          <form className="space-y-1.5 sm:space-y-2" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-0.5">
              <Label
                htmlFor="fullName"
                className="text-[10px] sm:text-xs text-gray-700"
              >
                Name*
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-2 py-0.5 sm:px-2 sm:py-1 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-[10px] sm:text-xs"
                placeholder="Enter your name"
              />
            </div>

            {/* Username */}
            <div className="space-y-0.5">
              <Label
                htmlFor="username"
                className="text-[10px] sm:text-xs text-gray-700"
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
                className="w-full px-2 py-0.5 sm:px-2 sm:py-1 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-[10px] sm:text-xs"
                placeholder="Choose a username"
              />
            </div>

            {/* Email */}
            <div className="space-y-0.5">
              <Label
                htmlFor="email"
                className="text-[10px] sm:text-xs text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-2 py-0.5 sm:px-2 sm:py-1 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-[10px] sm:text-xs"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div className="space-y-0.5">
              <Label
                htmlFor="phone"
                className="text-[10px] sm:text-xs text-gray-700"
              >
                Phone Number*{" "}
                <span className="text-[8px] sm:text-[10px]">(WhatsApp)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-2 py-0.5 sm:px-2 sm:py-1 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none text-[10px] sm:text-xs"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Password */}
            <div className="space-y-0.5">
              <Label
                htmlFor="password"
                className="text-[10px] sm:text-xs text-gray-700"
              >
                Password*
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-2 py-0.5 sm:px-2 sm:py-1 border ${
                    passwordErrors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 rounded-none text-[10px] sm:text-xs`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={10} className="sm:text-xs" />
                  ) : (
                    <FaEye size={10} className="sm:text-xs" />
                  )}
                </button>
              </div>
              {passwordErrors.password && (
                <p className="text-[8px] sm:text-[10px] text-red-500 mt-0.5">
                  {passwordErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-0.5">
              <Label
                htmlFor="confirmPassword"
                className="text-[10px] sm:text-xs text-gray-700"
              >
                Confirm Password*
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-2 py-0.5 sm:px-2 sm:py-1 border ${
                    passwordErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } placeholder-gray-400 text-gray-900 rounded-none text-[10px] sm:text-xs`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={10} className="sm:text-xs" />
                  ) : (
                    <FaEye size={10} className="sm:text-xs" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-[8px] sm:text-[10px] text-red-500 mt-0.5">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-1.5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label
                htmlFor="agreeToTerms"
                className="text-[8px] sm:text-[10px] text-gray-700"
              >
                By ticking, you agree to our{" "}
                <a href="/terms" className="text-[#b99733] hover:underline">
                  Terms and Conditions
                </a>
              </label>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-0.5 sm:py-1 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-white bg-linear-to-r from-[#967515] to-[#c8a84b] hover:from-[#866714] hover:to-[#b7973a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#967515] transition-all duration-300 rounded-none"
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            {/* Divider */}
            <div className="relative my-1.5 sm:my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-[8px] sm:text-[10px]">
                <span className="px-2 bg-white text-[#b99733]">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              className="w-full flex justify-center items-center px-2 sm:px-3 py-0.5 sm:py-1 border border-gray-300 shadow-sm bg-white text-[10px] sm:text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-none"
            >
              <Image
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                width={12}
                height={12}
              />
              Sign in with Google
            </Button>

            {/* Login Link */}
            <div className="text-center text-[8px] sm:text-[10px] mt-1.5 sm:mt-2">
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

"use client";

import type React from "react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { login, LoginRequestData, ErrorResponse } from "@/api";
import { AxiosError } from "axios";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState<LoginRequestData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

    // Connect to backend API
    try {
      const response = await login(formData);

      if (response) {
        toast.success("Login successful!");

        // Redirect based on user role
        if (response.user.role === "ADMN" || response.user.role === "SADMN") {
          router.push("/admin/dashboard");
        } else {
          // Default redirect for CUST or any other roles
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      // Check for different error scenarios
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;

        if (axiosError.response?.status === 401) {
          errorMessage = "Incorrect username or password. Please try again.";
        } else if (axiosError.response?.status === 404) {
          errorMessage = "User not found. Please check your username.";
        } else if (axiosError.response?.data?.message) {
          // Use the error message from the server
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message === "Network Error") {
          errorMessage = "Network error. Please check your connection.";
        }
      }

      // Show the error message
      toast.error(errorMessage);

      // Reset the password field but keep the username
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-start sm:items-center justify-center py-2 px-4 overflow-y-auto pt-6 sm:pt-2">
      <div className="w-full max-w-[90%] xs:max-w-[85%] sm:max-w-sm md:max-w-md mt-4 sm:my-4">
        <div className="bg-white border border-[#1B1010] shadow-lg p-3 sm:p-6 md:p-8 scale-[0.90] sm:scale-100">
          <h2 className="text-center text-lg sm:text-2xl md:text-3xl font-minecraft text-[#b99733] mb-2 sm:mb-6">
            Login
          </h2>

          <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="username"
                className="text-xs sm:text-sm md:text-base text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-amber-500 focus:border-amber-500 rounded-none text-sm"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="password"
                className="text-xs sm:text-sm md:text-base text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none focus:ring-amber-500 focus:border-amber-500 text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={14} className="sm:text-base" />
                  ) : (
                    <FaEye size={14} className="sm:text-base" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <div>
                <Link
                  href="/auth/forgotPassword"
                  className="text-[10px] sm:text-xs md:text-sm font-medium text-[#b99733] hover:text-[#967515] transition-colors duration-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-1 sm:py-2 md:py-3 px-2 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-semibold text-white bg-linear-to-r from-[#967515] to-[#c8a84b] hover:from-[#866714] hover:to-[#b7973a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#967515] transition-all duration-300 rounded-none"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            {/* Divider */}
            <div className="relative my-2 sm:my-4 md:my-6">
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

            {/* Register Link */}
            <div className="text-center text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-4 md:mt-6">
              <span className="text-gray-600">
                Don&apos;t have an account yet?{" "}
              </span>
              <Link
                href="/register"
                className="text-[#b99733] underline hover:text-[#967515] transition-colors duration-300"
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

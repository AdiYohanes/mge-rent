"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
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
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";

const Login = () => {
  const [formData, setFormData] = useState<LoginRequestData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedUsername = getCookie("remembered_username");
    const savedPassword = getCookie("remembered_password");
    const remembered = getCookie("remember_me");

    if (savedUsername && savedPassword && remembered === "true") {
      setFormData({
        username: savedUsername,
        password: savedPassword,
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setRememberMe(checked);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
        // Handle Remember Me
        if (rememberMe) {
          // Set cookies for 30 days
          setCookie("remembered_username", formData.username, 30);
          setCookie("remembered_password", formData.password, 30);
          setCookie("remember_me", "true", 30);
        } else {
          // Remove cookies if Remember Me is unchecked
          deleteCookie("remembered_username");
          deleteCookie("remembered_password");
          deleteCookie("remember_me");
        }

        // Check if user has admin role, redirect to admin page if true
        if (response.user.role === "ADMN" || response.user.role === "SADMN") {
          toast.info("Please use the admin login page.");
          router.push("/admin");
          return;
        }

        // Only proceed for CUST role
        if (response.user.role === "CUST") {
          toast.success("Login successful!");
          router.push("/");
        } else {
          // For any unexpected roles
          toast.error("Invalid role for this login page.");
          setFormData((prev) => ({
            ...prev,
            password: "",
          }));
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
    <div className="w-full flex items-start justify-center py-2 px-4">
      <div className="w-full max-w-[85%] xs:max-w-[75%] sm:max-w-[400px]">
        {/*  Back Button */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/"
            className="flex items-center text-white md:text-[#b99733] hover:text-white/80 md:hover:text-[#967515] transition-colors duration-300"
            aria-label="Back to homepage"
          >
            <IoArrowBack className="w-5 h-5" />
            <span className="ml-1 text-sm">Back to Home</span>
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-[#1B1010] shadow-lg p-4 sm:p-5">
          <h2 className="text-center text-base sm:text-xl font-minecraft text-[#b99733] mb-3">
            Login
          </h2>

          <form className="space-y-2 sm:space-y-3" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="space-y-1">
              <Label
                htmlFor="username"
                className="text-xs sm:text-sm text-gray-700"
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
                className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-amber-500 focus:border-amber-500 rounded-none text-xs sm:text-sm"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <Label
                htmlFor="password"
                className="text-xs sm:text-sm text-gray-700"
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
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={12} className="sm:text-sm" />
                  ) : (
                    <FaEye size={12} className="sm:text-sm" />
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
                  checked={rememberMe}
                  onChange={handleChange}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <div>
                <Link
                  href="/forgotPassword"
                  className="text-[10px] sm:text-xs font-medium text-[#b99733] hover:text-[#967515] transition-colors duration-300"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-linear-to-r from-[#967515] to-[#c8a84b] hover:from-[#866714] hover:to-[#b7973a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#967515] transition-all duration-300 rounded-none"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            {/* Divider */}
            <div className="relative my-2 sm:my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs">
                <span className="px-2 sm:px-3 bg-white text-[#b99733]">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              className="w-full flex justify-center items-center px-2 sm:px-4 py-1 sm:py-2 border border-gray-300 shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-none"
            >
              <Image
                className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
                width={16}
                height={16}
              />
              Sign in with Google
            </Button>

            {/* Register Link */}
            <div className="text-center text-[10px] sm:text-xs mt-2 sm:mt-3">
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

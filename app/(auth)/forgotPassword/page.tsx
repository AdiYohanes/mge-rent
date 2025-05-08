/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "../layout";
import Link from "next/link";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show toast indicating the email was sent
      toast.success(
        "Password reset link has been sent to your email. Please check your inbox."
      );

      // Redirect to login after 3 seconds to give time to check the toast message
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-[#1B1010] shadow-lg p-6 md:p-8">
        <h2 className="text-center text-3xl font-minecraft text-[#b99733] mb-4">
          Forgot Password
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Enter your email address below. We will send you a link to reset your
          password.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 text-base font-semibold text-white bg-linear-to-r from-[#967515] to-[#c8a84b] hover:from-[#866714] hover:to-[#b7973a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#967515] transition-all duration-300 rounded-none"
          >
            {loading ? "Sending Email..." : "Send Email"}
          </Button>

          <div className="text-center mt-4">
            <Link
              href="/signin"
              className="text-sm text-[#b99733] hover:text-[#967515] transition-colors duration-300"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

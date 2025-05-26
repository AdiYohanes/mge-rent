"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserFromCookie, updateUserCookie } from "@/utils/cookieUtils";

// Cookie names
const USER_COOKIE = "auth_user";

interface UserData {
  fullName?: string;
  email?: string;
  username: string;
  phoneNumber?: string;
  [key: string]: string | undefined;
}

export default function Profile() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = getUserFromCookie();
    if (userData) {
      setUser(userData);
      if (userData.fullName) setFullName(userData.fullName);
      if (userData.email) setEmail(userData.email);
      if (userData.username) setUsername(userData.username);
      if (userData.phoneNumber) setPhoneNumber(userData.phoneNumber);
    } else {
      router.push("/signin");
    }
  }, [router]);

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      fullName,
      email,
      username,
      phoneNumber,
    };

    // Update user cookie
    updateUserCookie(updatedUser);
    setUser(updatedUser);
    alert("Personal information saved successfully!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (!currentPassword) {
      alert("Please enter your current password!");
      return;
    }

    // In a real app, you would validate the current password against the stored password
    // and then update it in the database

    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-funnel">
      <h1 className="text-5xl font-bold mb-8 text-center font-minecraft">
        <span className="text-black">Edit </span>
        <span className="text-[#B99733] ">Profile</span>
      </h1>

      <div className="text-center mb-10">
        <div className="flex justify-center items-center space-x-4">
          <div className="text-[#B99733] text-4xl">•</div>
          <div className="text-black text-4xl">•</div>
          <div className="text-[#B99733] text-4xl">•</div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="border border-[#B99733] p-6 mb-8">
        <h2 className="text-xl text-[#B99733] mb-4 font-minecraft">
          Personal Information
        </h2>

        <form onSubmit={handleSavePersonalInfo}>
          <div className="mb-4">
            <label className="block mb-1">Full Name*</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Username*</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Phone Number*</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#B99733] text-white py-2 hover:bg-[#A88722] transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="border border-[#B99733] p-6">
        <h2 className="text-xl text-[#B99733] mb-4 font-minecraft">
          Change Password
        </h2>

        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label className="block mb-1">Current Password*</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 p-2"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#B99733] text-white py-2 hover:bg-[#A88722] transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

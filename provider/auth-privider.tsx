/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

// Define types
type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (password: string, token: string) => Promise<boolean>;
  isLoading: boolean;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database for demo purposes
const mockUsers = [
  {
    id: "1",
    username: "testUser",
    password: "testPassword",
    email: "test@example.com",
    fullName: "Test User",
    phone: "1234567890",
  },
];

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login function
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = mockUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        toast.success("Login successful!");
        return true;
      } else {
        toast.error("Invalid credentials");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if user already exists
      const userExists = mockUsers.some(
        (u) => u.username === userData.username || u.email === userData.email
      );

      if (userExists) {
        toast.error("Username or email already exists");
        return false;
      }

      // In a real app, we would save the user to the database
      // For this demo, we'll just simulate success
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      toast.error("An error occurred during registration");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    toast.success("Logged out successfully");
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userExists = mockUsers.some((u) => u.email === email);

      if (!userExists) {
        // For security reasons, we don't want to reveal if an email exists or not
        // So we'll show success message regardless
        toast.success(
          "If your email exists in our system, you will receive a password reset link"
        );
        return true;
      }

      toast.success("Password reset link sent to your email");
      return true;
    } catch (error) {
      toast.error("An error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (
    password: string,
    token: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, we would validate the token and update the password
      // For this demo, we'll just simulate success
      toast.success("Password reset successfully");
      return true;
    } catch (error) {
      toast.error("An error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

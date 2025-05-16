import { post } from "../apiUtils";
import { AUTH_ENDPOINTS } from "../constants";
import Cookies from "js-cookie";

// Types
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: "ADMN" | "SADMN" | "CUST";
    email?: string;
    name?: string;
  };
}

export interface LoginRequestData {
  username: string;
  password: string;
}

export interface RegisterRequestData {
  username: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    username: string;
    role: string;
    email?: string;
    name?: string;
  };
}

export interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// Login function
export const login = async (data: LoginRequestData): Promise<AuthResponse> => {
  const response = await post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);

  // Store user data and token in cookies
  if (response) {
    const userData = response.user;
    const token = response.token;

    // Set secure cookies with 7 days expiration
    Cookies.set("user", JSON.stringify(userData), {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
    });
    Cookies.set("token", token, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
};

// Register function
export const register = async (
  data: RegisterRequestData
): Promise<RegisterResponse> => {
  return await post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, data);
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint if needed
    await post(AUTH_ENDPOINTS.LOGOUT, {});
  } catch {
    // Handle error silently
    console.error("Logout API error");
  } finally {
    // Always clear cookies
    Cookies.remove("token");
    Cookies.remove("user");
  }
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return !!Cookies.get("token");
};

// Get current user
export const getCurrentUser = (): AuthResponse["user"] | null => {
  const userJson = Cookies.get("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

import { post } from "../apiUtils";
import { AUTH_ENDPOINTS } from "../constants";
import {
  setAuthCookies,
  clearAuthCookies,
  getTokenFromCookie,
  getUserFromCookie,
} from "@/utils/cookieUtils";

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
  if (response && response.token) {
    const userData = response.user;
    const token = response.token;

    console.log(
      "Login berhasil, menyimpan token:",
      token.substring(0, 10) + "..."
    );

    // Set auth cookies
    setAuthCookies(token, userData);
  } else {
    console.error("Login response tidak memiliki token:", response);
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
    clearAuthCookies();
  }
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  // Check if running on server
  if (typeof window === "undefined") {
    return false;
  }
  return !!getTokenFromCookie();
};

// Get current user
export const getCurrentUser = (): AuthResponse["user"] | null => {
  // Check if running on server
  if (typeof window === "undefined") {
    return null;
  }

  return getUserFromCookie();
};

// Debug helper untuk memeriksa status token
export const debugToken = (): string => {
  // Check if running on server
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "Running on server (SSR), cookies not accessible";
  }

  const token = getTokenFromCookie();
  const user = getUserFromCookie();

  return `Token: ${
    token ? `${token.substring(0, 15)}...` : "TIDAK ADA"
  }, User: ${user ? user.username : "TIDAK ADA"}`;
};

// Check token validity and health
export const checkTokenHealth = (): {
  hasToken: boolean;
  hasUser: boolean;
  tokenLength: number;
  tokenPrefix: string;
  userRole?: string;
  issues: string[];
} => {
  // Check if running on server
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      hasToken: false,
      hasUser: false,
      tokenLength: 0,
      tokenPrefix: "",
      issues: ["Running on server (SSR), cookies not accessible"],
    };
  }

  const token = getTokenFromCookie() || "";
  const user = getUserFromCookie();
  const issues: string[] = [];

  // Check token
  if (!token) {
    issues.push("Token tidak ditemukan dalam cookies");
  } else if (token.length < 20) {
    issues.push(`Token terlalu pendek (${token.length} karakter)`);
  }

  // Check token format
  const tokenPrefix = token ? token.substring(0, 10) : "";
  if (token && !token.includes(".")) {
    issues.push("Token tidak mengikuti format JWT (tidak ada titik)");
  }

  // Check user data
  if (!user) {
    issues.push("Data user tidak ditemukan dalam cookies");
  } else {
    if (!user.id) issues.push("Data user tidak memiliki ID");
    if (!user.username) issues.push("Data user tidak memiliki username");
    if (!user.role) issues.push("Data user tidak memiliki role");
  }

  return {
    hasToken: !!token,
    hasUser: !!user,
    tokenLength: token.length,
    tokenPrefix,
    userRole: user?.role,
    issues,
  };
};

// Function to get Authorization header - easy for beginners to use
export const getAuthHeader = ():
  | { Authorization: string }
  | Record<string, never> => {
  // Check if running on server
  if (typeof window === "undefined") {
    console.warn(
      "getAuthHeader dipanggil di server side, mengembalikan header kosong"
    );
    return {};
  }

  const token = getTokenFromCookie();
  if (!token) {
    console.warn("Token tidak ditemukan, autentikasi tidak dapat dilakukan");
    return {};
  }

  // Log partial token for debugging
  const tokenPreview =
    token.substring(0, 5) + "..." + token.substring(token.length - 5);
  console.log(`Auth header created with token: ${tokenPreview}`);

  return { Authorization: `Bearer ${token}` };
};

import Cookies from "js-cookie";

// Cookie names
export const TOKEN_COOKIE = "auth_token";
export const USER_COOKIE = "auth_user";

// User data interface
export interface UserData {
  id: string;
  username: string;
  role: "ADMN" | "SADMN" | "CUST";
  email?: string;
  name?: string;
  phoneNumber?: string;
  phone?: string;
}

// Detect if we're running on HTTPS
const isHttps =
  typeof window !== "undefined" && window.location.protocol === "https:";

// Get domain for cookies
const getDomain = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  // In production, we might want to set cookies at the root domain level
  // This allows sharing between subdomains
  const hostname = window.location.hostname;

  // For localhost or IP addresses, don't set domain (browser default behavior works best)
  if (hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return undefined;
  }

  // Extract root domain - this is a simplified approach
  // For real production, you may need more sophisticated logic based on your domain structure
  const parts = hostname.split(".");
  if (parts.length > 2) {
    // Return root domain with leading dot for broader compatibility
    return `.${parts.slice(-2).join(".")}`;
  }

  return hostname;
};

// Cookie configuration
export const AUTH_COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: "/",
  secure: isHttps, // Set secure flag if HTTPS
  sameSite: isHttps ? ("none" as const) : ("lax" as const), // Less restrictive SameSite
  domain: getDomain(),
};

/**
 * Set authentication cookies
 */
export const setAuthCookies = (token: string, userData: UserData) => {
  try {
    // For secure flag to work with sameSite=none in cross-domain scenarios
    const options = {
      ...AUTH_COOKIE_OPTIONS,
      // Ensure secure is true when sameSite is none (browser requirement)
      secure:
        AUTH_COOKIE_OPTIONS.sameSite === "none"
          ? true
          : AUTH_COOKIE_OPTIONS.secure,
    };

    // Pastikan semua data user tersimpan
    const userDataToStore = {
      ...userData,
      name: userData.name || userData.username,
      phoneNumber: userData.phoneNumber || userData.phone,
    };

    Cookies.set(USER_COOKIE, JSON.stringify(userDataToStore), options);
    Cookies.set(TOKEN_COOKIE, token, options);

    console.log("Auth cookies set successfully:", {
      token: token ? token.substring(0, 5) + "..." : "NO TOKEN",
      user: userDataToStore
        ? {
            username: userDataToStore.username,
            name: userDataToStore.name,
            email: userDataToStore.email,
            phoneNumber: userDataToStore.phoneNumber,
          }
        : "NO USER DATA",
      options: JSON.stringify({
        ...options,
        domain: options.domain || "default (full hostname)",
      }),
      protocol:
        typeof window !== "undefined" ? window.location.protocol : "N/A",
      calculatedIsHttps: isHttps,
      calculatedDomain: getDomain() || "default (full hostname)",
    });
  } catch (e) {
    console.error("Failed to set auth cookies:", e);
  }
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = () => {
  try {
    // Use the same path and domain when clearing
    const options = {
      path: AUTH_COOKIE_OPTIONS.path,
      domain: AUTH_COOKIE_OPTIONS.domain,
    };

    Cookies.remove(TOKEN_COOKIE, options);
    Cookies.remove(USER_COOKIE, options);
    console.log("Auth cookies cleared successfully");
  } catch (e) {
    console.error("Failed to clear auth cookies:", e);
  }
};

/**
 * Get user data from cookies
 */
export const getUserFromCookie = () => {
  try {
    const userCookie = Cookies.get(USER_COOKIE);
    if (!userCookie) return null;
    return JSON.parse(userCookie);
  } catch (e) {
    console.error("Error parsing user cookie:", e);
    return null;
  }
};

/**
 * Get auth token from cookies
 */
export const getTokenFromCookie = () => {
  return Cookies.get(TOKEN_COOKIE) || null;
};

/**
 * Check if user is authenticated (has a valid token)
 */
export const isAuthenticated = () => {
  return !!Cookies.get(TOKEN_COOKIE);
};

/**
 * Update user data in cookie
 */
export const updateUserCookie = (userData: UserData) => {
  try {
    Cookies.set(USER_COOKIE, JSON.stringify(userData), AUTH_COOKIE_OPTIONS);
    console.log("User cookie updated successfully");
  } catch (e) {
    console.error("Failed to update user cookie:", e);
  }
};

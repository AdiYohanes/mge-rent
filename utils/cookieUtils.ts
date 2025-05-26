import Cookies from "js-cookie";

// Cookie names
export const TOKEN_COOKIE = "auth_token";
export const USER_COOKIE = "auth_user";

// Cookie configuration
export const AUTH_COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: "/",
  secure: process.env.NODE_ENV === "production", // Only use secure in production
  sameSite: "strict" as const,
};

/**
 * Set authentication cookies
 */
export const setAuthCookies = (token: string, userData: any) => {
  Cookies.set(USER_COOKIE, JSON.stringify(userData), AUTH_COOKIE_OPTIONS);
  Cookies.set(TOKEN_COOKIE, token, AUTH_COOKIE_OPTIONS);
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = () => {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
  Cookies.remove(USER_COOKIE, { path: "/" });
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
export const updateUserCookie = (userData: any) => {
  Cookies.set(USER_COOKIE, JSON.stringify(userData), AUTH_COOKIE_OPTIONS);
};

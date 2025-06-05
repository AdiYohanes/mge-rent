// API Base URL
export const API_BASE_URL = "http://localhost:8000/api";
export const STORAGE_URL = "http://localhost:8000/storage";

// Image URLs
export const IMAGE_URLS = {
  CONSOLE_IMAGES: `${STORAGE_URL}/images/console`,
  DEFAULT_CONSOLE_IMAGE: "/images/ask.png",
  FNB_IMAGES: `${STORAGE_URL}/images/fnb`,
  DEFAULT_FNB_IMAGE: "/images/food/beef.jpg", // Changed to .jpg
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_USERS: `${API_BASE_URL}/admin/user`,
  GET_USER: (id: string) => `${API_BASE_URL}/admin/user/${id}`,
  CREATE_USER: `${API_BASE_URL}/admin/user`,
  UPDATE_USER: (id: string) => `${API_BASE_URL}/admin/user/${id}`,
  DELETE_USER: (id: string) => `${API_BASE_URL}/admin/user/${id}`,
  UPDATE_PROFILE: `${API_BASE_URL}/user/profile`,
};

// Console endpoints
export const CONSOLE_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/consoles`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/consoles/${id}`,
  CREATE_CONSOLE: `${API_BASE_URL}/admin/consoles`,
  UPDATE_CONSOLE: (id: string) => `${API_BASE_URL}/admin/consoles/${id}`,
  DELETE_CONSOLE: (id: string) => `${API_BASE_URL}/admin/consoles/${id}`,
};

// Room endpoints
export const ROOM_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/rooms`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/rooms/${id}`,
  CREATE_ROOM: `${API_BASE_URL}/admin/rooms`,
  UPDATE_ROOM: (id: string) => `${API_BASE_URL}/admin/rooms/${id}`,
  DELETE_ROOM: (id: string) => `${API_BASE_URL}/admin/rooms/${id}`,
};

// Game endpoints
export const GAME_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/games`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/games/${id}`,
  CREATE_GAME: `${API_BASE_URL}/admin/games`,
  UPDATE_GAME: (id: string) => `${API_BASE_URL}/admin/games/${id}`,
  DELETE_GAME: (id: string) => `${API_BASE_URL}/admin/games/${id}`,
};

// Food and Drink endpoints
export const FNB_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/fnb`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/fnb/${id}`,
  CREATE_FNB: `${API_BASE_URL}/admin/fnb`,
  UPDATE_FNB: (id: string) => `${API_BASE_URL}/admin/fnb/${id}`,
  DELETE_FNB: (id: string) => `${API_BASE_URL}/admin/fnb/${id}`,
};

// Restaurant (public FNB) endpoints
export const RESTAURANT_ENDPOINTS = {
  GET_ALL_FNBS: `${API_BASE_URL}/fnbs`,
  GET_FOOD: `${API_BASE_URL}/fnbs/food`,
  GET_BEVERAGES: `${API_BASE_URL}/fnbs/beverages`,
  GET_SNACKS: `${API_BASE_URL}/fnbs/snacks`,
};

// Food and Drink Category endpoints
export const FNB_CATEGORY_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/fnb-category`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/fnb-category/${id}`,
  CREATE_CATEGORY: `${API_BASE_URL}/admin/fnb-category`,
  UPDATE_CATEGORY: (id: string) => `${API_BASE_URL}/admin/fnb-category/${id}`,
  DELETE_CATEGORY: (id: string) => `${API_BASE_URL}/admin/fnb-category/${id}`,
};

// Promo endpoints
export const PROMO_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/promos`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/promos/${id}`,
  CREATE_PROMO: `${API_BASE_URL}/admin/promos`,
  UPDATE_PROMO: (id: string) => `${API_BASE_URL}/admin/promos/${id}`,
  DELETE_PROMO: (id: string) => `${API_BASE_URL}/admin/promos/${id}`,
};

// FAQ endpoints
export const FAQ_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/faqs`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/faqs/${id}`,
  CREATE_FAQ: `${API_BASE_URL}/admin/faqs`,
  UPDATE_FAQ: (id: string) => `${API_BASE_URL}/admin/faqs/${id}`,
  DELETE_FAQ: (id: string) => `${API_BASE_URL}/admin/faqs/${id}`,
};

// Booking endpoints
export const BOOKING_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/admin/bookings`,
  GET_ONE: (id: string) => `${API_BASE_URL}/admin/bookings/${id}`,
  CREATE_BOOKING: `${API_BASE_URL}/admin/bookings`,
  UPDATE_BOOKING: (id: string) => `${API_BASE_URL}/admin/bookings/${id}`,
  DELETE_BOOKING: (id: string) => `${API_BASE_URL}/admin/bookings/${id}`,
  APPROVE_BOOKING: (id: string) =>
    `${API_BASE_URL}/admin/bookings/${id}/approve`,
  REJECT_BOOKING: (id: string) => `${API_BASE_URL}/admin/bookings/${id}/reject`,
};

// Public endpoints for customer-facing features
export const PUBLIC_ENDPOINTS = {
  GET_FAQS: `${API_BASE_URL}/customer/faq`,
};

// API Endpoints grouped by feature
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  USER: `${API_BASE_URL}/admin/user`,
  CONSOLE: `${API_BASE_URL}/admin/consoles`,
  ROOM: `${API_BASE_URL}/admin/rooms`,
  GAME: `${API_BASE_URL}/admin/games`,
  FNB: `${API_BASE_URL}/admin`,
  PROMO: `${API_BASE_URL}/admin/promos`,
  FAQ: `${API_BASE_URL}/admin/faqs`,
  BOOKING: `${API_BASE_URL}/admin/bookings`,
  PUBLIC: `${API_BASE_URL}`,
  RESTAURANT: `${API_BASE_URL}`,
};

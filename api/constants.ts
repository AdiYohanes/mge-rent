// API Base URL
export const API_BASE_URL = "http://mge.168.231.84.221.sslip.io/api";

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

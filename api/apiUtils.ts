import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "./constants";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");

      // Optional: Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
};

// Convenience methods
export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>("get", url, undefined, config);

export const post = <T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
) => apiRequest<T>("post", url, data, config);

export const put = <T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
) => apiRequest<T>("put", url, data, config);

export const patch = <T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
) => apiRequest<T>("patch", url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>("delete", url, undefined, config);

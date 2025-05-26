import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { API_BASE_URL } from "./constants";
import Cookies from "js-cookie";

// Cookie names
const TOKEN_COOKIE = "auth_token";
const USER_COOKIE = "auth_user";

// Safe environment detection
const isServer =
  typeof window === "undefined" || typeof document === "undefined";
const isDev = process.env.NODE_ENV !== "production";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Don't send credentials by default - let each request decide
  withCredentials: false,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Skip token handling on server to prevent hydration issues
    if (!isServer) {
      const token = Cookies.get(TOKEN_COOKIE);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Add debug logging to track token usage
        console.log(
          `Auth: Using token (first 10 chars): ${token.substring(0, 10)}...`
        );
      } else {
        console.warn(
          "Auth: No token found in cookies for request to",
          config.url
        );
      }

      // Minimal debug logging in development only
      if (isDev) {
        // Log only the method and URL, avoid logging sensitive data
        console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
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
    // Skip auth handling on server to prevent hydration issues
    if (!isServer && error.response?.status === 401) {
      console.error("401 Unauthorized error detected", {
        url: error.config?.url,
        method: error.config?.method,
        responseMessage: error.response?.data
          ? (error.response.data as { message?: string }).message ||
            "No message"
          : "No data",
        hasToken: !!Cookies.get(TOKEN_COOKIE),
      });

      // Check if this is a login attempt or already on login page
      const isLoginAttempt = error.config?.url?.includes("/auth/login");
      const isOnLoginPage =
        typeof window !== "undefined" &&
        (window.location.pathname.includes("/signin") ||
          window.location.pathname.includes("/login"));

      // Don't show alert or redirect for login attempts
      if (!isLoginAttempt && !isOnLoginPage) {
        // Clear authentication data
        Cookies.remove(TOKEN_COOKIE, { path: "/" });
        Cookies.remove(USER_COOKIE, { path: "/" });

        // Show message to user
        if (typeof window !== "undefined" && window.alert) {
          window.alert(
            "Sesi login Anda telah berakhir. Anda akan dialihkan ke halaman login."
          );
        }

        // Redirect to login on client side only
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

/**
 * Make an API request with support for FormData file uploads
 */
export const makeApiRequest = async <T>(
  method: string,
  url: string,
  data?: unknown,
  isFormData = false,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Create a config object with the right content type for FormData
    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
      },
    };

    // Only set content type if it's not FormData
    if (!isFormData) {
      requestConfig.headers = {
        ...requestConfig.headers,
        "Content-Type": "application/json",
      };
    } else {
      // FormData case - add necessary headers for Laravel
      requestConfig.headers = {
        ...requestConfig.headers,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        // Jika masih perlu XSRF-TOKEN, bisa menggunakan cara lain untuk mendapatkannya
        // "X-XSRF-TOKEN": !isServer ? Cookies.get("XSRF-TOKEN") || "" : "",
      };
    }

    const response = await apiRequest<T>(method, url, data, requestConfig);
    return response;
  } catch (error) {
    throw error;
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

/**
 * Helper function to prepare a file for upload
 */
export const prepareFileForUpload = (
  file: File,
  acceptedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
  ]
): File => {
  if (!file || isServer) return file;

  try {
    console.log("PrepareFileForUpload input:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      extension: file.name.split(".").pop()?.toLowerCase() || "unknown",
    });

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      console.warn(
        `File type ${file.type} not in accepted types:`,
        acceptedTypes
      );
      throw new Error(`File type ${file.type} not supported`);
    }

    // Ensure file has correct extension
    let fileName = file.name;
    const fileExt = fileName.split(".").pop()?.toLowerCase();

    // Map mime types to extensions
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
    };

    const correctExt = mimeToExt[file.type];
    if (!correctExt) {
      console.warn(`No extension mapping for MIME type: ${file.type}`);
      return file;
    }

    // Fix extension if needed
    if (!fileExt || !correctExt.includes(fileExt)) {
      console.log(
        `Extension mismatch: file has "${fileExt}", should have "${correctExt}"`
      );

      const baseName = fileName.includes(".")
        ? fileName.substring(0, fileName.lastIndexOf("."))
        : fileName;

      fileName = `${baseName}${correctExt}`;
      console.log(`Corrected filename: ${fileName}`);

      // Create new file with correct name
      const correctedFile = new File([file], fileName, { type: file.type });

      console.log("PrepareFileForUpload output (corrected):", {
        name: correctedFile.name,
        type: correctedFile.type,
        size: `${(correctedFile.size / 1024).toFixed(2)} KB`,
        extension: correctedFile.name.split(".").pop()?.toLowerCase(),
      });

      return correctedFile;
    }

    console.log("PrepareFileForUpload output (unchanged):", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      extension: file.name.split(".").pop()?.toLowerCase(),
    });

    return file;
  } catch (error) {
    // Log the error and return original file
    console.error("Error in prepareFileForUpload:", error);
    return file;
  }
};

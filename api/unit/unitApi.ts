import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAuthHeader } from "../auth/authApi";
import { getTokenFromCookie, clearAuthCookies } from "@/utils/cookieUtils";

// Type definitions
export interface Unit {
  id: number | string;
  room_id: number;
  console_id: number;
  name: string;
  game_ids: number[];
  description?: string;
  status: "available" | "booked" | "serviced";
  features: string[];
  available_at: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  // Additional fields for UI display (populated from related entities)
  room_name?: string;
  console_name?: string;
  games?: any[]; // Will be populated with game details
  rent_price?: number;
}

export interface UnitPayload {
  room_id: number;
  console_id: number;
  name: string;
  game_ids: number[];
  description?: string;
  status: "available" | "booked" | "serviced";
  features: string[];
  available_at?: string | null;
}

// Response types
interface ApiResponse<T> {
  data?: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    search: string;
  };
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Get all units with pagination
 */
export const getUnits = async (
  page = 1,
  perPage = 10,
  search = ""
): Promise<ApiResponse<Unit[]>> => {
  try {
    // Validasi autentikasi menggunakan cookies
    if (typeof window !== "undefined" && !getTokenFromCookie()) {
      console.warn("Token tidak ditemukan, autentikasi diperlukan");
      throw new Error(
        "Anda harus login untuk melihat daftar unit. Silakan login terlebih dahulu."
      );
    }

    // Debug token info
    if (typeof window !== "undefined") {
      const token = getTokenFromCookie();
      if (token) {
        const tokenPreview = token.substring(0, 10) + "...";
        console.log("Menggunakan token untuk getUnits:", tokenPreview);
      }
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });

    if (search) {
      queryParams.set("search", search);
    }

    // Use axios with authentication header
    const response = await axios.get(
      `${API_BASE_URL}/admin/units?${queryParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      }
    );

    return {
      data: response.data.data || [],
      meta: response.data.meta,
    };
  } catch (error) {
    console.error("Error mengambil daftar unit:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Hapus token dan user dari cookies
        if (typeof window !== "undefined") {
          clearAuthCookies();
        }
        throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
      }

      // Handle specific error responses
      if (error.response?.data?.message) {
        throw new Error(`Error: ${error.response.data.message}`);
      }
    }

    throw error instanceof Error
      ? error
      : new Error("Gagal mengambil daftar unit. Silakan coba lagi nanti.");
  }
};

/**
 * Add a new unit
 */
export const addUnit = async (
  unitData: UnitPayload
): Promise<ApiResponse<Unit>> => {
  try {
    // Validasi autentikasi menggunakan cookies
    if (typeof window !== "undefined" && !getTokenFromCookie()) {
      throw new Error(
        "Anda harus login untuk menambahkan unit. Silakan login terlebih dahulu."
      );
    }

    console.log("Mengirim data unit ke API:", unitData);

    // Use axios with authentication header
    const response = await axios.post(`${API_BASE_URL}/admin/units`, unitData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
      },
    });

    console.log("Respons API addUnit:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error API addUnit:", error);

    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Response headers:", error.response?.headers);

      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Hapus token dan user dari cookies
        if (typeof window !== "undefined") {
          clearAuthCookies();
        }
        throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
      }

      // Debug tambahan untuk error 422
      if (error.response?.status === 422) {
        console.error("Validation error detail:", error.response?.data);
        if (Object.keys(error.response?.data || {}).length === 0) {
          console.error("Empty validation response, might be a server issue");
        }
      }
    }

    throw formatApiError(error, "Gagal menambahkan unit");
  }
};

/**
 * Update an existing unit
 */
export const updateUnit = async (
  id: string | number,
  unitData: Partial<UnitPayload>
): Promise<ApiResponse<Unit>> => {
  try {
    // Validasi autentikasi menggunakan cookies
    if (typeof window !== "undefined" && !getTokenFromCookie()) {
      throw new Error(
        "Anda harus login untuk mengubah unit. Silakan login terlebih dahulu."
      );
    }

    if (!id) throw new Error("ID unit diperlukan untuk update");

    console.log("Mengupdate unit dengan ID:", id, unitData);

    // Create FormData for Laravel compatibility
    const formData = new FormData();

    // Add _method=PUT for Laravel method spoofing
    formData.append("_method", "POST");

    // Add all unit data fields to the FormData
    Object.entries(unitData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // For arrays like game_ids and features, ensure they are properly formatted
        if (Array.isArray(value)) {
          // For features array, ensure it's properly formatted
          if (key === "game_ids" || key === "features") {
            value.forEach((item) => {
              formData.append(`${key}[]`, String(item));
            });
          } else {
            // Untuk array lain yang mungkin ada (jika backend Anda mengharapkan string JSON),
            // biarkan tetap di-stringify. Namun, untuk kasus Anda, game_ids dan features
            // kemungkinan besar adalah satu-satunya array yang perlu penanganan khusus ini.
            formData.append(key, JSON.stringify(value));
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });

    console.log("FormData prepared with fields:", Object.fromEntries(formData));

    // Use axios directly with FormData
    const response = await axios.post(
      `${API_BASE_URL}/admin/units/${id}`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          // Don't set Content-Type for FormData, browser will add with boundary
          ...getAuthHeader(),
        },
      }
    );

    console.log("Respons API updateUnit:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error API updateUnit:", error);

    if (axios.isAxiosError(error)) {
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        clearAuthCookies();
        throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
      }

      // Debug tambahan untuk error 422
      if (error.response?.status === 422) {
        console.error("Validation error detail:", error.response?.data);
      }
    }

    throw formatApiError(error, `Gagal mengupdate unit #${id}`);
  }
};

/**
 * Delete a unit
 */
export const deleteUnit = async (
  id: string | number
): Promise<ApiResponse<unknown>> => {
  try {
    // Validasi autentikasi menggunakan cookies
    if (typeof window !== "undefined" && !getTokenFromCookie()) {
      throw new Error(
        "Anda harus login untuk menghapus unit. Silakan login terlebih dahulu."
      );
    }

    if (!id) throw new Error("ID unit diperlukan untuk penghapusan");

    // Use axios with DELETE method (Laravel requires method spoofing for non-GET/POST)
    const response = await axios.post(
      `${API_BASE_URL}/admin/units/${id}`,
      { _method: "DELETE" },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      }
    );

    console.log("Respons API deleteUnit:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error API deleteUnit:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthCookies();
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }

    throw formatApiError(error, `Gagal menghapus unit #${id}`);
  }
};

/**
 * Format API errors in a consistent way
 */
function formatApiError(error: unknown, defaultMessage: string): Error {
  if (axios.isAxiosError(error) && error.response) {
    // Handle validation errors
    if (error.response.status === 422) {
      if (error.response.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();

        if (errorMessages.length > 0) {
          return new Error(`Validation error: ${errorMessages[0]}`);
        }
      }

      if (error.response.data?.message) {
        return new Error(error.response.data.message);
      }

      return new Error("Validasi gagal. Periksa semua field.");
    }

    // Handle foreign key constraint violations
    if (
      error.response.status === 500 &&
      error.response.data?.message &&
      typeof error.response.data.message === "string" &&
      error.response.data.message.includes("foreign key constraint")
    ) {
      return new Error(
        "Unit ini tidak dapat dihapus karena masih terhubung dengan data lain."
      );
    }

    // Handle other API errors with messages
    if (error.response.data?.message) {
      return new Error(error.response.data.message);
    }
  }

  // For other errors, use the error message or default
  return error instanceof Error ? error : new Error(defaultMessage);
}

import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAuthHeader } from "../auth/authApi";
import Cookies from "js-cookie";

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
    // Validate authentication
    if (!Cookies.get("token")) {
      throw new Error(
        "Anda harus login untuk melihat daftar unit. Silakan login terlebih dahulu."
      );
    }

    console.log("Mengambil daftar unit");

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

    console.log(
      "Berhasil mengambil daftar unit:",
      response.data.data?.length || 0,
      "unit"
    );

    return {
      data: response.data.data || [],
      meta: response.data.meta,
    };
  } catch (error) {
    console.error("Error mengambil daftar unit:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }

    throw formatApiError(error, "Gagal mengambil daftar unit");
  }
};

/**
 * Add a new unit
 */
export const addUnit = async (
  unitData: UnitPayload
): Promise<ApiResponse<Unit>> => {
  try {
    // Validate authentication
    const token = Cookies.get("token");
    if (!token) {
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
        Cookies.remove("token");
        Cookies.remove("user");
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
    // Validate authentication
    if (!Cookies.get("token")) {
      throw new Error(
        "Anda harus login untuk mengubah unit. Silakan login terlebih dahulu."
      );
    }

    if (!id) throw new Error("ID unit diperlukan untuk update");

    console.log("Mengupdate unit dengan ID:", id, unitData);

    // Create FormData for Laravel compatibility
    const formData = new FormData();

    // Add _method=PUT for Laravel method spoofing
    formData.append("_method", "PUT");

    // Add all unit data fields to the FormData
    Object.entries(unitData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // For arrays like game_ids and features, convert to JSON string
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
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

    console.log("Respons update unit:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error mengupdate unit:", error);

    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Request URL:", error.config?.url);
      console.error("Request method:", error.config?.method);
      console.error("Request headers:", error.config?.headers);

      // If it's a 405 Method Not Allowed, provide more detailed information
      if (error.response?.status === 405) {
        console.error(
          "405 Method Not Allowed - The server does not allow the method used for this endpoint."
        );
        console.error(
          "Make sure the endpoint supports POST with _method spoofing or adjust the API call."
        );
      }

      if (error.response?.status === 401) {
        Cookies.remove("token");
        Cookies.remove("user");
        throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
      }
    }

    throw formatApiError(error, `Gagal mengupdate unit #${id}`);
  }
};

/**
 * Delete a unit by ID
 */
export const deleteUnit = async (
  id: string | number
): Promise<ApiResponse<unknown>> => {
  try {
    // Validate authentication
    if (!Cookies.get("token")) {
      throw new Error(
        "Anda harus login untuk menghapus unit. Silakan login terlebih dahulu."
      );
    }

    if (!id) throw new Error("ID unit diperlukan untuk penghapusan");

    console.log("Menghapus unit dengan ID:", id);

    // Use axios with authentication header
    const response = await axios.delete(`${API_BASE_URL}/admin/units/${id}`, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
      },
    });

    console.log("Respons hapus unit:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error menghapus unit:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
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

      // Handle empty validation response or non-standard format
      if (Object.keys(error.response.data || {}).length === 0) {
        return new Error(
          "Validasi gagal: Server tidak memberikan detail error."
        );
      }

      if (error.response.data?.message) {
        return new Error(error.response.data.message);
      }

      return new Error("Validasi gagal. Periksa semua field.");
    }

    // Handle other API errors with messages
    if (error.response.data?.message) {
      return new Error(error.response.data.message);
    }
  }

  // For other errors, use the error message or default
  return error instanceof Error ? error : new Error(defaultMessage);
}

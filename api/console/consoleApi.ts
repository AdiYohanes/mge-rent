import { get } from "../apiUtils";
import { CONSOLE_ENDPOINTS } from "../constants";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../constants";
import { getAuthHeader } from "../auth/authApi";

// Types
export interface Console {
  id: number;
  model: string;
  serial_number: string;
  price: string;
  notes?: string;
  image: string | null;
  is_available: boolean;
  available_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GetConsolesResponse {
  data: Console[];
  meta?: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    search: string;
  };
}

export interface ConsoleResponseData {
  consoles: Console[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Console create/update payload
export interface ConsolePayload {
  id?: number; // Include ID for updates
  model: string;
  serial_number: string;
  price: string;
  notes?: string;
  image?: string | null;
  is_available?: boolean;
  _method?: string; // Add for Laravel form method spoofing
}

// Upload image for a console
export const uploadConsoleImage = async (
  consoleId: string,
  imageFile: File
): Promise<boolean> => {
  try {
    console.log(`Uploading image for console ID: ${consoleId}`);

    // Create FormData for image upload
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("_method", "PUT");

    // Use axios to upload the image
    const response = await axios.post(
      `${API_BASE_URL}/admin/consoles/${consoleId}/image`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          // Don't set Content-Type here, it will be set automatically with boundary
          ...getAuthHeader(),
        },
      }
    );

    console.log("Image upload response:", response.data);

    if (response.status >= 200 && response.status < 300) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error uploading image for console ${consoleId}:`, error);
    return false;
  }
};

// Get all consoles
export const getConsoles = async (): Promise<ConsoleResponseData> => {
  try {
    // Validate authentication
    if (!Cookies.get("token")) {
      throw new Error(
        "Anda harus login untuk melihat daftar console. Silakan login terlebih dahulu."
      );
    }

    console.log("Fetching consoles data...");

    // Use axios with authentication header
    const response = await axios.get(`${API_BASE_URL}/admin/consoles`, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
      },
    });

    console.log("API response for consoles:", response.data);

    if (response && response.data && Array.isArray(response.data.data)) {
      // Process image URLs to use full paths if they're relative
      const processedConsoles = response.data.data.map((console: Console) => {
        // Check if image is a relative path and fix it
        if (console.image && !console.image.startsWith("http")) {
          // If it's a relative path, make it absolute
          console.image = `${API_BASE_URL}${console.image}`;
        }
        return console;
      });

      return {
        consoles: processedConsoles,
        total: response.data.meta?.total || response.data.data.length,
        page: response.data.meta?.page || 1,
        limit: response.data.meta?.perPage || response.data.data.length,
        totalPages: response.data.meta?.lastPage || 1,
      };
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("Error fetching consoles:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }

    return {
      consoles: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

// Get a console by ID
export const getConsole = async (id: string): Promise<Console | null> => {
  try {
    const response = await get<{ data: Console }>(
      CONSOLE_ENDPOINTS.GET_ONE(id)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching console with id ${id}:`, error);
    return null;
  }
};

// Create a new console
export const addConsole = async (
  consoleData: ConsolePayload,
  imageFile?: File
): Promise<Console | null> => {
  try {
    console.log("Creating console with data:", consoleData);

    let response;
    const endpoint = CONSOLE_ENDPOINTS.CREATE_CONSOLE;

    // If we have an image file, use FormData to send both data and image
    if (imageFile) {
      const formData = new FormData();

      // Add all console data to FormData
      Object.entries(consoleData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add the image file
      formData.append("image", imageFile);

      // Using POST with FormData for multipart/form-data
      response = await axios.post(endpoint, formData, {
        headers: {
          Accept: "application/json",
          // Don't set Content-Type here, it will be set automatically with boundary
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      });
    } else {
      // Regular JSON create without image
      response = await axios.post(endpoint, consoleData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      });
    }

    console.log("Add console response:", response.data);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error("Error creating console:", error);
    return null;
  }
};

// Update a console using POST with support for both data and image
export const updateConsole = async (
  id: string,
  consoleData: ConsolePayload,
  imageFile?: File
): Promise<Console | null> => {
  try {
    // Log endpoint and payload for debugging
    const endpoint = CONSOLE_ENDPOINTS.UPDATE_CONSOLE(id);
    console.log(`Making POST request to endpoint: ${endpoint}`);
    console.log(`With payload:`, consoleData);

    let response;

    // If we have an image file, use FormData to send both data and image
    if (imageFile) {
      const formData = new FormData();

      // Add all console data to FormData
      Object.entries(consoleData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add the image file
      formData.append("image", imageFile);

      // Using POST with FormData for multipart/form-data
      response = await axios.post(endpoint, formData, {
        headers: {
          Accept: "application/json",
          // Don't set Content-Type here, it will be set automatically with boundary
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      });
    } else {
      // Regular JSON update without image
      response = await axios.post(endpoint, consoleData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      });
    }

    console.log("Update response:", response.data);

    // Handle various response formats
    if (response.data) {
      if (response.data.data) {
        // If the response has a data field (standard format)
        return response.data.data;
      } else if (response.data.console) {
        // If the response directly contains the console
        return response.data.console;
      } else if (
        response.data.success ||
        response.data.status === "success" ||
        response.data.message
      ) {
        // If the response just indicates success but doesn't return the object
        // We'll fetch the console again to get the updated data
        const updatedConsole = await getConsole(id);
        return updatedConsole;
      } else {
        // If we have a response but can't determine the structure,
        // assume it was successful (status 200)
        return { id: parseInt(id) } as Console; // Return minimal console object
      }
    }

    return null;
  } catch (error) {
    console.error(`Error updating console with id ${id}:`, error);
    return null;
  }
};

// Delete a console
export const deleteConsole = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`Deleting console with ID: ${id}`);

    // Use axios directly with authentication headers
    const response = await axios.delete(CONSOLE_ENDPOINTS.DELETE_CONSOLE(id), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
      },
    });

    console.log("Delete response:", response.data);

    // Check if successful (HTTP 200 response)
    if (response.status >= 200 && response.status < 300) {
      return { success: true };
    }

    return { success: false, message: "Deletion failed with unknown error" };
  } catch (error) {
    console.error(`Error deleting console with id ${id}:`, error);

    // Check for authentication error
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }

    // Handle foreign key constraint violations
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      const errorMsg = error.response.data.message as string;

      if (
        errorMsg.includes("Foreign key violation") &&
        errorMsg.includes("units_console_id_foreign")
      ) {
        return {
          success: false,
          message:
            "Tidak dapat menghapus console ini karena masih digunakan oleh unit. Hapus unit terkait terlebih dahulu.",
        };
      }

      return { success: false, message: errorMsg };
    }

    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus console",
    };
  }
};

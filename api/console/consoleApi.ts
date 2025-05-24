import { get } from "../apiUtils";
import { CONSOLE_ENDPOINTS } from "../constants";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL, STORAGE_URL } from "../constants";
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
    formData.append("_method", "POST");

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
export const getConsoles = async (): Promise<GetConsolesResponse> => {
  try {
    // Get token - don't throw error immediately if missing
    const token = Cookies.get("token");

    // Debug token info if available
    if (token) {
      const tokenPreview = token.substring(0, 10) + "...";
      console.log("Using token for getConsoles:", tokenPreview);
    } else {
      console.warn("No token found - getConsoles may fail authentication");
    }

    // Get auth header - will handle missing token gracefully
    const authHeader = getAuthHeader();
    console.log("Auth header present:", !!authHeader.Authorization);

    console.log("Fetching consoles data...");

    // Use axios with authentication header
    const response = await axios.get(`${API_BASE_URL}/admin/consoles`, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...authHeader,
      },
    });

    console.log("API response for consoles:", response.data);

    if (response && response.data) {
      // Process image URLs to use full paths if they're relative
      const processedConsoles = response.data.data.map((console: Console) => {
        // Check if image is a relative path and not empty
        if (
          console.image &&
          !console.image.startsWith("http") &&
          console.image !== ""
        ) {
          // If it's a path from storage, use STORAGE_URL
          if (console.image.includes("storage/images/console")) {
            console.image = `${STORAGE_URL}/${console.image}`;
          } else if (!console.image.includes("/")) {
            // If it's just a filename, use the full path
            console.image = `${STORAGE_URL}/storage/images/console/${console.image}`;
          } else {
            // For other paths
            console.image = `${STORAGE_URL}/${console.image}`;
          }
        }
        return console;
      });

      return {
        data: processedConsoles,
        meta: response.data.meta,
      };
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("Error fetching consoles:", error);

    if (axios.isAxiosError(error)) {
      // Extract response data for better error logging
      const status = error.response?.status;
      const responseData = error.response?.data;
      console.error(`API Error Status: ${status}, Data:`, responseData);

      // Handle expired session
      if (status === 401) {
        // Check if we're actually logged in before removing cookies
        if (Cookies.get("token")) {
          console.log(
            "Token exists but API returned 401 - session likely expired"
          );
          Cookies.remove("token");
          Cookies.remove("user");

          // Redirect to login page automatically
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }

          throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
        } else {
          console.log("No token exists - need to login first");
          throw new Error("Anda perlu login untuk melihat daftar console.");
        }
      }

      // Handle other specific error cases
      if (responseData?.message) {
        throw new Error(responseData.message);
      }
    }

    // Default error return empty data
    return {
      data: [],
      meta: {
        page: 1,
        perPage: 10,
        total: 0,
        lastPage: 1,
        search: "",
      },
    };
  }
};

// Get a console by ID
export const getConsole = async (id: string): Promise<Console | null> => {
  try {
    console.log(`[getConsole] Mengambil konsol dengan ID: ${id}`);
    // Panggil 'get' dan biarkan hasilnya sebagai 'any' untuk pemeriksaan fleksibel
    const responseFromApiUtil = await get<any>(CONSOLE_ENDPOINTS.GET_ONE(id)); // <--- UBAH INI: gunakan `any` di sini

    console.log(
      `[getConsole] Respons mentah dari 'apiUtils.get' untuk ID ${id}:`,
      responseFromApiUtil
    );

    // Kritis: Pengecekan respons yang disederhanakan dan lebih kuat
    if (responseFromApiUtil) {
      // Skenario 1: Respons adalah objek dengan properti 'data' (misal: { data: {id: 1, ...} })
      // Ini adalah format standar Laravel Resource untuk satu item.
      if (
        responseFromApiUtil.data &&
        typeof responseFromApiUtil.data === "object" &&
        responseFromApiUtil.data !== null &&
        "id" in responseFromApiUtil.data
      ) {
        console.log(
          `[getConsole] Mengembalikan data dari properti 'data':`,
          responseFromApiUtil.data
        );
        return responseFromApiUtil.data as Console; // Pastikan type-casting
      }
      // Skenario 2: Respons adalah objek Console secara langsung (misal: {id: 1, model: "PS5", ...})
      // Ini sesuai dengan JSON respons yang Anda berikan.
      else if (
        typeof responseFromApiUtil === "object" &&
        responseFromApiUtil !== null &&
        "id" in responseFromApiUtil &&
        "model" in responseFromApiUtil
      ) {
        console.log(
          `[getConsole] Mengembalikan data sebagai objek Console langsung:`,
          responseFromApiUtil
        );
        return responseFromApiUtil as Console; // Pastikan type-casting
      }
    }

    console.warn(
      `[getConsole] Respons API untuk ID ${id} tidak mengandung data konsol yang valid atau formatnya tidak terduga.`
    );
    return null; // Mengembalikan null jika tidak ada format yang cocok
  } catch (error) {
    console.error(`[getConsole] Error fetching console with id ${id}:`, error);
    // Penanganan otentikasi
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }
    return null;
  }
};

// Create a new console
export const addConsole = async (
  consoleData: ConsolePayload,
  imageFile?: File
): Promise<Console | null> => {
  try {
    // Validate authentication first
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    console.log("Creating console with data:", consoleData);

    let response;
    const endpoint = CONSOLE_ENDPOINTS.CREATE_CONSOLE;
    const authHeader = getAuthHeader();

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
          ...authHeader,
        },
      });
    } else {
      // Regular JSON create without image
      response = await axios.post(endpoint, consoleData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...authHeader,
        },
      });
    }

    console.log("Add console response:", response.data);

    // Check response structure
    if (response.data) {
      if (response.data.data) {
        return response.data.data;
      } else if (response.data.console) {
        return response.data.console;
      } else if (response.status === 200 || response.status === 201) {
        // If successful but no data returned, fetch the latest consoles
        const consoles = await getConsoles();
        return consoles.data[consoles.data.length - 1] || null;
      }
    }

    throw new Error("Invalid response format from server");
  } catch (error) {
    console.error("Error creating console:", error);

    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        Cookies.remove("token");
        Cookies.remove("user");
        throw new Error("Session expired. Please log in again.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }

    throw error;
  }
};

// Update a console
export const updateConsole = async (
  id: string,
  consoleData: ConsolePayload,
  imageFile?: File
): Promise<Console | null> => {
  try {
    // Validate authentication first
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const endpoint = CONSOLE_ENDPOINTS.UPDATE_CONSOLE(id);
    console.log(`Making POST request to endpoint: ${endpoint}`);
    console.log(`With payload:`, consoleData);

    const authHeader = getAuthHeader();
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

      // Add the image file and method spoofing
      formData.append("image", imageFile);
      formData.append("_method", "POST");

      response = await axios.post(endpoint, formData, {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...authHeader,
        },
      });
    } else {
      // Regular JSON update with method spoofing
      response = await axios.post(
        endpoint,
        { ...consoleData, _method: "POST" },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...authHeader,
          },
        }
      );
    }

    console.log("Update response:", response.data);

    // Kritis: Pengecekan respons yang lebih spesifik
    if (response.status >= 200 && response.status < 300) {
      // 1. Coba ambil data konsol langsung dari respons jika ada di properti 'data' atau 'console'
      if (response.data && (response.data.data || response.data.console)) {
        return response.data.data || response.data.console;
      }

      // 2. Jika API sukses (status 2xx) TAPI tidak mengembalikan data konsol yang diperbarui langsung,
      // panggil getConsole untuk mengambil data terbaru.
      const updatedConsole = await getConsole(id);
      if (updatedConsole) {
        return updatedConsole;
      } else {
        // Jika bahkan getConsole(id) pun gagal mendapatkan data setelah update berhasil,
        // ini adalah kondisi yang perlu dianggap sebagai kegagalan untuk frontend.
        // Lempar error agar catch block di ConsoleTable menangkapnya dan menampilkan toast error.
        throw new Error(
          "Update successful, but failed to retrieve updated console data."
        );
      }
    } else {
      // Jika status HTTP bukan 2xx (misal 400, 500, dll), berarti ada masalah di backend.
      // Lempar error dengan pesan dari backend jika ada.
      throw new Error(
        response.data?.message ||
          `Failed to update console: HTTP Status ${response.status}`
      );
    }
  } catch (error) {
    console.error(`Error updating console with id ${id}:`, error);

    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        Cookies.remove("token");
        Cookies.remove("user");
        throw new Error("Session expired. Please log in again.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }

    throw error;
  }
};

// Delete a console
export const deleteConsole = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`Deleting console with ID: ${id}`);

    // Get auth header and log it for debugging (hiding most of token)
    const authHeader = getAuthHeader();
    console.log("Auth header present:", !!authHeader.Authorization);
    if (authHeader.Authorization) {
      const tokenPreview = authHeader.Authorization.substring(0, 15) + "...";
      console.log("Using token:", tokenPreview);
    } else {
      console.error("No auth token available!");
      throw new Error("Authentication token not found. Please log in again.");
    }

    // Use axios directly with authentication headers
    const response = await axios.post(
      CONSOLE_ENDPOINTS.DELETE_CONSOLE(id),
      { _method: "DELETE" },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...authHeader,
        },
      }
    );

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

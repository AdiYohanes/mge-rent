import { prepareFileForUpload } from "../apiUtils";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAuthHeader } from "../auth/authApi";

// Type definitions
export interface Game {
  id: string | number;
  title: string;
  image: string;
  platform: string;
  genre: string;
  quantity_available: number;
  description?: string;
  ordering?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface GamePayload {
  title: string;
  image?: File | null;
  platform: string;
  genre: string;
  quantity_available: number;
  description?: string;
}

// Response types
interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

// Accepted file types for image uploads
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
];

/**
 * Get all games with optional pagination
 */
export const getGames = async (page = 1, perPage = 10, search = "") => {
  try {
    // Validasi autentikasi
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      throw new Error(
        "Anda harus login untuk melihat daftar game. Silakan login terlebih dahulu."
      );
    }

    console.log(
      `Mengambil daftar game (halaman ${page}, ${perPage} per halaman, search: "${search}")`
    );

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });

    if (search) {
      queryParams.set("search", search);
    }

    // Gunakan axios dengan header autentikasi dari helper function
    const response = await axios.get(
      `${API_BASE_URL}/admin/games?${queryParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      }
    );

    console.log(
      "Berhasil mengambil daftar game:",
      response.data.data?.length || 0,
      "game"
    );
    return {
      games: response.data.data || [],
      meta: response.data.meta,
    };
  } catch (error) {
    console.error("Error mengambil daftar game:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }

    throw formatApiError(error, "Gagal mengambil daftar game");
  }
};

/**
 * Add a new game
 */
export const addGame = async (
  gameData: GamePayload
): Promise<ApiResponse<Game>> => {
  try {
    // Validasi autentikasi
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error(
        "Anda harus login untuk menambahkan game. Silakan login terlebih dahulu."
      );
    }

    // Validate required fields
    validateGameData(gameData);

    // Create FormData for the request
    const formData = new FormData();

    // Add basic fields
    formData.append("title", gameData.title.trim());
    formData.append("platform", gameData.platform.trim());
    formData.append("genre", gameData.genre.trim());
    formData.append(
      "quantity_available",
      (gameData.quantity_available !== undefined
        ? gameData.quantity_available
        : 1
      ).toString()
    );
    if (gameData.description) {
      formData.append("description", gameData.description.trim());
    }

    // Debugging informasi detail
    console.log("Form data fields sebelum image:", {
      title: gameData.title.trim(),
      platform: gameData.platform.trim(),
      genre: gameData.genre.trim(),
      quantity_available: (gameData.quantity_available !== undefined
        ? gameData.quantity_available
        : 1
      ).toString(),
      description: gameData.description?.trim(),
    });

    // Process image if provided
    if (gameData.image && gameData.image instanceof File) {
      // Tampilkan detail image
      console.log("Detail image yang akan diunggah:", {
        name: gameData.image.name,
        type: gameData.image.type,
        size: `${(gameData.image.size / 1024).toFixed(2)} KB`,
        lastModified: new Date(gameData.image.lastModified).toISOString(),
        constructor: gameData.image.constructor.name,
        isFile: gameData.image instanceof File,
        hasName: "name" in gameData.image,
        hasType: "type" in gameData.image,
        hasSize: "size" in gameData.image,
      });

      // Validate and prepare the image
      if (!ACCEPTED_IMAGE_TYPES.includes(gameData.image.type)) {
        throw new Error(
          "Format gambar tidak didukung. Gunakan JPEG, PNG, JPG, atau GIF."
        );
      }

      // Prepare file (fix extension if needed)
      const preparedFile = prepareFileForUpload(
        gameData.image,
        ACCEPTED_IMAGE_TYPES
      );

      // Force content type to match the file extension if needed
      let forcedContentType = preparedFile.type;
      const fileExt = preparedFile.name.split(".").pop()?.toLowerCase();

      if (fileExt === "jpg" || fileExt === "jpeg") {
        forcedContentType = "image/jpeg";
      } else if (fileExt === "png") {
        forcedContentType = "image/png";
      } else if (fileExt === "gif") {
        forcedContentType = "image/gif";
      }

      // Create a new file with the forced content type if needed
      const finalFile =
        forcedContentType !== preparedFile.type
          ? new File([preparedFile], preparedFile.name, {
              type: forcedContentType,
            })
          : preparedFile;

      // Tampilkan detail gambar setelah diproses dan force content type
      console.log("Detail image setelah diproses dan force content type:", {
        name: finalFile.name,
        type: finalFile.type,
        size: `${(finalFile.size / 1024).toFixed(2)} KB`,
        lastModified: new Date(finalFile.lastModified).toISOString(),
        constructor: finalFile.constructor.name,
        isFile: finalFile instanceof File,
      });

      formData.append("image", finalFile);
    } else {
      console.log("Tidak ada image yang diunggah");
    }

    console.log("Mengirim data game ke API");

    // Log keys dan values dalam FormData
    const formDataEntries: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataEntries[
          key
        ] = `File: ${value.name} (${value.type}, ${value.size} bytes)`;
      } else {
        formDataEntries[key] = String(value);
      }
    });
    console.log("FormData yang dikirim:", formDataEntries);

    // Gunakan axios dengan header autentikasi dari helper function
    const response = await axios.post(`${API_BASE_URL}/admin/games`, formData, {
      headers: {
        // Let the browser set the correct Content-Type for FormData
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(), // Menggunakan helper function untuk header Authorization
      },
    });

    console.log("Respons API:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error API:", error);

    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Response headers:", error.response?.headers);

      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Hapus token karena sudah tidak valid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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

    throw formatApiError(error, "Gagal menambahkan game");
  }
};

/**
 * Update an existing game
 */
export const updateGame = async (
  id: string,
  gameData: Partial<GamePayload>
): Promise<ApiResponse<Game>> => {
  try {
    // Validasi autentikasi
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      throw new Error(
        "Anda harus login untuk mengubah game. Silakan login terlebih dahulu."
      );
    }

    // Validate ID
    if (!id) throw new Error("ID game diperlukan untuk update");

    // Create FormData
    const formData = new FormData();

    // Setup for Laravel PUT method
    formData.append("_method", "POST");

    // Add available fields if provided
    if (gameData.title) formData.append("title", gameData.title.trim());
    if (gameData.platform)
      formData.append("platform", gameData.platform.trim());
    if (gameData.genre) formData.append("genre", gameData.genre.trim());
    if (gameData.quantity_available !== undefined) {
      formData.append(
        "quantity_available",
        gameData.quantity_available.toString()
      );
    }
    if (gameData.description) {
      formData.append("description", gameData.description.trim());
    }

    // Debugging informasi detail
    console.log("Form data fields untuk update:", {
      _method: "POST",
      title: gameData.title?.trim(),
      platform: gameData.platform?.trim(),
      genre: gameData.genre?.trim(),
      quantity_available: gameData.quantity_available?.toString(),
      description: gameData.description?.trim(),
    });

    // Process image if provided
    if (gameData.image && gameData.image instanceof File) {
      // Tampilkan detail image
      console.log("Detail image untuk update:", {
        name: gameData.image.name,
        type: gameData.image.type,
        size: `${(gameData.image.size / 1024).toFixed(2)} KB`,
        lastModified: new Date(gameData.image.lastModified).toISOString(),
        constructor: gameData.image.constructor.name,
        isFile: gameData.image instanceof File,
        hasName: "name" in gameData.image,
        hasType: "type" in gameData.image,
        hasSize: "size" in gameData.image,
      });

      // Validate image format
      if (!ACCEPTED_IMAGE_TYPES.includes(gameData.image.type)) {
        throw new Error(
          "Format gambar tidak didukung. Gunakan JPEG, PNG, JPG, atau GIF."
        );
      }

      // Prepare file
      const preparedFile = prepareFileForUpload(
        gameData.image,
        ACCEPTED_IMAGE_TYPES
      );

      // Force content type to match the file extension if needed
      let forcedContentType = preparedFile.type;
      const fileExt = preparedFile.name.split(".").pop()?.toLowerCase();

      if (fileExt === "jpg" || fileExt === "jpeg") {
        forcedContentType = "image/jpeg";
      } else if (fileExt === "png") {
        forcedContentType = "image/png";
      } else if (fileExt === "gif") {
        forcedContentType = "image/gif";
      }

      // Create a new file with the forced content type if needed
      const finalFile =
        forcedContentType !== preparedFile.type
          ? new File([preparedFile], preparedFile.name, {
              type: forcedContentType,
            })
          : preparedFile;

      // Tampilkan detail gambar setelah diproses dan force content type
      console.log("Detail image setelah diproses untuk update:", {
        name: finalFile.name,
        type: finalFile.type,
        size: `${(finalFile.size / 1024).toFixed(2)} KB`,
        lastModified: new Date(finalFile.lastModified).toISOString(),
        constructor: finalFile.constructor.name,
        isFile: finalFile instanceof File,
      });

      formData.append("image", finalFile);
    }

    console.log("Mengupdate game dengan ID:", id);

    // Log form data for update
    const formDataEntries: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataEntries[
          key
        ] = `File: ${value.name} (${value.type}, ${value.size} bytes)`;
      } else {
        formDataEntries[key] = String(value);
      }
    });
    console.log("FormData untuk update:", formDataEntries);

    // Gunakan axios dengan header autentikasi dari helper function
    const response = await axios.post(
      `${API_BASE_URL}/admin/games/${id}`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      }
    );

    console.log("Respons update game:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error mengupdate game:", error);

    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Response headers:", error.response?.headers);

      // Debug tambahan untuk error 422
      if (error.response?.status === 422) {
        console.error("Validation error detail:", error.response?.data);
        if (Object.keys(error.response?.data || {}).length === 0) {
          console.error("Empty validation response, might be a server issue");
        }
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
      }
    }

    throw formatApiError(error, `Gagal mengupdate game #${id}`);
  }
};

/**
 * Delete a game by ID
 */
export const deleteGame = async (id: string): Promise<ApiResponse<unknown>> => {
  try {
    // Validasi autentikasi
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      throw new Error(
        "Anda harus login untuk menghapus game. Silakan login terlebih dahulu."
      );
    }

    if (!id) throw new Error("ID game diperlukan untuk penghapusan");

    // Use FormData for Laravel DELETE method
    const formData = new FormData();
    formData.append("_method", "DELETE");

    console.log("Menghapus game dengan ID:", id);

    // Gunakan axios dengan header autentikasi dari helper function
    const response = await axios.post(
      `${API_BASE_URL}/admin/games/${id}`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      }
    );

    console.log("Respons hapus game:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error menghapus game:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }

    throw formatApiError(error, `Gagal menghapus game #${id}`);
  }
};

/**
 * Validate required fields in game data
 */
function validateGameData(gameData: Partial<GamePayload>): void {
  if (!gameData.title?.trim()) throw new Error("Title is required");
  if (!gameData.platform?.trim()) throw new Error("Platform is required");
  if (!gameData.genre?.trim()) throw new Error("Genre is required");
}

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
          "Validasi gagal: Server tidak memberikan detail error. Periksa format file dan ukurannya."
        );
      }

      if (error.response.data?.message) {
        return new Error(error.response.data.message);
      }

      return new Error("Validasi gagal. Periksa semua field dan format file.");
    }

    // Handle other API errors with messages
    if (error.response.data?.message) {
      return new Error(error.response.data.message);
    }
  }

  // For other errors, use the error message or default
  return error instanceof Error ? error : new Error(defaultMessage);
}

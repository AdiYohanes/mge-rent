import { get, del, post } from "../apiUtils";
import { ROOM_ENDPOINTS } from "../constants";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../constants";
import { getAuthHeader } from "../auth/authApi";

// Types
export interface Room {
  id: number;
  name: string;
  room_type: "regular" | "vip" | "vvip";
  description: string;
  price: string;
  max_visitors: number;
  is_available: boolean;
  image: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GetRoomsResponse {
  data: Room[];
  meta?: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    search: string;
  };
}

export interface RoomResponseData {
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Room create/update payload
export interface RoomPayload {
  id?: number;
  name: string;
  room_type: "regular" | "vip" | "vvip";
  description: string;
  price: number;
  max_visitors: number;
  image?: string | null;
  is_available?: boolean;
}

// Define a generic response type to handle different API response formats
interface ApiResponse {
  data?: Room | Room[];
  success?: boolean;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Get all rooms
export const getRooms = async (): Promise<ApiResponse<Room[]>> => {
  try {
    // Validate authentication
    if (!Cookies.get("token")) {
      throw new Error(
        "Anda harus login untuk melihat daftar room. Silakan login terlebih dahulu."
      );
    }

    // Use axios with authentication header
    const response = await axios.get(`${API_BASE_URL}/admin/rooms`, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
      },
    });

    return {
      data: response.data.data || [],
      meta: response.data.meta,
    };
  } catch (error) {
    console.error("Error fetching rooms:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      throw new Error("Sesi login sudah berakhir. Silakan login kembali.");
    }

    throw error instanceof Error ? error : new Error("Failed to fetch rooms.");
  }
};

// Get a room by ID
export const getRoom = async (id: string): Promise<Room | null> => {
  try {
    const response = await get<{ data: Room }>(ROOM_ENDPOINTS.GET_ONE(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching room with id ${id}:`, error);
    return null;
  }
};

// Create a new room
export const addRoom = async (
  roomData: RoomPayload
): Promise<Room | true | null> => {
  try {
    console.log(`Creating new room with data:`, roomData);

    const response = await post<ApiResponse>(
      ROOM_ENDPOINTS.CREATE_ROOM,
      roomData
    );

    console.log("Create room response:", response);

    // Jika ada data, kembalikan data
    if (response?.data) {
      return Array.isArray(response.data) ? response.data[0] : response.data;
    }

    // Jika tidak ada data tapi response ada (berarti sukses), kembalikan true
    if (response) {
      return true;
    }

    return null;
  } catch (error) {
    console.error("Error creating room:", error);
    return null;
  }
};

// Update a room using POST as required by backend
export const updateRoom = async (
  id: string,
  roomData: RoomPayload
): Promise<Room | true | null> => {
  try {
    console.log(`Updating room with ID ${id} using POST method:`, roomData);

    const endpoint = ROOM_ENDPOINTS.UPDATE_ROOM(id);
    console.log(`Making POST request to endpoint: ${endpoint}`);

    const response = await post<ApiResponse>(endpoint, roomData);

    console.log("Update room response:", response);

    if (response) {
      // Jika ada data, kembalikan data
      if (response.data) {
        return Array.isArray(response.data) ? response.data[0] : response.data;
      } else if (response.success || response.status === "success") {
        const updatedRoom = await getRoom(id);
        return updatedRoom;
      }

      // Jika response ada tapi tidak ada data atau flag sukses, tetap anggap sukses
      return true;
    }

    return null;
  } catch (error) {
    console.error(`Error updating room with id ${id}:`, error);
    return null;
  }
};

// Delete a room
export const deleteRoom = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting room with ID: ${id}`);
    await del(ROOM_ENDPOINTS.DELETE_ROOM(id));
    return true;
  } catch (error) {
    console.error(`Error deleting room with id ${id}:`, error);
    return false;
  }
};

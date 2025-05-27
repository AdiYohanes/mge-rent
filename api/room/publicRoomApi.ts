import axios from "axios";
import { API_BASE_URL, STORAGE_URL } from "../constants";

// Define type for room data based on actual API response
export interface RoomItem {
  id: number;
  name: string;
  room_type: string; // "regular", "vip", "vvip"
  price: string;
  max_visitors: number;
  image: string;
}

export interface RoomsResponse {
  status: string;
  data: RoomItem[];
}

/**
 * Fetch all room types with optional people count filter
 * @param peopleCount - Number of people for filtering rooms by capacity
 * @returns Promise with room data
 */
export const getRooms = async (
  peopleCount: number = 4
): Promise<RoomsResponse> => {
  try {
    const response = await axios.get<RoomsResponse>(
      `${API_BASE_URL}/booking/rooms?people_count=${peopleCount}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

/**
 * Get rooms data processed for display
 * @param peopleCount - Number of people for filtering rooms by capacity
 * @returns Promise with processed room items
 */
export const getRoomsForDisplay = async (
  peopleCount: number = 4
): Promise<RoomItem[]> => {
  try {
    const response = await getRooms(peopleCount);

    if (response.status === "success" && Array.isArray(response.data)) {
      return response.data.map((room) => ({
        ...room,
        // Construct full image URL using STORAGE_URL
        image: `${STORAGE_URL}/${room.image}`,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error processing rooms for display:", error);
    throw error;
  }
};

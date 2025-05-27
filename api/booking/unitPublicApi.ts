import axios from "axios";
import { API_BASE_URL } from "../constants";

export interface UnitItem {
  id: number;
  name: string;
  room_id: number;
  console_id: number;
  features: string[];
  console: any | null;
}

export interface UnitResponse {
  status: string;
  data: {
    units: UnitItem[];
  };
}

/**
 * Fetch available units for a specific console model and room type
 * @param consoleModel - Type of console (e.g., "PS5")
 * @param roomType - Type of room (e.g., "regular", "vip")
 * @returns Promise with unit data
 */
export const getUnitsForDisplay = async (
  consoleModel: string,
  roomType: string
): Promise<UnitItem[]> => {
  try {
    const response = await axios.get<UnitResponse>(
      `${API_BASE_URL}/booking/units?console_model=${consoleModel}&room_type=${roomType}`
    );
    return response.data.data.units;
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
};

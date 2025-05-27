import axios from "axios";
import { API_BASE_URL, STORAGE_URL } from "../constants";

// Define type for console data
export interface ConsoleItem {
  id: number;
  model: string;
  price: string;
  image: string;
}

export interface ConsoleResponse {
  status: string;
  data: {
    [key: string]: ConsoleItem[];
  };
}

// Function to fetch all console data
export const getConsoles = async (): Promise<ConsoleResponse> => {
  try {
    const response = await axios.get<ConsoleResponse>(
      `${API_BASE_URL}/booking/consoles`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching consoles:", error);
    throw error;
  }
};

// Function to get consoles as a flattened array
export const getConsolesFlattened = async (): Promise<ConsoleItem[]> => {
  try {
    const response = await getConsoles();

    if (response.status === "success") {
      // Flatten the grouped data into a single array
      const allConsoles: ConsoleItem[] = [];
      Object.keys(response.data).forEach((consoleType) => {
        // Process each console to ensure image paths are correct
        const consolesWithImages = response.data[consoleType].map(
          (console) => ({
            ...console,
            // Construct full image URL using STORAGE_URL
            image: `${STORAGE_URL}/${console.image}`,
          })
        );
        allConsoles.push(...consolesWithImages);
      });
      return allConsoles;
    }

    return [];
  } catch (error) {
    console.error("Error fetching flattened consoles:", error);
    throw error;
  }
};

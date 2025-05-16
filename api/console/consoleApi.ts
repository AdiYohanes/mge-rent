import { get, del, post } from "../apiUtils";
import { CONSOLE_ENDPOINTS } from "../constants";

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

// Define a more generic response type to handle different API response formats
interface UpdateResponse {
  data?: Console;
  console?: Console;
  success?: boolean;
  status?: string;
  message?: string;
  [key: string]: unknown; // Use unknown instead of any for better type safety
}

// Get all consoles
export const getConsoles = async (): Promise<ConsoleResponseData> => {
  try {
    const response = await get<GetConsolesResponse>(CONSOLE_ENDPOINTS.GET_ALL);

    console.log("API response for consoles:", response);

    // Check if response has data and meta structure as shown in Postman response
    if (response && response.data && Array.isArray(response.data)) {
      return {
        consoles: response.data,
        total: response.meta?.total || response.data.length,
        page: response.meta?.page || 1,
        limit: response.meta?.perPage || response.data.length,
        totalPages: response.meta?.lastPage || 1,
      };
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("Error fetching consoles:", error);
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
  consoleData: ConsolePayload
): Promise<Console | null> => {
  try {
    const response = await post<{ data: Console }>(
      CONSOLE_ENDPOINTS.CREATE_CONSOLE,
      consoleData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating console:", error);
    return null;
  }
};

// Update a console using POST as required by backend
export const updateConsole = async (
  id: string,
  consoleData: ConsolePayload
): Promise<Console | null> => {
  try {
    // Log endpoint and payload for debugging
    const endpoint = CONSOLE_ENDPOINTS.UPDATE_CONSOLE(id);
    console.log(`Making POST request to endpoint: ${endpoint}`);
    console.log(`With payload:`, consoleData);

    // Using plain POST method as specified
    const response = await post<UpdateResponse>(endpoint, consoleData);

    console.log("Update response:", response);

    // The API returns success with status 200, but the data structure might be different
    // Handle various response formats
    if (response) {
      if (response.data) {
        // If the response has a data field (standard format)
        return response.data;
      } else if (response.console) {
        // If the response directly contains the console
        return response.console;
      } else if (
        response.success ||
        response.status === "success" ||
        response.message
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
export const deleteConsole = async (id: string): Promise<boolean> => {
  try {
    await del(CONSOLE_ENDPOINTS.DELETE_CONSOLE(id));
    return true;
  } catch (error) {
    console.error(`Error deleting console with id ${id}:`, error);
    return false;
  }
};

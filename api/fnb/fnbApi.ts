import { get, del, post } from "../apiUtils";
import { FNB_ENDPOINTS } from "../constants";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAuthHeader } from "../auth/authApi";

// Types
export interface FoodDrinkItem {
  id: number;
  name: string;
  category: "Food" | "Drink";
  price: number;
  image: string | null;
  status: "Available" | "Sold Out";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FoodDrinkResponseData {
  items: FoodDrinkItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// FoodDrink create/update payload
export interface FoodDrinkPayload {
  id?: number;
  name: string;
  category: string;
  price: number;
  image?: File | null;
  status?: string;
  _method?: string; // For Laravel method spoofing
}

// Define a generic response type to handle different API response formats
interface UpdateResponse {
  data?: FoodDrinkItem;
  item?: FoodDrinkItem;
  success?: boolean;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Get all food and drink items
export const getFoodDrinkItems = async (
  page = 1,
  limit = 10,
  search = "",
  category = ""
): Promise<FoodDrinkResponseData> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (search) {
      queryParams.append("search", search);
    }

    if (category) {
      queryParams.append("category", category);
    }

    const url = `${FNB_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
    const response = await get<FoodDrinkResponseData>(url);

    return response;
  } catch (error) {
    console.error("Error fetching food and drink items:", error);
    throw error;
  }
};

// Get a food/drink item by ID
export const getFoodDrinkItem = async (
  id: string
): Promise<FoodDrinkItem | null> => {
  try {
    const response = await get<{ data: FoodDrinkItem }>(
      FNB_ENDPOINTS.GET_ONE(id)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching food/drink item with id ${id}:`, error);
    return null;
  }
};

// Create a new food/drink item
export const addFoodDrinkItem = async (
  formData: FormData
): Promise<FoodDrinkItem | null> => {
  try {
    console.log("Sending new food/drink item data to API");

    // Use axios directly with proper headers for FormData
    const response = await axios.post(FNB_ENDPOINTS.CREATE_FNB, formData, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
      },
    });

    console.log("Add food/drink item response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating food/drink item:", error);
    return null;
  }
};

// Update a food/drink item
export const updateFoodDrinkItem = async (
  id: string,
  formData: FormData
): Promise<FoodDrinkItem | null> => {
  try {
    console.log(`Updating food/drink item with ID: ${id}`);

    // Add method spoofing for PUT/PATCH
    formData.append("_method", "PUT");

    // Use axios directly with proper headers for FormData
    const response = await axios.post(FNB_ENDPOINTS.UPDATE_FNB(id), formData, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
      },
    });

    console.log("Update food/drink item response:", response.data);

    // Handle various response formats
    if (response.data) {
      if (response.data.data) {
        return response.data.data;
      } else if (response.data.item) {
        return response.data.item;
      } else if (response.data.success || response.data.status === "success") {
        // If response only indicates success, fetch the item again
        const updatedItem = await getFoodDrinkItem(id);
        return updatedItem;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error updating food/drink item with id ${id}:`, error);
    return null;
  }
};

// Delete a food/drink item
export const deleteFoodDrinkItem = async (id: string): Promise<boolean> => {
  try {
    await del(FNB_ENDPOINTS.DELETE_FNB(id));
    return true;
  } catch (error) {
    console.error(`Error deleting food/drink item with id ${id}:`, error);
    return false;
  }
};

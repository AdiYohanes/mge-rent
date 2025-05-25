import { get, del, prepareFileForUpload } from "../apiUtils"; // Removed 'post'
import { FNB_ENDPOINTS } from "../constants";
import axios from "axios";
// import { API_BASE_URL } from "../constants"; // Removed 'API_BASE_URL'
import { getAuthHeader } from "../auth/authApi";

// Types
export interface FoodDrinkItem {
  id: number;
  name: string;
  category: "food" | "beverage" | "snack"; // Changed to lowercase
  price: string;
  image: string | null;
  is_available: boolean; // Changed from status to is_available (boolean)
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FoodDrinkResponseMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  search: string;
}

// FoodDrink create/update payload
export interface FoodDrinkPayload {
  id?: number;
  name: string;
  category: "food" | "beverage" | "snack"; // Changed to lowercase
  price: string;
  image?: File | null;
  is_available?: boolean; // Changed from status to is_available (boolean)
  _method?: string;
}

// Get all food and drink items
export const getFoodDrinkItems = async (
  page = 1,
  limit = 10,
  search = "",
  category = ""
): Promise<{ data: FoodDrinkItem[]; meta: FoodDrinkResponseMeta }> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    console.log(
      `API call with page=${page}, limit=${limit}, search=${search}, category=${category}`
    );

    if (search) {
      queryParams.append("search", search);
    }

    if (category) {
      queryParams.append("category", category);
    }

    const url = `${FNB_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
    console.log("API URL:", url);

    const response = await get<{
      data: FoodDrinkItem[];
      meta: FoodDrinkResponseMeta;
    }>(url);

    // Map is_available to status for component compatibility (optional, could also update component)
    // For now, let's just return the raw API response structure
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
    // Assuming the API returns the created item directly or within a 'data' field
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error creating food/drink item:", error);
    return null;
  }
};

// Update a food/drink item
export const updateFoodDrinkItem = async (
  id: string,
  formData: FormData,
  imageFile?: File | undefined // Add imageFile parameter
): Promise<FoodDrinkItem | null> => {
  try {
    console.log(`Updating food/drink item with ID: ${id}`);

    // Handle new image file if exists
    if (imageFile) {
      // Use the imageFile parameter
      const preparedFile = prepareFileForUpload(imageFile); // Use the imported function
      formData.append("image", preparedFile);
    }

    // Use axios.post for update with FormData (assuming backend expects this with _method spoofing)
    const response = await axios.post(FNB_ENDPOINTS.UPDATE_FNB(id), formData, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...getAuthHeader(),
        // Content-Type will be automatically set to multipart/form-data by axios for FormData
      },
    });

    console.log("Update food/drink item response:", response.data);

    // Assuming the API returns the updated item directly or within a 'data' field
    return response.data.data || response.data;
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

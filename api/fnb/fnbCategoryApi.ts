import { get, post, del } from "../apiUtils";
import { FNB_CATEGORY_ENDPOINTS } from "../constants";
import { getAuthHeader } from "../auth/authApi";
import axios from "axios";

// Types
export interface FnbCategory {
  id: number;
  category: string;
  type: "food" | "beverage" | "snack";
  created_at: string;
  updated_at: string;
}

export interface FnbCategoryResponseMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  search: string;
}

export interface FnbCategoryResponse {
  data: FnbCategory[];
  meta: FnbCategoryResponseMeta;
}

export interface FnbCategoryPayload {
  category: string;
  type: "food" | "beverage" | "snack";
}

/**
 * Get all FNB categories
 */
export const getFnbCategories = async (): Promise<FnbCategoryResponse> => {
  try {
    console.log("Fetching FNB categories");
    const response = await get<FnbCategoryResponse>(
      FNB_CATEGORY_ENDPOINTS.GET_ALL
    );
    console.log("FNB categories response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching FNB categories:", error);
    // Return empty response with expected structure
    return {
      data: [],
      meta: { page: 1, perPage: 10, total: 0, lastPage: 1, search: "" },
    };
  }
};

/**
 * Get FNB category by ID
 */
export const getFnbCategory = async (
  id: string
): Promise<FnbCategory | null> => {
  try {
    const response = await get<{ data: FnbCategory }>(
      FNB_CATEGORY_ENDPOINTS.GET_ONE(id)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching FNB category with id ${id}:`, error);
    return null;
  }
};

/**
 * Create a new FNB category
 */
export const createFnbCategory = async (
  data: FnbCategoryPayload
): Promise<FnbCategory | null> => {
  try {
    console.log("Creating new FNB category:", data);
    const response = await post<{ data: FnbCategory }>(
      FNB_CATEGORY_ENDPOINTS.CREATE_CATEGORY,
      data
    );
    console.log("Create FNB category response:", response);
    return response.data;
  } catch (error) {
    console.error("Error creating FNB category:", error);
    return null;
  }
};

/**
 * Update an existing FNB category
 */
export const updateFnbCategory = async (
  id: string,
  data: FnbCategoryPayload
): Promise<FnbCategory | null> => {
  try {
    console.log(`Updating FNB category with ID: ${id}`, data);

    // Using POST with _method: PUT
    const response = await axios.post(
      FNB_CATEGORY_ENDPOINTS.UPDATE_CATEGORY(id),
      { ...data, _method: "PUT" },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      }
    );

    console.log("Update FNB category response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating FNB category with id ${id}:`, error);
    return null;
  }
};

/**
 * Delete an FNB category
 */
export const deleteFnbCategory = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting FNB category with ID: ${id}`);

    // Using POST with _method: DELETE
    await axios.post(
      FNB_CATEGORY_ENDPOINTS.DELETE_CATEGORY(id),
      { _method: "DELETE" },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...getAuthHeader(),
        },
      }
    );

    return true;
  } catch (error) {
    console.error(`Error deleting FNB category with id ${id}:`, error);
    return false;
  }
};

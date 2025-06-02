import { get } from "../apiUtils";
import { API_BASE_URL, STORAGE_URL } from "../constants"; // Import STORAGE_URL

// Types based on the provided response example
export interface FnbCategory {
  id: number;
  category: string;
  type: "snack" | "beverage" | "food";
  created_at: string;
  updated_at: string;
}

export interface FnbItem {
  id: number;
  name: string;
  fnb_category_id: number;
  price: string;
  description: string | null;
  image: string | null;
  category: FnbCategory;
}

export interface FnbResponse {
  status: string;
  data: {
    snack: FnbItem[];
    beverage: FnbItem[];
    food: FnbItem[];
  };
}

// Function to fetch all FNBs for public view
export const getPublicFnbs = async (): Promise<FnbResponse> => {
  try {
    const url = `${API_BASE_URL}/fnbs`; // Construct the full API URL
    const response = await get<FnbResponse>(url);
    return response;
  } catch (error) {
    console.error("Error fetching public FNBs:", error);
    throw error;
  }
};

// Function to map FnbItem from API response to FoodItem type used in page.tsx
// Assuming FoodItem type is defined elsewhere or needs to be defined here
// For now, let's assume FoodItem is similar to FnbItem but might have slight differences
// We'll need to check the actual FoodItem definition in store/RestaurantStore.tsx
// For now, a basic mapping:
import { FoodItem } from "@/store/RestaurantStore"; // Assuming FoodItem is exported from here

export const mapFnbItemToFoodItem = (item: FnbItem): FoodItem => {
  return {
    id: item.id, // Here's the issue: item.id is a number, but FoodItem expects a string
    name: item.name,
    price: parseFloat(item.price), // Convert price to number
    image: item.image ? `${STORAGE_URL}/${item.image}` : null, // Prepend STORAGE_URL if image exists
    description: item.description || null, // Use description or null
    category: item.category.type, // Map category type
    // Add other properties if FoodItem has them and map from FnbItem
    // is_available: true, // Assuming public items are available, or map from item if available
  };
};

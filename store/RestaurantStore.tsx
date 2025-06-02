import { create } from "zustand";

// Define types for FoodItem and CartItem
export interface FoodItem {
  id: number;
  name: string;
  price: number;
  image: string | null; // Allow null for image
  category: string;
  description?: string | null;
  popular?: boolean;
  outOfStock?: boolean;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

// Define the state and actions for the store
interface RestaurantState {
  cart: CartItem[];
  addToCart: (item: FoodItem) => void;
  removeFromCart: (itemId: number) => void;
  getItemQuantity: (itemId: number) => number;
  getCartTotalItems: () => number;
  getCartTotalPrice: () => number;
  clearCart: () => void;
}

// Create the Zustand store
const useRestaurantStore = create<RestaurantState>((set, get) => ({
  cart: [],

  addToCart: (itemToAdd) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === itemToAdd.id);
      let updatedCart;
      if (existingItem) {
        updatedCart = state.cart.map((item) =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...state.cart, { ...itemToAdd, quantity: 1 }];
      }
      // Log after attempting to add to cart
      const addedItemDetails = updatedCart.find(
        (item) => item.id === itemToAdd.id
      );
      console.log(
        "Attempted to add to cart (Zustand):",
        itemToAdd.name,
        "New quantity:",
        addedItemDetails?.quantity
      );
      return { cart: updatedCart };
    });
  },

  removeFromCart: (itemId) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === itemId);
      if (!existingItem) return state; // Item not in cart

      let updatedCart;
      if (existingItem.quantity > 1) {
        updatedCart = state.cart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        updatedCart = state.cart.filter((item) => item.id !== itemId);
      }
      console.log("Removed from cart (Zustand): Item ID", itemId);
      return { cart: updatedCart };
    });
  },

  getItemQuantity: (itemId) => {
    const item = get().cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  },

  getCartTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },

  getCartTotalPrice: () => {
    return get().cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },

  clearCart: () => {
    set({ cart: [] });
    console.log("Cart cleared (Zustand)");
  },
}));

export default useRestaurantStore;

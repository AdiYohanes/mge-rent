import { create } from "zustand";

// Define the Console type
export interface Console {
  id: number;
  model: string; // The raw model identifier (PS4, PS5) used for API calls
  name: string; // Display name (PlayStation 4, PlayStation 5)
  image: string;
  description: string;
  price: string; // e.g., "18k"
}

// Define the Room type
export interface Room {
  id: number;
  category: string; // This is like the name, e.g., "Regular", "VIP"
  description: string;
  price: number; // Numerical price
  image: string;
}

// Define the Game type (based on RoomSelection.tsx)
export interface Game {
  id: number;
  name: string;
  unit: string; // Indicates which PS unit it's typically associated with
  available: boolean;
  image: string;
  description: string;
}

// Define types for Food/Drink items based on FoodSelection.tsx
export interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string | null;
  outOfStock?: boolean;
  popular?: boolean;
}

export interface FoodItemInCart extends FoodItem {
  quantity: number;
}

// Store for managing selected booking items
interface BookingItemState {
  selectedConsole: Console | null;
  setSelectedConsole: (console: Console | null) => void; // Allow null to deselect
  resetSelectedConsole: () => void;

  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void; // Allow null to deselect

  selectedUnitName: string | null; // To store the name of the selected unit, e.g., "Unit G"
  setSelectedUnitName: (unitName: string | null) => void;

  selectedUnitId: number | null;
  setSelectedUnitId: (unitId: number | null) => void;

  selectedGame: Game | null;
  setSelectedGame: (game: Game | null) => void;

  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;

  selectedTime: string; // e.g., "08:30"
  setSelectedTime: (time: string) => void;

  duration: number; // e.g., 1 (for 1 hour)
  setDuration: (duration: number) => void;

  endTime: Date | null; // Calculated end time
  setEndTime: (endTime: Date | null) => void;

  // Food & Drink Cart
  foodCart: FoodItemInCart[];
  addFoodToCart: (item: FoodItem) => void;
  removeFoodFromCart: (itemId: string) => void; // Decrements quantity or removes if quantity becomes 0
  getFoodItemQuantity: (itemId: string) => number;
  getFoodCartTotalItems: () => number;
  getFoodCartTotalPrice: () => number;
  clearFoodCart: () => void;
}

// Creating Zustand store
const useBookingItemStore = create<BookingItemState>((set, get) => ({
  // Console state
  selectedConsole: null,
  setSelectedConsole: (console) => set({ selectedConsole: console }),
  resetSelectedConsole: () => set({ selectedConsole: null }),

  // Room state
  selectedRoom: null,
  setSelectedRoom: (room) => set({ selectedRoom: room }),

  // Unit state
  selectedUnitName: null,
  setSelectedUnitName: (unitName) => set({ selectedUnitName: unitName }),

  selectedUnitId: null,
  setSelectedUnitId: (unitId) => set({ selectedUnitId: unitId }),

  // Game state
  selectedGame: null,
  setSelectedGame: (game) => set({ selectedGame: game }),

  // Date state
  selectedDate: undefined,
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Time and Duration state
  selectedTime: "", // Initializing with an empty string
  setSelectedTime: (time) => set({ selectedTime: time }),

  duration: 1, // Default duration, e.g., 1 hour
  setDuration: (duration) => set({ duration: duration }),

  endTime: null, // Initialize endTime
  setEndTime: (endTime) => set({ endTime: endTime }),

  // Food & Drink Cart Implementation
  foodCart: [],
  addFoodToCart: (itemToAdd) =>
    set((state) => {
      const existingItemIndex = state.foodCart.findIndex(
        (item) => item.id === itemToAdd.id
      );
      if (existingItemIndex > -1) {
        const updatedCart = [...state.foodCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        };
        return { foodCart: updatedCart };
      } else {
        return {
          foodCart: [...state.foodCart, { ...itemToAdd, quantity: 1 }],
        };
      }
    }),
  removeFoodFromCart: (itemId) =>
    set((state) => {
      const existingItemIndex = state.foodCart.findIndex(
        (item) => item.id === itemId
      );
      if (existingItemIndex === -1) return state; // Item not in cart

      const updatedCart = [...state.foodCart];
      if (updatedCart[existingItemIndex].quantity > 1) {
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity - 1,
        };
      } else {
        updatedCart.splice(existingItemIndex, 1); // Remove item if quantity is 1
      }
      return { foodCart: updatedCart };
    }),
  getFoodItemQuantity: (itemId) => {
    const item = get().foodCart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  },
  getFoodCartTotalItems: () => {
    return get().foodCart.reduce((total, item) => total + item.quantity, 0);
  },
  getFoodCartTotalPrice: () => {
    return get().foodCart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
  clearFoodCart: () => set({ foodCart: [] }),
}));

export default useBookingItemStore;

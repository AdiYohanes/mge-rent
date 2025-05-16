// Re-export all API functions and constants
export * from "./constants";
export * from "./apiUtils";

// Re-export auth API
export * from "./auth/authApi";

// Import User type dari userApi
import {
  User,
  GetUsersParams,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "./user/userApi";

// Re-export user API - fokus pada getUsers
export {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type GetUsersParams,
};

// Import and export console API
import {
  Console,
  ConsolePayload,
  getConsoles,
  getConsole,
  addConsole,
  updateConsole,
  deleteConsole,
} from "./console/consoleApi";

export {
  getConsoles,
  getConsole,
  addConsole,
  updateConsole,
  deleteConsole,
  type Console,
  type ConsolePayload,
};

// Import and export room API
import {
  Room,
  RoomPayload,
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
} from "./room/roomApi";

export {
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
  type Room,
  type RoomPayload,
};

// Tambahkan status untuk kompatibilitas UserTable (tanpa data dummy)
export interface UserWithStatus extends User {
  status?: "active" | "inactive" | "suspended";
  avatar?: string;
  lastLogin?: string;
}

// You can add more API modules here in the future
// export * from "./product/productApi";
// export * from "./order/orderApi";
// etc.

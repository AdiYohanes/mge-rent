// Re-export all API functions and constants
export * from "./constants";
export { prepareFileForUpload } from "./apiUtils";

// Auth API
export {
  login,
  register,
  logout,
  isLoggedIn,
  getCurrentUser,
  debugToken,
  checkTokenHealth,
  getAuthHeader,
  type AuthResponse,
  type LoginRequestData,
  type RegisterRequestData,
  type RegisterResponse,
  type ErrorResponse,
} from "./auth/authApi";

// User API
export {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type UserResponseData,
} from "./user/userApi";

// Console API
export {
  getConsoles,
  getConsole,
  addConsole,
  updateConsole,
  deleteConsole,
  uploadConsoleImage,
  type Console,
  type ConsolePayload,
  type GetConsolesResponse,
} from "./console/consoleApi";

// Room API
export {
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
  type Room,
  type RoomResponseData,
  type RoomPayload,
} from "./room/roomApi";

// Game API
export {
  getGames,
  addGame,
  updateGame,
  deleteGame,
  type Game,
  type GamePayload,
} from "./game/gameApi";

// Food & Drink API
export {
  getFoodDrinkItems,
  getFoodDrinkItem,
  addFoodDrinkItem,
  updateFoodDrinkItem,
  deleteFoodDrinkItem,
  type FoodDrinkItem,
  type FoodDrinkResponseMeta,
  type FoodDrinkPayload,
} from "./fnb/fnbApi";

// Food & Drink Category API
export {
  getFnbCategories,
  getFnbCategory,
  createFnbCategory,
  updateFnbCategory,
  deleteFnbCategory,
  type FnbCategory,
  type FnbCategoryResponse,
  type FnbCategoryResponseMeta,
  type FnbCategoryPayload,
} from "./fnb/fnbCategoryApi";

// Restaurant API (Public Food & Drinks)
export {
  getPublicFnbs,
  mapFnbItemToFoodItem,
  type FnbItem,
  type FnbResponse,
  type FnbCategory as RestaurantFnbCategory,
} from "./fnb/publicFnbApi";

// Promo API
export {
  getPromos,
  getPromo,
  addPromo,
  updatePromo,
  togglePromoStatus,
  deletePromo,
  type Promo,
  type PromoResponseData,
  type PromoPayload,
} from "./promo/promoApi";

// FAQ API
export {
  getFAQs,
  getFAQ,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  type FAQ,
  type FAQResponseData,
  type FAQPayload,
} from "./faq/faqApi";

// Unit API
export {
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
  type Unit,
  type UnitPayload,
} from "./unit/unitApi";

// Booking API
export {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  approveBooking,
  rejectBooking,
  type Booking,
  type ApiResponse as BookingApiResponse,
  type CustomerData,
  type BookingPayload,
} from "./booking/bookingApi";

// Analytics API
export {
  getStatisticsMain,
  getPopularityStats,
  getPeakHours,
  type StatisticsMainResponse,
  type PopularityStatsResponse,
  type PopularUnit,
  type PopularGame,
  type PopularFnB,
  type PeakHoursResponse,
  type PeakHourData,
} from "./analytics/analyticsApi";

// Notification API
export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
  type NotificationResponse,
  type NotificationMeta,
} from "./notification/notificationApi";

// Import User for the extended interface
import { User } from "./user/userApi";

// Extended interfaces for components
export interface UserWithStatus extends User {
  status?: "active" | "inactive" | "suspended";
  avatar?: string;
  lastLogin?: string;
}

// You can add more API modules here in the future
// export * from "./product/productApi";
// export * from "./order/orderApi";
// etc.

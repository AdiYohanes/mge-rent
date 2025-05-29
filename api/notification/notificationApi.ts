import { get, post } from "../apiUtils";

// Define notification interface
export interface Notification {
  id: number;
  message: string;
  link?: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Define meta interface for pagination
export interface NotificationMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  search: string;
}

// Define response interface
export interface NotificationResponse {
  data: Notification[];
  meta: NotificationMeta;
}

/**
 * Fetches all notifications for the logged-in user
 * @returns Promise with notification data
 */
export async function getNotifications(): Promise<NotificationResponse> {
  try {
    return await get<NotificationResponse>("/admin/notification");
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

/**
 * Marks a notification as read
 * @param id Notification ID
 * @returns Promise with success status
 */
export async function markNotificationAsRead(
  id: number
): Promise<{ status: string }> {
  try {
    return await post<{ status: string }>(`/admin/notification/${id}/read`, {});
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw new Error("Failed to update notification status");
  }
}

/**
 * Marks all notifications as read
 * @returns Promise with success status
 */
export async function markAllNotificationsAsRead(): Promise<{
  status: string;
}> {
  try {
    return await post<{ status: string }>("/admin/notification/read-all", {});
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw new Error("Failed to update all notification statuses");
  }
}

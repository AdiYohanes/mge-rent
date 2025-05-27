import { get, post, put, del } from "../apiUtils";
import { BOOKING_ENDPOINTS } from "../constants";

// Types
export interface CustomerData {
  name: string;
  phone: string;
}

export interface Booking {
  id: number;
  unit_id: number;
  game_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  duration: number;
  customer_data: string;
  event_name: string;
  total_customer: string;
  status: string;
  refund_request: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiResponse {
  data: Booking[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    search: string;
  };
}

export interface BookingPayload {
  unit_id: number;
  game_id?: number;
  booking_date: string;
  start_time: string;
  duration: number;
  customer_data: CustomerData | string;
  event_name?: string;
  total_customer?: string;
}

// Get all bookings with optional filter params
export const getBookings = async (
  page: number = 1,
  perPage: number = 10,
  status?: string,
  dateStart?: string,
  dateEnd?: string
): Promise<ApiResponse> => {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("perPage", perPage.toString());

    if (status) {
      params.append("status", status);
    }

    if (dateStart) {
      params.append("date_start", dateStart);
    }

    if (dateEnd) {
      params.append("date_end", dateEnd);
    }

    const queryString = params.toString();
    const endpoint = `${BOOKING_ENDPOINTS.GET_ALL}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await get<ApiResponse>(endpoint);
    return response;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// Get single booking by ID
export const getBooking = async (id: string): Promise<Booking> => {
  try {
    const response = await get<{ data: Booking }>(
      BOOKING_ENDPOINTS.GET_ONE(id)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking with id ${id}:`, error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (
  bookingData: BookingPayload
): Promise<Booking> => {
  try {
    // Ensure customer_data is a string
    const payload = {
      ...bookingData,
      customer_data:
        typeof bookingData.customer_data === "object"
          ? JSON.stringify(bookingData.customer_data)
          : bookingData.customer_data,
    };

    const response = await post<{ data: Booking }>(
      BOOKING_ENDPOINTS.CREATE_BOOKING,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Update a booking
export const updateBooking = async (
  id: string, 
  bookingData: Partial<BookingPayload>
): Promise<Booking> => {
  try {
    // Ensure customer_data is a string if it exists
    const payload = { ...bookingData };
    if (payload.customer_data && typeof payload.customer_data === "object") {
      payload.customer_data = JSON.stringify(payload.customer_data);
    }

    const response = await post<{ data: Booking }>(
      BOOKING_ENDPOINTS.UPDATE_BOOKING(id),
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating booking with id ${id}:`, error);
    throw error;
  }
};

// Delete a booking
export const deleteBooking = async (id: string): Promise<boolean> => {
  try {
    await del(BOOKING_ENDPOINTS.DELETE_BOOKING(id));
    return true;
  } catch (error) {
    console.error(`Error deleting booking with id ${id}:`, error);
    return false;
  }
};

// Approve a booking
export const approveBooking = async (id: string): Promise<Booking> => {
  try {
    const response = await post<{ data: Booking }>(
      BOOKING_ENDPOINTS.APPROVE_BOOKING(id),
      {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error approving booking with id ${id}:`, error);
    throw error;
  }
};

// Reject a booking
export const rejectBooking = async (
  id: string,
  reason?: string
): Promise<Booking> => {
  try {
    const payload = reason ? { reason } : {};
    const response = await post<{ data: Booking }>(
      BOOKING_ENDPOINTS.REJECT_BOOKING(id),
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Error rejecting booking with id ${id}:`, error);
    throw error;
  }
};

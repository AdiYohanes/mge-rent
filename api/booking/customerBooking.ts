import { post } from "../apiUtils";
import { BOOKING_ENDPOINTS } from "../constants";

// Types
export interface CustomerBookingData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export interface CustomerBookingPayload {
  unit_id: number;
  game_id: number;
  booking_date: string;
  start_time: string;
  duration: number;
  customer_data: CustomerBookingData;
  payment_method_id: number;
  total_customer: number;
  fnb_items: {
    id: number;
    quantity: number;
  }[];
  promo_code?: string;
  event_name?: string;
}

export interface CustomerBookingResponse {
  status: string;
  message: string;
  data: {
    booking_id: number;
    transaction_number: string;
    total_amount: number;
    payment_status: string;
    payment_method: string;
    payment_details?: {
      qr_code?: string;
      bank_accounts?: {
        bank_name: string;
        account_number: string;
        account_name: string;
      }[];
    };
  };
}

/**
 * Create a new customer booking
 * @param bookingData - The booking data to be sent to the server
 * @returns Promise with booking response data
 */
export const createCustomerBooking = async (
  bookingData: CustomerBookingPayload
): Promise<CustomerBookingResponse> => {
  try {
    const response = await post<CustomerBookingResponse>(
      BOOKING_ENDPOINTS.CREATE_BOOKING,
      bookingData
    );
    return response;
  } catch (error) {
    console.error("Error creating customer booking:", error);
    throw error;
  }
};

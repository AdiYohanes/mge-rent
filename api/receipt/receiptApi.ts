import { get } from "../apiUtils";

// Types for Receipt Items
export interface ReceiptItem {
  id: number;
  receipt_id: number;
  item_type: "room" | "console" | "fnb";
  item_id: number;
  quantity: number;
  price: string;
  duration: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Types for Booking Data
export interface BookingData {
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

// Types for Payment Details
export interface PaymentDetails {
  qr_code?: string;
  bank_accounts?: Array<{
    bank_name: string;
    account_number: string;
    account_name: string;
  }>;
}

// Types for Receipt
export interface Receipt {
  id: number;
  receipt_type: "rent";
  receipt_id: string;
  booking_id: number;
  promo_id: number | null;
  payment_method_id: number;
  tax: string;
  total_price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items: ReceiptItem[];
  booking: BookingData;
  payment: PaymentDetails | null;
}

// Types for API Response
export interface ReceiptResponse {
  data: Receipt[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    search: string;
  };
}

// Types for API Response
export interface ReceiptItemsResponse {
  data: ReceiptItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    search: string;
  };
}

/**
 * Get all receipts with pagination and optional search
 * @param page - Page number (default: 1)
 * @param perPage - Items per page (default: 10)
 * @param search - Optional search term
 * @returns Promise with receipt data and pagination info
 */
export const getReceipts = async (
  page: number = 1,
  perPage: number = 10,
  search: string = ""
): Promise<ReceiptResponse> => {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("perPage", perPage.toString());

    if (search) {
      params.append("search", search);
    }

    const queryString = params.toString();
    const endpoint = `/admin/receipts${queryString ? `?${queryString}` : ""}`;

    const response = await get<ReceiptResponse>(endpoint);
    return response;
  } catch (error) {
    console.error("Error fetching receipts:", error);
    throw error;
  }
};

/**
 * Get a single receipt by ID
 * @param id - Receipt ID
 * @returns Promise with receipt data
 */
export const getReceipt = async (id: string): Promise<Receipt> => {
  try {
    const response = await get<{ data: Receipt }>(`/admin/receipts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching receipt with id ${id}:`, error);
    throw error;
  }
};

/**
 * Get all receipt items with pagination and optional search
 * @param page - Page number (default: 1)
 * @param perPage - Items per page (default: 10)
 * @param search - Optional search term
 * @returns Promise with receipt items data and pagination info
 */
export const getReceiptItems = async (
  page: number = 1,
  perPage: number = 10,
  search: string = ""
): Promise<ReceiptItemsResponse> => {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("perPage", perPage.toString());

    if (search) {
      params.append("search", search);
    }

    const queryString = params.toString();
    const endpoint = `/api/admin/receipt-items${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await get<ReceiptItemsResponse>(endpoint);
    return response;
  } catch (error) {
    console.error("Error fetching receipt items:", error);
    throw error;
  }
};

/**
 * Get receipt items by receipt ID
 * @param receiptId - Receipt ID
 * @returns Promise with receipt items data
 */
export const getReceiptItemsByReceiptId = async (
  receiptId: string
): Promise<ReceiptItem[]> => {
  try {
    const response = await get<ReceiptItem>(
      `/admin/receipt-items/${receiptId}`
    );
    return [response]; // Wrap single item in array since we expect an array
  } catch (error) {
    console.error(
      `Error fetching receipt items for receipt ${receiptId}:`,
      error
    );
    throw error;
  }
};

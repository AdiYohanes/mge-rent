import { get } from "../apiUtils";

// Define the type for the statistics main response
export interface StatisticsMainResponse {
  status: string;
  data: {
    total_booking: number;
    today_booking: number;
    total_fnb_order: number;
    today_fnb_order: number;
    total_revenue: string;
    today_revenue: string;
    total_customer: number;
    new_customer_today: number;
  };
}

// Define types for popularity stats
export interface PopularUnit {
  id: number;
  name: string;
  bookings: number;
}

export interface PopularGame {
  id: number;
  title: string;
  bookings: number;
}

export interface PopularFnB {
  id: number;
  name: string;
  total_ordered: number;
}

export interface PopularityStatsResponse {
  status: string;
  data: {
    popular_units: PopularUnit[];
    popular_games: PopularGame[];
    popular_fnb: PopularFnB[];
  };
}

// Define types for peak hours
export interface PeakHourData {
  hour: string;
  bookings: number;
}

export interface PeakHoursResponse {
  status: string;
  data: PeakHourData[];
}

/**
 * Fetches main statistics data
 * @returns Promise with statistics data
 */
export async function getStatisticsMain(): Promise<StatisticsMainResponse> {
  try {
    return await get<StatisticsMainResponse>(`/admin/analytics/main`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch statistics data");
  }
}

/**
 * Fetches popularity statistics data
 * @returns Promise with popularity statistics data
 */
export async function getPopularityStats(): Promise<PopularityStatsResponse> {
  try {
    return await get<PopularityStatsResponse>(
      `/admin/analytics/popularity-stats`
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch popularity statistics data");
  }
}

/**
 * Fetches peak hours data
 * @returns Promise with peak hours data
 */
export async function getPeakHours(): Promise<PeakHoursResponse> {
  try {
    return await get<PeakHoursResponse>(`/admin/analytics/peak-hours`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch peak hours data");
  }
}

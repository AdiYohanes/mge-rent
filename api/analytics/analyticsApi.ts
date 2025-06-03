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

// Define types for revenue comparison
export interface PeriodData {
  label: string;
  revenue: number;
  transactions: number;
  start_date: string;
  end_date: string;
}

export interface ComparisonData {
  revenue_percentage: number;
  revenue_amount: number;
  transactions_percentage: number;
  transactions_amount: number;
}

export interface RevenueComparisonResponse {
  status: string;
  data: {
    current_period: PeriodData;
    previous_period: PeriodData;
    comparison: ComparisonData;
  };
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

/**
 * Fetches revenue comparison data
 * @param filter - The time period filter (daily, weekly, monthly)
 * @param date - The reference date in YYYY-MM-DD format
 * @returns Promise with revenue comparison data
 */
export async function getRevenueComparison(
  filter: "daily" | "weekly" | "monthly",
  date?: string
): Promise<RevenueComparisonResponse> {
  try {
    let url = `/admin/analytics/revenue-comparison?filter=${filter}`;

    // Add date parameter if provided
    if (date) {
      url += `&date=${date}`;
    }

    return await get<RevenueComparisonResponse>(url);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch revenue comparison data");
  }
}

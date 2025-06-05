import axios from "axios";
import { API_BASE_URL } from "../constants";

// Define interface for time slot availability
export interface TimeSlot {
  start_time: string; // Format: "HH:MM"
  end_time: string; // Format: "HH:MM"
  available: boolean;
}

export interface AvailabilityResponse {
  status: string;
  data: {
    date: string;
    time_slots: TimeSlot[];
  };
}

/**
 * Fetch available time slots for a specific unit and date
 * @param unitId - ID of the unit to check availability
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with availability data
 */
export const getAvailableTimes = async (
  unitId: number,
  date: string
): Promise<AvailabilityResponse> => {
  try {
    const response = await axios.get<AvailabilityResponse>(
      `${API_BASE_URL}/booking/available-time?unit_id=${unitId}&date=${date}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available times:", error);
    throw error;
  }
};

/**
 * Transform API response into a more usable format for the DateTimeSelection component
 * @param unitId - ID of the unit
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with processed time slot data
 */
export const getProcessedAvailableTimes = async (
  unitId: number,
  date: string
): Promise<{
  timeSlots: {
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
  hourSlots: {
    hour: number;
    label: string;
    available: boolean;
    minutes: {
      label: string;
      value: string;
      available: boolean;
    }[];
  }[];
}> => {
  try {
    // If no unit is selected yet, return empty data
    if (!unitId) {
      return { hourSlots: [], timeSlots: [] };
    }

    const response = await getAvailableTimes(unitId, date);
    const apiTimeSlots = response.data.time_slots;

    // Convert API time slots to our internal format
    const timeSlots = apiTimeSlots.map((slot) => ({
      startTime: slot.start_time,
      endTime: slot.end_time,
      available: slot.available,
    }));

    // Group time slots by hour, focusing on hour and half-hour intervals
    const hourMap = new Map<
      number,
      {
        minutes: {
          label: string;
          value: string;
          available: boolean;
        }[];
        available: boolean;
      }
    >();

    // Track unique minute values to prevent duplicates
    const processedMinutes = new Set<string>();

    // Process time slots from API
    timeSlots.forEach((slot) => {
      const [hoursStr, minutesStr] = slot.startTime.split(":");
      const hour = parseInt(hoursStr);
      const minute = parseInt(minutesStr);

      // Only process slots that are on the hour or half-hour
      if (minute !== 0 && minute !== 30) return;

      // Create unique identifier for this time slot to prevent duplicates
      const timeKey = `${hour}:${minute}`;
      if (processedMinutes.has(timeKey)) return;
      processedMinutes.add(timeKey);

      if (!hourMap.has(hour)) {
        hourMap.set(hour, {
          minutes: [],
          available: false,
        });
      }

      const currentHour = hourMap.get(hour)!;

      // Create time label in 12-hour format (e.g., 2:30 PM)
      const timeDate = new Date();
      timeDate.setHours(hour, minute);
      const label = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(timeDate);

      currentHour.minutes.push({
        label,
        value: `${hoursStr.padStart(2, "0")}:${minutesStr.padStart(2, "0")}`,
        available: slot.available,
      });

      // If any minute slot is available, mark the hour as available
      if (slot.available) {
        currentHour.available = true;
      }
    });

    // Convert to array format expected by the component
    const hourSlots = Array.from(hourMap.entries())
      .map(([hour, data]) => {
        const timeDate = new Date();
        timeDate.setHours(hour, 0);
        const hourLabel = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          hour12: true,
        }).format(timeDate);

        return {
          hour,
          label: hourLabel,
          available: data.available,
          minutes: data.minutes,
        };
      })
      .sort((a, b) => a.hour - b.hour);

    return { hourSlots, timeSlots };
  } catch (error) {
    console.error("Error processing available times:", error);
    return { hourSlots: [], timeSlots: [] };
  }
};

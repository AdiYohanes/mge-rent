"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { getPeakHours, PeakHourData } from "@/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Interface for the chart data structure
interface ChartData {
  hour: string;
  units: number;
}

// Fixed hours for the x-axis (9 AM to midnight)
const HOURS_RANGE = Array.from({ length: 16 }, (_, i) => ({
  hour: String(i + 9).padStart(2, "0"),
  units: 0,
}));

// Generate fallback data with consistent hours
const generateFallbackData = (): ChartData[] => {
  return HOURS_RANGE.map((item) => ({
    hour: item.hour,
    units: Math.floor(Math.random() * 20) + 1, // Random values between 1-20
  }));
};

// Sample data for different time periods (fallback)
const fallbackData = generateFallbackData();

interface PeakTimeChartProps {
  className?: string;
}

export function PeakTimeChart({ className }: PeakTimeChartProps) {
  const [period, setPeriod] = useState("daily");
  const [peakHoursData, setPeakHoursData] = useState<PeakHourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch peak hours data
  useEffect(() => {
    async function fetchPeakHours() {
      try {
        setLoading(true);
        setError(null);
        const response = await getPeakHours();
        setPeakHoursData(response.data);
      } catch (error) {
        console.error("Failed to fetch peak hours data:", error);
        setError("Failed to load peak hours data");
        toast.error("Failed to load peak hours data");
      } finally {
        setLoading(false);
      }
    }

    fetchPeakHours();
  }, []);

  // Convert API data to chart format with consistent hour range
  const getChartData = (): ChartData[] => {
    if (loading || peakHoursData.length === 0) {
      return fallbackData; // Use sample data as fallback
    }

    // Create a map of hour -> bookings from API data
    const bookingsByHour = new Map<string, number>();

    peakHoursData.forEach((item) => {
      // Extract the hour part (e.g., "10" from "10:00 - 11:00")
      const hour = item.hour.split(" - ")[0].split(":")[0].padStart(2, "0");
      bookingsByHour.set(hour, item.bookings);
    });

    // Map our fixed hour range and fill in booking data where available
    return HOURS_RANGE.map((hourObj) => {
      return {
        hour: hourObj.hour,
        units: bookingsByHour.has(hourObj.hour)
          ? bookingsByHour.get(hourObj.hour)!
          : 0,
      };
    });
  };

  const data = getChartData();

  // Find the peak hour (hour with maximum units)
  const peakHour = data.reduce(
    (max, item) => (item.units > max.units ? item : max),
    { hour: "", units: 0 }
  );

  // Properly typed custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded-md shadow-sm">
          <p className="font-medium">{`${label}:00`}</p>
          <p className="text-amber-600">{`${payload[0].value} Bookings`}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate y-axis domain and ticks based on data
  const calculateYAxisProps = () => {
    // Fixed domain from 0 to 32
    const domain = [0, 32] as [number, number];
    // Fixed ticks in multiples of 4
    const ticks = [0, 4, 8, 12, 16, 20, 24, 28, 32];

    return {
      domain,
      ticks,
    };
  };

  const yAxisProps = calculateYAxisProps();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Peak Time</CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
            <span>Loading peak hours data...</span>
          </div>
        ) : error ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-red-500">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={yAxisProps.domain}
                  ticks={yAxisProps.ticks}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke="#d97706"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 8,
                    fill: "#d97706",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                {/* Peak marker */}
                <Line
                  type="monotone"
                  dataKey={(entry) =>
                    entry.hour === peakHour.hour ? entry.units : null
                  }
                  stroke="transparent"
                  dot={{
                    r: 10,
                    fill: "#3b82f6",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Y-axis label */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">
              Total Bookings
            </div>

            {/* X-axis label */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
              Hours
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

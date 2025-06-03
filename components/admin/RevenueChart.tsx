"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getRevenueComparison,
  RevenueComparisonResponse,
} from "@/api/analytics/analyticsApi";
import { toast } from "sonner";

// Types for the chart data
interface ChartDataPoint {
  name: string;
  current: number;
  previous: number;
}

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [revenueData, setRevenueData] =
    useState<RevenueComparisonResponse | null>(null);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Fetch data from API when period changes
  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);

      try {
        const date = getCurrentDate();
        const response = await getRevenueComparison(period, date);
        setRevenueData(response);

        // Transform API response into chart data
        transformDataForChart(response);
      } catch (err) {
        console.error("Error fetching revenue data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load revenue data"
        );
        toast.error("Failed to load revenue data. Please try again.");

        // Set empty data
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period]);

  // Transform API response data into format for chart
  const transformDataForChart = (response: RevenueComparisonResponse) => {
    if (response?.status !== "success" || !response.data) {
      setChartData([]);
      return;
    }

    // Create a data point for the single day/week/month comparison
    const dataPoint: ChartDataPoint = {
      name: response.data.current_period.label,
      current: response.data.current_period.revenue,
      previous: response.data.previous_period.revenue,
    };

    // Set the chart data
    setChartData([dataPoint]);
  };

  // Calculate totals and percentage change
  const currentTotal = revenueData?.data?.current_period?.revenue || 0;
  const previousTotal = revenueData?.data?.previous_period?.revenue || 0;
  const percentChange = revenueData?.data?.comparison?.revenue_percentage || 0;
  const isPositive = percentChange >= 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get period label
  const getPeriodLabel = () => {
    if (!revenueData?.data) {
      switch (period) {
        case "daily":
          return "Today vs Yesterday";
        case "weekly":
          return "This Week vs Last Week";
        case "monthly":
          return "This Month vs Last Month";
        default:
          return "Current vs Previous";
      }
    }

    // Return labels from API
    return `${revenueData.data.current_period.label} vs ${revenueData.data.previous_period.label}`;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>{getPeriodLabel()}</CardDescription>
        </div>
        <Select
          value={period}
          onValueChange={(value: "daily" | "weekly" | "monthly") =>
            setPeriod(value)
          }
        >
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
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading revenue data...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setPeriod(period)}
              className="mt-2 px-4 py-2 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Period</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(currentTotal)}
                </p>
                <div
                  className={`flex items-center mt-1 ${
                    isPositive ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm">
                    {Math.abs(percentChange).toFixed(1)}% from previous
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Previous Period</p>
                <p className="text-xl font-medium text-muted-foreground">
                  {formatCurrency(previousTotal)}
                </p>
              </div>
            </div>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "",
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      name="Current"
                      stroke="#d97706"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      name="Previous"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    No revenue data available for the selected period
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                <span className="text-sm">Current Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                <span className="text-sm">Previous Period</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

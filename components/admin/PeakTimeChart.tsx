"use client";

import { useState } from "react";
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
} from "recharts";

// Sample data for different time periods
const dailyData = [
  { hour: "09", units: 7 },
  { hour: "10", units: 10 },
  { hour: "11", units: 8 },
  { hour: "12", units: 9 },
  { hour: "13", units: 12 },
  { hour: "14", units: 8 },
  { hour: "15", units: 18 },
  { hour: "16", units: 15 },
  { hour: "17", units: 6 },
  { hour: "18", units: 16 },
  { hour: "19", units: 12 },
  { hour: "20", units: 14 },
  { hour: "21", units: 99 },
  { hour: "22", units: 15 },
  { hour: "23", units: 18 },
  { hour: "24", units: 17 },
];

const weeklyData = [
  { hour: "09", units: 8 },
  { hour: "10", units: 11 },
  { hour: "11", units: 9 },
  { hour: "12", units: 10 },
  { hour: "13", units: 13 },
  { hour: "14", units: 9 },
  { hour: "15", units: 19 },
  { hour: "16", units: 16 },
  { hour: "17", units: 7 },
  { hour: "18", units: 17 },
  { hour: "19", units: 13 },
  { hour: "20", units: 15 },
  { hour: "21", units: 20 },
  { hour: "22", units: 16 },
  { hour: "23", units: 80 },
  { hour: "24", units: 18 },
];

const monthlyData = [
  { hour: "09", units: 9 },
  { hour: "10", units: 12 },
  { hour: "11", units: 10 },
  { hour: "12", units: 11 },
  { hour: "13", units: 99 },
  { hour: "14", units: 10 },
  { hour: "15", units: 20 },
  { hour: "16", units: 17 },
  { hour: "17", units: 8 },
  { hour: "18", units: 18 },
  { hour: "19", units: 14 },
  { hour: "20", units: 16 },
  { hour: "21", units: 21 },
  { hour: "22", units: 17 },
  { hour: "23", units: 20 },
  { hour: "24", units: 19 },
];

interface PeakTimeChartProps {
  className?: string;
}

export function PeakTimeChart({ className }: PeakTimeChartProps) {
  const [period, setPeriod] = useState("daily");

  // Select data based on period
  const getData = () => {
    switch (period) {
      case "daily":
        return dailyData;
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      default:
        return dailyData;
    }
  };

  const data = getData();

  // Find the peak hour (hour with maximum units)
  const peakHour = data.reduce(
    (max, item) => (item.units > max.units ? item : max),
    { hour: "", units: 0 }
  );

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded-md shadow-sm">
          <p className="font-medium">{`${label}:00`}</p>
          <p className="text-amber-600">{`${payload[0].value} Units`}</p>
        </div>
      );
    }
    return null;
  };

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
        <div className="h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
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
                domain={[0, "dataMax + 2"]}
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
            Total Unit
          </div>

          {/* X-axis label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            Hours
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

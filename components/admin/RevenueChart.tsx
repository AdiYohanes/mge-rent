"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
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

// Sample data for different time periods
const dailyData = [
  { name: "Mon", current: 150, previous: 120 },
  { name: "Tue", current: 180, previous: 150 },
  { name: "Wed", current: 200, previous: 180 },
  { name: "Thu", current: 230, previous: 200 },
  { name: "Fri", current: 280, previous: 250 },
  { name: "Sat", current: 300, previous: 270 },
  { name: "Sun", current: 250, previous: 220 },
];

const weeklyData = [
  { name: "Week 1", current: 1200, previous: 1000 },
  { name: "Week 2", current: 1400, previous: 1200 },
  { name: "Week 3", current: 1300, previous: 1400 },
  { name: "Week 4", current: 1500, previous: 1300 },
];

const monthlyData = [
  { name: "Jan", current: 5000, previous: 4500 },
  { name: "Feb", current: 5500, previous: 5000 },
  { name: "Mar", current: 6000, previous: 5500 },
  { name: "Apr", current: 5800, previous: 6000 },
  { name: "May", current: 6200, previous: 5800 },
  { name: "Jun", current: 6500, previous: 6200 },
  { name: "Jul", current: 6300, previous: 6500 },
  { name: "Aug", current: 6700, previous: 6300 },
  { name: "Sep", current: 7000, previous: 6700 },
  { name: "Oct", current: 7200, previous: 7000 },
  { name: "Nov", current: 7500, previous: 7200 },
  { name: "Dec", current: 8000, previous: 7500 },
];

const yearlyData = [
  { name: "2020", current: 65000, previous: 60000 },
  { name: "2021", current: 72000, previous: 65000 },
  { name: "2022", current: 80000, previous: 72000 },
  { name: "2023", current: 90000, previous: 80000 },
  { name: "2024", current: 100000, previous: 90000 },
];

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  const [period, setPeriod] = useState("monthly");

  // Select data based on period
  const getChartData = () => {
    switch (period) {
      case "daily":
        return dailyData;
      case "weekly":
        return weeklyData;
      case "yearly":
        return yearlyData;
      default:
        return monthlyData;
    }
  };

  const data = getChartData();

  // Calculate totals and percentage change
  const currentTotal = data.reduce((sum, item) => sum + item.current, 0);
  const previousTotal = data.reduce((sum, item) => sum + item.previous, 0);
  const percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
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
    switch (period) {
      case "daily":
        return "Today vs Yesterday";
      case "weekly":
        return "This Week vs Last Week";
      case "monthly":
        return "This Month vs Last Month";
      case "yearly":
        return "This Year vs Last Year";
      default:
        return "Current vs Previous";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>{getPeriodLabel()}</CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Period</p>
            <p className="text-2xl font-bold">{formatCurrency(currentTotal)}</p>
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), ""]}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="current"
                name="Current"
                stroke="#d97706"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                name="Previous"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
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
      </CardContent>
    </Card>
  );
}

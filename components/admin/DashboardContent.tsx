"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingBag,
  Utensils,
  Star,
  Users,
  Search,
} from "lucide-react";
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
import { RevenueChart } from "./RevenueChart";
import { StatisticsSection } from "./StatisticsSection";
import { PeakTimeChart } from "./PeakTimeChart";

const dailyOrderSummaryData = [
  { name: "09", rental: 20, food: 18 },
  { name: "10", rental: 32, food: 5 },
  { name: "11", rental: 50, food: 0 },
  { name: "12", rental: 45, food: 0 },
  { name: "13", rental: 20, food: 18 },
  { name: "14", rental: 10, food: 5 },
  { name: "15", rental: 32, food: 0 },
  { name: "16", rental: 48, food: 12 },
  { name: "17", rental: 20, food: 15 },
];

const weeklyOrderSummaryData = [
  { name: "Mon", rental: 45, food: 30 },
  { name: "Tue", rental: 52, food: 25 },
  { name: "Wed", rental: 60, food: 35 },
  { name: "Thu", rental: 70, food: 40 },
  { name: "Fri", rental: 90, food: 55 },
  { name: "Sat", rental: 120, food: 70 },
  { name: "Sun", rental: 100, food: 60 },
];

const monthlyOrderSummaryData = [
  { name: "Jan", rental: 320, food: 180 },
  { name: "Feb", rental: 350, food: 200 },
  { name: "Mar", rental: 400, food: 220 },
  { name: "Apr", rental: 450, food: 250 },
  { name: "May", rental: 470, food: 260 },
  { name: "Jun", rental: 500, food: 280 },
];

const dailyTrafficData = [
  { name: "Bookings", value: 15, color: "#22c55e" },
  { name: "Visit", value: 15, color: "#f97316" },
];

const weeklyTrafficData = [
  { name: "Bookings", value: 85, color: "#22c55e" },
  { name: "Visit", value: 120, color: "#f97316" },
];

const monthlyTrafficData = [
  { name: "Bookings", value: 350, color: "#22c55e" },
  { name: "Visit", value: 480, color: "#f97316" },
];

const COLORS = ["#22c55e", "#f97316"];

export function DashboardContent() {
  const [orderTimeRange, setOrderTimeRange] = useState("daily");
  const [trafficTimeRange, setTrafficTimeRange] = useState("daily");

  const getOrderSummaryData = () => {
    switch (orderTimeRange) {
      case "weekly":
        return weeklyOrderSummaryData;
      case "monthly":
        return monthlyOrderSummaryData;
      default:
        return dailyOrderSummaryData;
    }
  };

  const getTrafficData = () => {
    switch (trafficTimeRange) {
      case "weekly":
        return weeklyTrafficData;
      case "monthly":
        return monthlyTrafficData;
      default:
        return dailyTrafficData;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex-1 w-full overflow-auto">
      <motion.div
        className="w-full px-6 py-6 space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back to your MGE Playstation admin dashboard.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
        >
          <motion.div variants={item}>
            <StatsCard
              title="Bookings"
              value="230"
              change={4}
              icon={<ShoppingBag className="h-5 w-5" />}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Food & Drink"
              value="185"
              change={2}
              icon={<Utensils className="h-5 w-5" />}
              iconBg="bg-cyan-100"
              iconColor="text-cyan-600"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Revenue"
              value="Rp100.000"
              change={5}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Rating"
              value="4.5"
              change={2}
              icon={<Star className="h-5 w-5" />}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </motion.div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div variants={item}>
          <RevenueChart />
        </motion.div>

        {/* Unit, Consoles, & Games Statistics */}
        <motion.div variants={item}>
          <StatisticsSection />
        </motion.div>

        {/* Peak Time Chart */}
        <motion.div variants={item}>
          <PeakTimeChart />
        </motion.div>

        {/* Order Summary and Website Traffic */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    Rental vs Food & Drink orders
                  </CardDescription>
                </div>
                <Select value={orderTimeRange} onValueChange={setOrderTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Daily" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getOrderSummaryData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="rental"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="food"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-8 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm">Rental</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-sm">Food & Drink</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Website Traffic</CardTitle>
                  <CardDescription>
                    Traffic sources and visitor data
                  </CardDescription>
                </div>
                <Select value={trafficTimeRange} onValueChange={setTrafficTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Daily" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTrafficData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getTrafficData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div>
                      <div className="text-lg font-semibold">{getTrafficData()[0].value}</div>
                      <div className="text-sm text-muted-foreground">
                        Bookings
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <div>
                      <div className="text-lg font-semibold">{getTrafficData()[1].value}</div>
                      <div className="text-sm text-muted-foreground">
                        Visits
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
                      <Users className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{getTrafficData()[0].value + getTrafficData()[1].value}</div>
                      <div className="text-sm text-muted-foreground">
                        Visitors
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Search className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Google</div>
                      <div className="text-sm text-muted-foreground">
                        Source
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatsCard(props: StatsCardProps) {
  const { title, value, change, icon, iconBg, iconColor } = props;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${iconBg}`}
          >
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div
            className={`flex items-center ${
              change > 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {change > 0 ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            <span className="ml-1 text-sm font-medium">{change}%</span>
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            from last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

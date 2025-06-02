"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader } from "../ui/card";
import {
  getPopularityStats,
  PopularityStatsResponse,
  PopularUnit,
  PopularFnB,
} from "@/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define types for our data structure
type TrendingItem = {
  rank: number;
  name: string;
  orders: number;
};

type TrendingData = {
  rental: TrendingItem[];
  food: TrendingItem[];
};

type ConsoleStats = {
  name: string;
  value: number;
  color: string;
};

type MostPopular = {
  unit: { name: string; description: string };
  game: { name: string; description: string };
  food: { name: string; description: string };
  drink: { name: string; description: string };
};

type PeriodData = {
  mostPopular: MostPopular;
  trending: TrendingData;
  consoleStats: ConsoleStats[];
};

// Sample data for different time periods
const dailyData: PeriodData = {
  mostPopular: {
    unit: { name: "VIP Unit 1", description: "Most Popular Unit" },
    game: { name: "PES 2024", description: "Most Popular Game" },
    food: { name: "Tahu Bakso", description: "Most Popular Food" },
    drink: { name: "Jus Lemon", description: "Most Popular Drink" },
  },
  trending: {
    rental: [
      { rank: 1, name: "VVIP Unit A", orders: 23 },
      { rank: 2, name: "VVIP Unit B", orders: 20 },
      { rank: 3, name: "Regular Unit A", orders: 11 },
      { rank: 4, name: "VIP Unit C", orders: 9 },
    ],
    food: [
      { rank: 1, name: "Tahu Bakso", orders: 18 },
      { rank: 2, name: "Jus Lemon", orders: 15 },
      { rank: 3, name: "Nasi Goreng", orders: 12 },
      { rank: 4, name: "Es Teh", orders: 10 },
    ],
  },
  consoleStats: [
    { name: "Playstation 4", value: 70, color: "#4ade80" },
    { name: "Playstation 5", value: 30, color: "#fb923c" },
  ],
};

const weeklyData: PeriodData = {
  mostPopular: {
    unit: { name: "VVIP Unit A", description: "Most Popular Unit" },
    game: { name: "FIFA 2024", description: "Most Popular Game" },
    food: { name: "Nasi Goreng", description: "Most Popular Food" },
    drink: { name: "Es Teh", description: "Most Popular Drink" },
  },
  trending: {
    rental: [
      { rank: 1, name: "VVIP Unit A", orders: 120 },
      { rank: 2, name: "VIP Unit 1", orders: 95 },
      { rank: 3, name: "VVIP Unit B", orders: 82 },
      { rank: 4, name: "Regular Unit B", orders: 65 },
    ],
    food: [
      { rank: 1, name: "Nasi Goreng", orders: 85 },
      { rank: 2, name: "Es Teh", orders: 72 },
      { rank: 3, name: "Ayam Goreng", orders: 65 },
      { rank: 4, name: "Kopi Susu", orders: 58 },
    ],
  },
  consoleStats: [
    { name: "Playstation 4", value: 65, color: "#4ade80" },
    { name: "Playstation 5", value: 35, color: "#fb923c" },
  ],
};

const monthlyData: PeriodData = {
  mostPopular: {
    unit: { name: "VVIP Unit B", description: "Most Popular Unit" },
    game: { name: "GTA V", description: "Most Popular Game" },
    food: { name: "Mie Goreng", description: "Most Popular Food" },
    drink: { name: "Kopi Susu", description: "Most Popular Drink" },
  },
  trending: {
    rental: [
      { rank: 1, name: "VVIP Unit B", orders: 450 },
      { rank: 2, name: "VVIP Unit A", orders: 380 },
      { rank: 3, name: "VIP Unit 1", orders: 320 },
      { rank: 4, name: "Regular Unit C", orders: 280 },
    ],
    food: [
      { rank: 1, name: "Mie Goreng", orders: 320 },
      { rank: 2, name: "Kopi Susu", orders: 290 },
      { rank: 3, name: "Nasi Goreng", orders: 250 },
      { rank: 4, name: "Es Teh", orders: 220 },
    ],
  },
  consoleStats: [
    { name: "Playstation 4", value: 60, color: "#4ade80" },
    { name: "Playstation 5", value: 40, color: "#fb923c" },
  ],
};

const yearlyData: PeriodData = {
  mostPopular: {
    unit: { name: "VVIP Unit A", description: "Most Popular Unit" },
    game: { name: "Call of Duty", description: "Most Popular Game" },
    food: { name: "Ayam Goreng", description: "Most Popular Food" },
    drink: { name: "Soda", description: "Most Popular Drink" },
  },
  trending: {
    rental: [
      { rank: 1, name: "VVIP Unit A", orders: 2300 },
      { rank: 2, name: "VVIP Unit B", orders: 1850 },
      { rank: 3, name: "VIP Unit 1", orders: 1540 },
      { rank: 4, name: "VIP Unit C", orders: 1320 },
    ],
    food: [
      { rank: 1, name: "Ayam Goreng", orders: 1800 },
      { rank: 2, name: "Soda", orders: 1650 },
      { rank: 3, name: "Nasi Goreng", orders: 1450 },
      { rank: 4, name: "Es Teh", orders: 1200 },
    ],
  },
  consoleStats: [
    { name: "Playstation 4", value: 55, color: "#4ade80" },
    { name: "Playstation 5", value: 45, color: "#fb923c" },
  ],
};

interface StatisticsSectionProps {
  className?: string;
}

export function StatisticsSection({ className }: StatisticsSectionProps) {
  const [period, setPeriod] = useState("daily");
  const [trendingFilter, setTrendingFilter] = useState<"rental" | "food">(
    "rental"
  );
  const [popularityStats, setPopularityStats] =
    useState<PopularityStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch popularity statistics
  useEffect(() => {
    async function fetchPopularityStats() {
      try {
        setLoading(true);
        const data = await getPopularityStats();
        setPopularityStats(data);
      } catch (error) {
        console.error("Failed to fetch popularity statistics:", error);
        toast.error("Failed to load popularity statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchPopularityStats();
  }, []);

  // Select data based on period
  const getData = (): PeriodData => {
    switch (period) {
      case "daily":
        return dailyData;
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      case "yearly":
        return yearlyData;
      default:
        return dailyData;
    }
  };

  const data = getData();

  // Convert API data to UI format for trending
  const mapPopularUnitsToTrendingItems = (
    units: PopularUnit[] = []
  ): TrendingItem[] => {
    return units.map((unit, index) => ({
      rank: index + 1,
      name: unit.name,
      orders: unit.bookings,
    }));
  };

  const mapPopularFnBToTrendingItems = (
    items: PopularFnB[] = []
  ): TrendingItem[] => {
    return items.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      orders: item.total_ordered,
    }));
  };

  // Get trending data based on filter and API data
  const getTrendingData = () => {
    if (loading || !popularityStats) {
      // Return placeholder when loading
      return [];
    }

    if (trendingFilter === "rental") {
      return mapPopularUnitsToTrendingItems(popularityStats.data.popular_units);
    } else {
      return mapPopularFnBToTrendingItems(popularityStats.data.popular_fnb);
    }
  };

  const trendingData = getTrendingData();

  return (
    <div
      className={`${className} w-full p-3 sm:p-4 md:p-6 bg-gray-50 rounded-lg`}
    >
      {/* Header Section */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold">
          Unit, Consoles, & Games Statistics
        </h2>

        <div className="relative">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[90px] sm:w-[100px] h-8 sm:h-10 text-xs sm:text-sm bg-white border border-gray-200">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Left Side - Most Popular Card */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium mb-3 sm:mb-4 md:mb-6">
            Most Popular
          </h3>

          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Most Popular Unit */}
            <Card className="shadow-sm sm:shadow-md rounded-xl border border-gray-200">
              <CardHeader className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4">
                <div className="flex-shrink-0">
                  <div className="p-1 sm:p-2 rounded-lg bg-gray-100">
                    <Image
                      src="/images/logo.png"
                      alt="Unit logo"
                      width={30}
                      height={30}
                      className="rounded-md w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] md:w-[40px] md:h-[40px]"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base md:text-lg">
                    {data.mostPopular.unit.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {data.mostPopular.unit.description}
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* Most Popular Game */}
            <Card className="shadow-sm sm:shadow-md rounded-xl border border-gray-200">
              <CardHeader className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4">
                <div className="flex-shrink-0">
                  <div className="p-1 sm:p-2 rounded-full bg-gray-100">
                    <Image
                      src="/images/logo.png"
                      alt="Game logo"
                      width={30}
                      height={30}
                      className="rounded-full w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] md:w-[40px] md:h-[40px]"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base md:text-lg">
                    {data.mostPopular.game.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {data.mostPopular.game.description}
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* Most Popular Food */}
            <Card className="shadow-sm sm:shadow-md rounded-xl border border-gray-200">
              <CardHeader className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4">
                <div className="flex-shrink-0">
                  <div className="p-1 sm:p-2 rounded-full bg-gray-100">
                    <Image
                      src="/images/logo.png"
                      alt="Food logo"
                      width={30}
                      height={30}
                      className="rounded-full w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] md:w-[40px] md:h-[40px]"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base md:text-lg">
                    {data.mostPopular.food.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {data.mostPopular.food.description}
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* Most Popular Drink */}
            <Card className="shadow-sm sm:shadow-md rounded-xl border border-gray-200">
              <CardHeader className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4">
                <div className="flex-shrink-0">
                  <div className="p-1 sm:p-2 rounded-lg bg-gray-100">
                    <Image
                      src="/images/logo.png"
                      alt="Drink logo"
                      width={30}
                      height={30}
                      className="rounded-md w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] md:w-[40px] md:h-[40px]"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base md:text-lg">
                    {data.mostPopular.drink.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {data.mostPopular.drink.description}
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Right Side - Trending & Console Stats */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* What's Trending Card */}
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 mb-3 sm:mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-medium">
                What&apos;s Trending
              </h3>

              <div className="relative">
                <Select
                  value={trendingFilter}
                  onValueChange={(value) =>
                    setTrendingFilter(value as "rental" | "food")
                  }
                >
                  <SelectTrigger className="w-[90px] sm:w-[100px] h-8 sm:h-10 text-xs sm:text-sm bg-white border border-gray-200">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">Rental</SelectItem>
                    <SelectItem value="food">Food & Drink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-32 sm:h-40">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-500 mb-2" />
                <span className="text-xs sm:text-sm">
                  Loading trending data...
                </span>
              </div>
            ) : trendingData.length === 0 ? (
              <div className="text-center py-6 sm:py-10 text-gray-500 text-xs sm:text-sm">
                No trending data available
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {trendingData.map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm font-medium text-gray-500 w-3 sm:w-4">
                        {item.rank}
                      </span>
                      <div className="p-1 sm:p-2 rounded-full">
                        <Image
                          src="/images/logo.png"
                          alt="Item logo"
                          width={24}
                          height={24}
                          className="rounded-full w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] md:w-[30px] md:h-[30px]"
                        />
                      </div>
                      <span className="font-medium text-xs sm:text-sm truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {item.rank === 1 && (
                        <div className="mr-2 sm:mr-3 flex items-center">
                          <div className="p-1 sm:p-2 rounded-full flex items-center">
                            {/* Popular Badge */}
                            <span className="text-[10px] xs:text-xs sm:text-xs font-medium flex items-center gap-1">
                              <span
                                role="img"
                                aria-label="Popular"
                                className="text-sm sm:text-lg"
                              >
                                🔥
                              </span>
                              <span className="hidden xs:inline">Popular</span>
                            </span>
                          </div>
                        </div>
                      )}
                      <span className="font-medium text-xs sm:text-sm">
                        {item.orders}{" "}
                        <span className="hidden xs:inline">
                          {trendingFilter === "rental" ? "Booking" : "Order"}
                          {item.orders !== 1 ? "s" : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Console Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium mb-3 sm:mb-4 md:mb-6">
              Console Stats
            </h3>

            <div className="flex flex-col sm:flex-row">
              {/* Donut Chart */}
              <div className="w-full sm:w-1/2 h-[120px] sm:h-[150px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.consoleStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.consoleStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full sm:w-1/2 flex flex-row sm:flex-col justify-center space-x-4 sm:space-x-0 sm:space-y-4 md:space-y-6 mt-2 sm:mt-0">
                {data.consoleStats.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="h-2 w-2 sm:h-3 sm:w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <span className="font-bold text-sm sm:text-lg md:text-xl">
                        {item.value}%
                      </span>
                      <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500">
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

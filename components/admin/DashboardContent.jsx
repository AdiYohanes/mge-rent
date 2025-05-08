"use client";

import React from "react";
import {
    LineChart,
    BarChart,
    Line,
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

const revenueData = [
    { name: "Jan", value: 150 },
    { name: "Feb", value: 180 },
    { name: "Mar", value: 200 },
    { name: "Apr", value: 230 },
    { name: "May", value: 280 },
    { name: "Jun", value: 150 },
    { name: "Jul", value: 200 },
    { name: "Aug", value: 250 },
    { name: "Sep", value: 300 },
    { name: "Oct", value: 280 },
    { name: "Nov", value: 320 },
    { name: "Dec", value: 350 },
];

const orderSummaryData = [
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

const trafficData = [
    { name: "Bookings", value: 15, color: "#22c55e" },
    { name: "Visit", value: 15, color: "#f97316" },
];

const COLORS = ["#22c55e", "#f97316"];

export function DashboardContent() {
    return (
        <main className="flex-1 p-6 overflow-auto">
            <div className="grid gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Bookings"
                        value="230k"
                        change={4}
                        icon={<ShoppingBag className="w-5 h-5" />}
                        iconBg="bg-amber-100"
                        iconColor="text-amber-600"
                    />
                    <StatsCard
                        title="Food & Drink"
                        value="230k"
                        change={2}
                        icon={<Utensils className="w-5 h-5" />}
                        iconBg="bg-cyan-100"
                        iconColor="text-cyan-600"
                    />
                    <StatsCard
                        title="Revenue"
                        value="Rp100.000"
                        change={5}
                        icon={<DollarSign className="w-5 h-5" />}
                        iconBg="bg-emerald-100"
                        iconColor="text-emerald-600"
                    />
                    <StatsCard
                        title="Rating"
                        value="4.5"
                        change={2}
                        icon={<Star className="w-5 h-5" />}
                        iconBg="bg-orange-100"
                        iconColor="text-orange-600"
                    />
                </div>

                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Revenue</CardTitle>
                                <CardDescription>Updated 1 second ago</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#ca8a04"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Booking and Trending */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Today&apos;s Booking</CardTitle>
                            </div>
                            <Select defaultValue="rental">
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Rental" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rental">Rental</SelectItem>
                                    <SelectItem value="food">Food & Drink</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <BookingItem
                                    title="VVIP Unit A"
                                    subtitle="Premium Room"
                                    hours="2 hrs"
                                />
                                <BookingItem
                                    title="Regular Unit B"
                                    subtitle="Standard Room"
                                    hours="4 hrs"
                                />
                                <BookingItem
                                    title="VIP Unit 1 Netflix + Nintendo"
                                    subtitle="Premium Entertainment"
                                    hours="2 hrs"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>What&apos;s Trending</CardTitle>
                            </div>
                            <Select defaultValue="unit">
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unit">Unit</SelectItem>
                                    <SelectItem value="food">Food & Drink</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <TrendingItem
                                    number={1}
                                    title="VVIP Unit A"
                                    subtitle="Premium Room"
                                    orders="23 Order"
                                />
                                <TrendingItem
                                    number={2}
                                    title="VVIP Unit A"
                                    subtitle="Premium Room"
                                    orders="20 Order"
                                />
                                <TrendingItem
                                    number={3}
                                    title="VVIP Unit A"
                                    subtitle="Premium Room"
                                    orders="11 Order"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary and Website Traffic */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>Updated 1 second ago</CardDescription>
                            </div>
                            <Select defaultValue="daily">
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
                                    <BarChart data={orderSummaryData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar
                                            dataKey="rental"
                                            fill="#22c55e"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar dataKey="food" fill="#06b6d4" radius={[4, 4, 0, 0]} />
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Website Traffic</CardTitle>
                                <CardDescription>Updated 1 second ago</CardDescription>
                            </div>
                            <Select defaultValue="daily">
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
                                            data={trafficData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {trafficData.map((entry, index) => (
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
                                        <div className="text-lg font-semibold">15</div>
                                        <div className="text-sm text-gray-500">Bookings</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                    <div>
                                        <div className="text-lg font-semibold">15</div>
                                        <div className="text-sm text-gray-500">Visit</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
                                        <Users className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold">15</div>
                                        <div className="text-sm text-gray-500">Visitors</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                        <Search className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold">Google</div>
                                        <div className="text-sm text-gray-500">Source</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

function StatsCard(props) {
    const { title, value, change, icon, iconBg, iconColor } = props;
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">{title}</span>
                        <span className="text-2xl font-bold">{value}</span>
                    </div>
                    <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full ${iconBg}`}
                    >
                        <div className={iconColor}>{icon}</div>
                    </div>
                </div>
                <div className="flex items-center mt-4">
                    <div
                        className={`flex items-center ${change > 0 ? "text-emerald-500" : "text-red-500"
                            }`}
                    >
                        {change > 0 ? (
                            <ArrowUp className="w-4 h-4" />
                        ) : (
                            <ArrowDown className="w-4 h-4" />
                        )}
                        <span className="ml-1 text-sm font-medium">{change}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function BookingItem(props) {
    const { title, subtitle, hours } = props;
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className="text-sm font-medium">{hours}</div>
        </div>
    );
}

function TrendingItem(props) {
    const { number, title, subtitle, orders } = props;
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-full">
                    {number}
                </div>
                <div>
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
            </div>
            <div className="text-sm font-medium">{orders}</div>
        </div>
    );
} 
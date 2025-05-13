"use client";

import React, { useState, useEffect } from "react";
import { BookingTable } from "./BookingTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Clock, Utensils, Calendar } from "lucide-react";

export function DashboardBookingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Ambil tipe booking dari query params (room, food, event)
    const bookingType = searchParams.get("type") || "room";

    // Ambil tab dari query params atau gunakan 'all' sebagai default
    const [activeTab, setActiveTab] = useState(
        searchParams.get("tab") || "all"
    );

    // Loading state untuk animasi
    const [isLoading, setIsLoading] = useState(false);

    // Update URL saat tab berubah untuk memungkinkan bookmark/share
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set("tab", activeTab);

        // Pertahankan tipe booking jika ada
        if (bookingType) {
            params.set("type", bookingType);
        }

        // Update URL tanpa refresh halaman
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [activeTab, pathname, router, searchParams, bookingType]);

    // Handler untuk perubahan tab
    const handleTabChange = (value) => {
        setIsLoading(true);
        setActiveTab(value);

        // Simulasi loading untuk UX yang lebih baik
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    // Tentukan judul dan deskripsi berdasarkan tipe booking dan tab aktif
    const getBookingTypeContent = () => {
        switch (bookingType) {
            case "food":
                return {
                    title: "Food & Drink Bookings",
                    description: "Manage food & drink orders",
                    icon: <Utensils className="h-5 w-5 text-orange-500 mr-2" />,
                    tabs: [
                        { id: "all", label: "All Orders" }
                    ]
                };
            case "event":
                return {
                    title: "Event Bookings",
                    description: "Manage event reservations",
                    icon: <Calendar className="h-5 w-5 text-purple-500 mr-2" />,
                    tabs: [
                        { id: "all", label: "All Events" }
                    ]
                };
            default: // room
                return {
                    title: "Room Bookings",
                    description: "Manage room reservations",
                    icon: <CalendarCheck className="h-5 w-5 text-blue-500 mr-2" />,
                    tabs: [
                        { id: "all", label: "All Bookings" },
                        { id: "pending", label: "Pending" },
                        { id: "confirmed", label: "Confirmed" },
                        { id: "cancelled", label: "Cancelled" },
                    ]
                };
        }
    };

    // Tentukan judul dan deskripsi berdasarkan tab aktif
    const getTabContent = () => {
        switch (activeTab) {
            case "pending":
                return {
                    title: "Pending Bookings",
                    description: `Manage all pending ${bookingType} bookings`,
                    filterStatus: "booking_success",
                    icon: <Clock className="h-5 w-5 text-amber-500 mr-2" />
                };
            case "confirmed":
                return {
                    title: "Confirmed Bookings",
                    description: `Manage all confirmed ${bookingType} bookings`,
                    filterStatuses: ["booking_ongoing", "booking_finish"],
                    icon: <CalendarCheck className="h-5 w-5 text-green-500 mr-2" />
                };
            case "cancelled":
                return {
                    title: "Cancelled Bookings",
                    description: `View all cancelled ${bookingType} bookings`,
                    filterStatuses: ["booking_canceled", "return"],
                    icon: <Clock className="h-5 w-5 text-red-500 mr-2" />
                };
            default:
                return {
                    title: "All Bookings",
                    description: `Manage all ${bookingType} bookings`,
                    filterStatus: null,
                    icon: <CalendarCheck className="h-5 w-5 text-gray-500 mr-2" />
                };
        }
    };

    const bookingTypeContent = getBookingTypeContent();
    const { title, description, filterStatus, icon } = getTabContent();

    return (
        <div className="w-full p-6">
            <div className="mb-6">
                <div className="flex items-center">
                    {bookingTypeContent.icon}
                    <h1 className="text-2xl font-bold text-gray-800">{bookingTypeContent.title}</h1>
                </div>
                <p className="text-sm text-gray-500 ml-7">{bookingTypeContent.description}</p>
            </div>

            {bookingType === "room" ? (
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="mb-6"
                >
                    <TabsList className="grid grid-cols-4 md:w-[600px]">
                        {bookingTypeContent.tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="data-[state=active]:bg-[#B99733] data-[state=active]:text-white"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4"
                        >
                            {isLoading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                                </div>
                            ) : (
                                <BookingTable
                                    filterStatus={activeTab === "confirmed" ?
                                        ["booking_ongoing", "booking_finish"] :
                                        activeTab === "cancelled" ?
                                            ["booking_canceled", "return"] :
                                            activeTab === "pending" ?
                                                "booking_success" : null}
                                    bookingType={bookingType}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            ) : (
                <BookingTable
                    filterStatus={null}
                    bookingType={bookingType}
                />
            )}
        </div>
    );
} 
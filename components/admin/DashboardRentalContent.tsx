"use client";

import React, { useState, useEffect } from "react";
import { RentalTable } from "./RentalTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Star, Trophy } from "lucide-react";

export function DashboardRentalContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

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

        // Update URL tanpa refresh halaman
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [activeTab, pathname, router, searchParams]);

    // Handler untuk perubahan tab
    const handleTabChange = (value) => {
        setIsLoading(true);
        setActiveTab(value);

        // Simulasi loading untuk UX yang lebih baik
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    // Tentukan judul dan deskripsi berdasarkan tab aktif
    const getTabContent = () => {
        switch (activeTab) {
            case "vvip":
                return {
                    title: "VVIP Units",
                    description: "Manage all VVIP rental units",
                    filterType: "vvip",
                    icon: <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                };
            case "vip":
                return {
                    title: "VIP Units",
                    description: "Manage all VIP rental units",
                    filterType: "vip",
                    icon: <Star className="h-5 w-5 text-blue-500 mr-2" />
                };
            case "regular":
                return {
                    title: "Regular Units",
                    description: "Manage all regular rental units",
                    filterType: "regular",
                    icon: <Home className="h-5 w-5 text-green-500 mr-2" />
                };
            default:
                return {
                    title: "All Rental Units",
                    description: "Manage all rental units",
                    filterType: null,
                    icon: <Home className="h-5 w-5 text-gray-500 mr-2" />
                };
        }
    };

    const { title, description, filterType, icon } = getTabContent();

    return (
        <div className="w-full p-6">
            <div className="mb-6">
                <div className="flex items-center">
                    {icon}
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                </div>
                <p className="text-sm text-gray-500 ml-7">{description}</p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="mb-6"
            >
                <TabsList className="grid grid-cols-4 md:w-[600px]">
                    <TabsTrigger value="all" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        All Units
                    </TabsTrigger>
                    <TabsTrigger value="vvip" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        VVIP
                    </TabsTrigger>
                    <TabsTrigger value="vip" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        VIP
                    </TabsTrigger>
                    <TabsTrigger value="regular" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        Regular
                    </TabsTrigger>
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
                            <RentalTable filterType={filterType} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
} 
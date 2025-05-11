"use client";

import React, { useState, useEffect } from "react";
import { UserTable } from "./UserTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, User } from "lucide-react";

export function DashboardUserContent() {
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
            case "admins":
                return {
                    title: "Admin Users",
                    description: "Manage all admin users",
                    filterRole: "admin",
                    icon: <ShieldCheck className="h-5 w-5 text-blue-500 mr-2" />
                };
            case "customers":
                return {
                    title: "Customer Users",
                    description: "Manage all customer accounts",
                    filterRole: "customer",
                    icon: <User className="h-5 w-5 text-green-500 mr-2" />
                };
            default:
                return {
                    title: "All Users",
                    description: "Manage all user accounts",
                    filterRole: null,
                    icon: <Users className="h-5 w-5 text-gray-500 mr-2" />
                };
        }
    };

    const { title, description, filterRole, icon } = getTabContent();

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
                <TabsList className="grid grid-cols-3 md:w-[450px]">
                    <TabsTrigger value="all" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        All Users
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        Admins
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        Customers
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
                            <UserTable filterRole={filterRole} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
} 
"use client";

import { PromoTable } from "@/components/admin/PromoTable";

export default function PromoManagementPage() {
    return (
        <div className="flex flex-col">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <PromoTable />
            </div>
        </div>
    );
} 
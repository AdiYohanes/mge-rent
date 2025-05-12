"use client";

import { TransactionTable } from "@/components/admin/TransactionTable";

export default function TransactionsPage() {
    return (
        <div className="flex flex-col">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <TransactionTable />
            </div>
        </div>
    );
} 
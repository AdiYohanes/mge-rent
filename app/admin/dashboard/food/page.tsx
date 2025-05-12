"use client";

import { useSearchParams } from "next/navigation";
import { FoodDrinkTable } from "@/components/admin/FoodDrinkTable";

export default function FoodDrinkPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  // Default nilai selectedTab adalah "all" jika tidak ada parameter category
  // Jika ada parameter category, gunakan nilai tersebut sebagai tab yang dipilih
  const selectedTab = category ? category : "all";

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Food & Drink Management
          </h2>
        </div>
        <FoodDrinkTable initialTab={selectedTab as "all" | "food" | "drink"} />
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { LandingPageTable } from "@/components/admin/LandingPageTable";
import { Breadcrumb } from "@/components/admin/Breadcrumb";

export const metadata: Metadata = {
  title: "Landing Page Content Management",
  description: "Manage the content displayed on the landing page",
};

export default function LandingPageSettings() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Landing Page Settings
        </h1>
        <Breadcrumb
          items={[
            { label: "Dashboard", link: "/admin/dashboard" },
            { label: "Settings", link: "/admin/dashboard/settings" },
            {
              label: "Landing Page",
              link: "/admin/dashboard/settings/landing-page",
            },
          ]}
        />
        <p className="text-gray-600 max-w-3xl">
          Manage the content that appears on the landing page. You can enable or
          disable sections, edit their content, and control their visibility.
        </p>
      </div>

      <LandingPageTable />
    </div>
  );
}

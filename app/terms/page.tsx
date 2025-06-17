"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// Terms content configuration
const termsContent = {
  lastUpdated: "March 8, 2024",
  sections: [
    {
      title: "1. Rental Service Agreement",
      content: `By using our PlayStation rental service, you agree to these terms. Our service provides temporary access to PlayStation consoles and games for entertainment purposes only.`,
    },
    {
      title: "2. Rental Duration and Fees",
      content: `Rental periods are calculated in hours or days as specified during booking. Late returns will incur additional charges. All fees must be paid in advance, and a security deposit may be required.`,
    },
    {
      title: "3. Equipment Care and Responsibility",
      content: `You are responsible for the PlayStation console and games during the rental period. Any damage, loss, or theft must be reported immediately. You will be charged for any damage beyond normal wear and tear.`,
    },
    {
      title: "4. Age Restrictions",
      content: `You must be at least 18 years old to rent equipment. Minors must be accompanied by a parent or legal guardian who will be responsible for the rental agreement.`,
    },
    {
      title: "5. Game Selection and Availability",
      content: `Game availability is subject to current inventory. We reserve the right to substitute games of similar value if the requested game is unavailable. Game selection may be limited during peak periods.`,
    },
    {
      title: "6. Technical Support",
      content: `Basic technical support is provided during business hours. We are not responsible for any game progress loss or technical issues beyond our control.`,
    },
    {
      title: "7. Cancellation and Refunds",
      content: `Cancellations must be made at least 24 hours before the scheduled rental time for a full refund. Late cancellations may be subject to a cancellation fee.`,
    },
    {
      title: "8. Prohibited Activities",
      content: `Modifying console hardware, installing unauthorized software, or attempting to bypass security measures is strictly prohibited. Violation may result in immediate termination of rental and additional charges.`,
    },
    {
      title: "9. Privacy and Data",
      content: `We recommend clearing your personal data before returning the console. We are not responsible for any personal data left on the console.`,
    },
    {
      title: "10. Liability",
      content: `We are not liable for any indirect, incidental, or consequential damages arising from the use of our rental service. Our liability is limited to the rental fee paid.`,
    },
  ],
};

const TermsPage = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#b99733] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-gray-100 text-[#b99733]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-minecraft text-[#b99733] tracking-wide">
              Terms and Conditions
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Last Updated */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#b99733] mb-8">
          <p className="text-sm text-gray-600 font-minecraft">
            Last updated:{" "}
            <span className="text-[#b99733] font-semibold">
              {termsContent.lastUpdated}
            </span>
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-4">
          {termsContent.sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-lg border-2 border-[#b99733] p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h2
                className="text-lg font-minecraft text-[#b99733] mb-3 cursor-pointer hover:text-[#967515] transition-colors duration-300 flex items-center justify-between"
                onClick={() =>
                  setActiveSection(
                    activeSection === section.title ? null : section.title
                  )
                }
              >
                <span>{section.title}</span>
                <span className="text-sm">
                  {activeSection === section.title ? "▼" : "▶"}
                </span>
              </h2>
              <div
                className={`text-gray-700 text-sm leading-relaxed font-minecraft ${
                  activeSection === section.title ? "block" : "hidden"
                }`}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center bg-white p-6 rounded-lg border border-[#b99733] shadow-sm">
          <p className="text-sm text-gray-600 font-minecraft">
            For any questions about our rental terms, please contact our support
            team at{" "}
            <span className="text-[#b99733] font-semibold">
              support@playstation-rental.com
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BookingSuccessPage() {
  const router = useRouter();
  const orderId = "ASHFK123490PK"; // Typically would come from a state or API

  return (
    <div className="max-w-lg mx-auto py-20 px-6 font-funnel text-center">
      <div className="mb-10 flex justify-center">
        <div className="relative w-32 h-32">
          <Image
            src="/images/success.png"
            alt="Success Checkmark"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      <h1 className="text-6xl mb-10 font-minecraft text-[#B99733]">
        Your Booking has <br />
        been rescheduled!
      </h1>

      <div className="bg-[#FFFCEB] py-6 px-4 rounded-sm mb-10 shadow-sm">
        <p className="mb-3 text-base font-medium">Order ID: {orderId}</p>

        <p className="text-base leading-relaxed">
          Rest easy. We will send you a confirmation and payment information
          through
          <span className="font-bold text-[#B99733]"> Whatsapp</span>, please
          sit tight!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/userBookings")}
          className="py-4 px-6 border-2 border-gray-300 hover:bg-gray-50 transition-colors text-base font-medium"
        >
          See Booking History
        </button>
        <button
          onClick={() => router.push("/")}
          className="py-4 px-6 bg-[#B99733] text-white hover:bg-[#A88722] transition-colors text-base font-bold"
        >
          Book Another Room
        </button>
      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-gray-500">
          Thank you for choosing our service
        </p>
      </div>
    </div>
  );
}

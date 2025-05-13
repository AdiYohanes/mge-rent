"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BookingCancelledPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto py-20 px-6 font-funnel text-center">
      <div className="mb-10 flex justify-center">
        <div className="relative w-32 h-32">
          <Image
            src="/images/cancel.png"
            alt="Cancellation Icon"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      <h1 className="text-6xl mb-10 font-minecraft text-black">
        Your Booking has <br />
        been cancelled.
      </h1>

      <div className="bg-[#FFFCEB] py-6 px-4 rounded-sm mb-10 shadow-sm">
        <p className="text-base leading-relaxed">
          We&apos;re sad to see you go, but we will meet another time!
          <br />
          We will send you a confirmation and refund information through
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
    </div>
  );
}

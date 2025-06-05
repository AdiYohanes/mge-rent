"use client";
import { useState, useEffect } from "react";
import { useMounted } from "@/hooks/use-mounted";

const Pricelist = () => {
  const mounted = useMounted();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!mounted) return;

    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  const packages = [
    { name: "REGULER 1 (PS 4)", price: "10K" },
    { name: "REGULER 2 (PS 4)", price: "10K" },
    { name: "REGULER 3 (PS 4)", price: "10K" },
    { name: "REGULER 4 (PS 4)", price: "10K" },
    { name: "REGULER 5 (PS 4)", price: "10K" },
    { name: "REGULER 6 (PS 5)", price: "15K" },
  ];

  const vipPackages = [
    { name: "VIP 1 (PS 4 + NETFLIX)", price: "20K" },
    { name: "VIP 2 (PS 4 + NETFLIX + NINTENDO)", price: "25K" },
    { name: "VIP 3 (PS 5 + NETFLIX)", price: "25K" },
    { name: "VIP 4 (PS 5 + NETFLIX)", price: "25K" },
  ];

  const vvipPackages = [{ name: "VVIP 1 (PS 5 + NETFLIX)", price: "35K" }];

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-b from-purple-600 to-purple-900 text-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-8 text-center relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        <div className="relative z-10">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black text-yellow-400 mb-2">
              MEDAN GAMING ECOSYSTEM
            </h1>
            <div className="w-32 h-1 bg-yellow-400 mx-auto"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl mb-4">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              PRICE LIST
            </h2>
          </div>
          <div className="inline-block bg-[#edc531] text-[#1B1010] px-6 py-2 font-minecraft border-2 border-[#1B1010] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            {currentTime?.toLocaleTimeString("id-ID")}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1 right-1 bg-yellow-400 text-purple-900 px-2 py-1 rounded-none text-sm font-bold shadow-lg">
          MAKE GOOD ENOUGH
        </div>
      </div>

      {/* Torn Paper Effect */}
      <div className="h-4 bg-white relative">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 Q10,8 20,4 T40,6 T60,2 T80,7 T100,3 L100,10 L0,10 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Price Lists */}
      <div className="p-6 space-y-8">
        {/* Regular Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-yellow-300">REGULER</h3>
          <div className="space-y-2">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-purple-400/30"
              >
                <span className="text-lg">{pkg.name}</span>
                <span className="text-xl font-bold text-cyan-300 flex items-center">
                  ..... {pkg.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-yellow-300">VIP ROOM</h3>
          <div className="space-y-2">
            {vipPackages.map((pkg, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-purple-400/30"
              >
                <span className="text-lg">{pkg.name}</span>
                <span className="text-xl font-bold text-cyan-300 flex items-center">
                  ..... {pkg.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* VVIP Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-yellow-300">VVIP ROOM</h3>
          <div className="space-y-2">
            {vvipPackages.map((pkg, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-purple-400/30"
              >
                <span className="text-lg">{pkg.name}</span>
                <span className="text-xl font-bold text-cyan-300 flex items-center">
                  ..... {pkg.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Keterangan */}
        <div className="text-right text-sm opacity-75 mt-6">
          <div>* Capacity</div>
          <div>REGULER Room - 4 - 6 orang</div>
          <div>VIP Room - 4 - 6 orang</div>
          <div>VVIP Room - 6 - 10 orang</div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 text-center relative">
        {/* Gaming Controller Image Placeholder */}
        <div className="absolute bottom-4 right-4 opacity-30">
          <div className="w-24 h-16 bg-gray-800 rounded-lg"></div>
        </div>

        <div className="p-6">
          <h3 className="text-[#edc531] text-xl font-bold mb-2">
            #MAKEGOODENOUGH
          </h3>
          <h2 className="text-4xl font-black text-[#edc531] mb-4">
            NEVER STOP PLAYING
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Pricelist;

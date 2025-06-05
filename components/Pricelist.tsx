"use client";
import { useState, useEffect } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { motion } from "framer-motion";
import { FaGamepad, FaUsers, FaClock } from "react-icons/fa";

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
    {
      name: "REGULER 1 (PS 4)",
      price: "10K",
      features: ["4K Display", "Comfortable Chair", "Air Conditioned"],
    },
    {
      name: "REGULER 2 (PS 4)",
      price: "10K",
      features: ["4K Display", "Comfortable Chair", "Air Conditioned"],
    },
    {
      name: "REGULER 3 (PS 4)",
      price: "10K",
      features: ["4K Display", "Comfortable Chair", "Air Conditioned"],
    },
    {
      name: "REGULER 4 (PS 4)",
      price: "10K",
      features: ["4K Display", "Comfortable Chair", "Air Conditioned"],
    },
    {
      name: "REGULER 5 (PS 4)",
      price: "10K",
      features: ["4K Display", "Comfortable Chair", "Air Conditioned"],
    },
    {
      name: "REGULER 6 (PS 5)",
      price: "15K",
      features: [
        "4K Display",
        "Comfortable Chair",
        "Air Conditioned",
        "PS5 Exclusive",
      ],
    },
  ];

  const vipPackages = [
    {
      name: "VIP 1 (PS 4 + NETFLIX)",
      price: "20K",
      features: [
        "4K Display",
        "Premium Chair",
        "Air Conditioned",
        "Netflix Access",
        "Snack Bar",
      ],
    },
    {
      name: "VIP 2 (PS 4 + NETFLIX + NINTENDO)",
      price: "25K",
      features: [
        "4K Display",
        "Premium Chair",
        "Air Conditioned",
        "Netflix Access",
        "Nintendo Switch",
        "Snack Bar",
      ],
    },
    {
      name: "VIP 3 (PS 5 + NETFLIX)",
      price: "25K",
      features: [
        "4K Display",
        "Premium Chair",
        "Air Conditioned",
        "Netflix Access",
        "PS5 Exclusive",
        "Snack Bar",
      ],
    },
    {
      name: "VIP 4 (PS 5 + NETFLIX)",
      price: "25K",
      features: [
        "4K Display",
        "Premium Chair",
        "Air Conditioned",
        "Netflix Access",
        "PS5 Exclusive",
        "Snack Bar",
      ],
    },
  ];

  const vvipPackages = [
    {
      name: "VVIP 1 (PS 5 + NETFLIX)",
      price: "35K",
      features: [
        "4K Display",
        "Gaming Chair",
        "Air Conditioned",
        "Netflix Access",
        "PS5 Exclusive",
        "Premium Snack Bar",
        "Private Room",
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B1010] to-[#2D1B1B] text-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1B1010] py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-[#B99733] mb-4">
              MEDAN GAMING ECOSYSTEM
            </h1>
            <div className="w-32 h-1 bg-[#B99733] mx-auto mb-8"></div>
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-2xl mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                PRICE LIST
              </h2>
              <div className="flex items-center justify-center space-x-4">
                <FaClock className="text-[#B99733] text-xl" />
                <span className="text-xl font-minecraft bg-[#B99733] text-[#1B1010] px-6 py-2 rounded-none border-2 border-[#1B1010] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {currentTime?.toLocaleTimeString("id-ID")}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Price Lists */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Regular Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center space-x-2 mb-6">
              <FaGamepad className="text-[#B99733] text-2xl" />
              <h3 className="text-2xl font-bold text-[#B99733]">REGULER</h3>
            </div>
            <div className="space-y-4">
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">{pkg.name}</span>
                    <span className="text-xl font-bold text-[#B99733]">
                      {pkg.price}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-[#B99733] rounded-full"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* VIP Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center space-x-2 mb-6">
              <FaGamepad className="text-[#B99733] text-2xl" />
              <h3 className="text-2xl font-bold text-[#B99733]">VIP ROOM</h3>
            </div>
            <div className="space-y-4">
              {vipPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">{pkg.name}</span>
                    <span className="text-xl font-bold text-[#B99733]">
                      {pkg.price}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-[#B99733] rounded-full"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* VVIP Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center space-x-2 mb-6">
              <FaGamepad className="text-[#B99733] text-2xl" />
              <h3 className="text-2xl font-bold text-[#B99733]">VVIP ROOM</h3>
            </div>
            <div className="space-y-4">
              {vvipPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">{pkg.name}</span>
                    <span className="text-xl font-bold text-[#B99733]">
                      {pkg.price}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-[#B99733] rounded-full"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Capacity Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FaUsers className="text-[#B99733] text-2xl" />
            <h3 className="text-2xl font-bold text-[#B99733]">Room Capacity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-[#B99733] mb-2">
                REGULER Room
              </h4>
              <p className="text-gray-300">4 - 6 people</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-[#B99733] mb-2">
                VIP Room
              </h4>
              <p className="text-gray-300">4 - 6 people</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-[#B99733] mb-2">
                VVIP Room
              </h4>
              <p className="text-gray-300">6 - 10 people</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <h3 className="text-[#B99733] text-xl font-bold mb-2">
            #MAKEGOODENOUGH
          </h3>
          <h2 className="text-4xl font-black text-[#B99733] mb-4">
            NEVER STOP PLAYING
          </h2>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricelist;

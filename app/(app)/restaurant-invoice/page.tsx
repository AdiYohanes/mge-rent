"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";

// Types
type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
};

export default function RestaurantInvoicePage() {
  const mounted = useMounted();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [useLoginInfo, setUseLoginInfo] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    // Get cart from localStorage
    const cartData = localStorage.getItem("restaurantCart");
    const totalData = localStorage.getItem("restaurantTotal");

    if (cartData) {
      setCart(JSON.parse(cartData));
    }

    if (totalData) {
      setTotalPrice(Number(totalData));
    }
  }, [mounted]);

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess("");

    // Sample promo codes
    if (promoCode === "DISCOUNT10") {
      const discountAmount = Math.round(totalPrice * 0.1);
      setDiscount(discountAmount);
      setPromoSuccess("10% discount applied successfully!");
    } else if (promoCode === "DISCOUNT20") {
      const discountAmount = Math.round(totalPrice * 0.2);
      setDiscount(discountAmount);
      setPromoSuccess("20% discount applied successfully!");
    } else {
      setPromoError("Invalid promo code");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleContinue = () => {
    // Validate form
    if (!fullName || !email || !username || !phoneNumber) {
      toast.error("Please fill in all required fields", {
        description:
          "All personal information fields are required to continue.",
        duration: 4000,
      });
      return;
    }

    if (!agreeToTerms) {
      toast.error("Terms and conditions required", {
        description: "Please agree to the terms and conditions to continue.",
        duration: 4000,
      });
      return;
    }

    // In a real app, you would submit the order and personal information to the backend
    toast.success("Order submitted successfully!", {
      description: "Your food order has been received and is being processed.",
      duration: 3000,
    });

    // Navigate to the success page
    setTimeout(() => {
      router.push("/restaurant-success");
    }, 1000);
  };

  const subtotal = totalPrice;
  const ppn = Math.round(subtotal * 0.1); // 10% tax
  const finalTotal = subtotal + ppn - discount;

  return (
    <div className="min-h-screen bg-white pt-8 pb-12">
      {/* Header */}
      <div className="bg-white shadow-md py-8 mb-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="font-minecraft text-4xl md:text-5xl text-center">
            Food & Drinks
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 shadow-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-minecraft text-xl text-[#B99733]">
                Personal Information
              </h2>
              <X size={16} className="text-gray-400" />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border border-gray-300 focus:border-[#B99733] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 focus:border-[#B99733] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm mb-1">
                  Username*
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 focus:border-[#B99733] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm mb-1">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 focus:border-[#B99733] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="useLoginInfo"
                  checked={useLoginInfo}
                  onChange={(e) => setUseLoginInfo(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="useLoginInfo" className="text-sm">
                  Use my login information
                </label>
              </div>

              <div className="flex items-start mt-4">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mr-2 mt-1"
                />
                <label htmlFor="agreeTerms" className="text-sm">
                  By ticking, you are confirming that you have read, understood,
                  and agree to our{" "}
                  <a href="/terms" className="text-[#B99733]">
                    Terms & Conditions
                  </a>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="bg-white p-6 shadow-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-minecraft text-xl text-[#B99733]">
                Booking Summary
              </h2>
              <X size={16} className="text-gray-400" />
            </div>

            {/* Order Summary Table */}
            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm">Type</th>
                  <th className="text-left py-2 text-sm">Description</th>
                  <th className="text-center py-2 text-sm">Quantity</th>
                  <th className="text-right py-2 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 text-sm">Food & Drinks</td>
                    <td className="py-2 text-sm">{item.name}</td>
                    <td className="py-2 text-center text-sm">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right text-sm">
                      Rp{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-gray-100">
                  <td colSpan={2} className="py-2 text-sm">
                    PPN 10 %
                  </td>
                  <td colSpan={2} className="py-2 text-right text-sm">
                    Rp{ppn.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="py-2 font-medium">
                    Subtotal
                  </td>
                  <td colSpan={2} className="py-2 text-right font-medium">
                    Rp{subtotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Promo Code */}
            <div className="mb-6">
              <p className="text-sm mb-2">Got any promo code?</p>
              <div className="flex">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-grow p-2 border border-gray-300 focus:border-[#B99733] focus:outline-none"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-[#B99733] text-white px-4 py-2"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-xs mt-1">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-green-500 text-xs mt-1">{promoSuccess}</p>
              )}
              {discount > 0 && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm">Discount</span>
                  <span className="text-sm">
                    -Rp{discount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between py-2 border-t border-gray-200 font-medium">
              <span>Total</span>
              <span>Rp{finalTotal.toLocaleString()}</span>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleCancel}
            className="px-8 py-3 border border-gray-300 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-[#B99733] text-white hover:bg-[#a98723] flex items-center"
          >
            Continue <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

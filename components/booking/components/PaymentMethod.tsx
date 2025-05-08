"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Building,
  ChevronDown,
  ChevronUp,
  Lock,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export type PaymentType = "qris" | "bank";

interface PaymentMethodProps {
  onSelect?: (method: PaymentType) => void;
  className?: string;
}

export default function PaymentMethod({
  onSelect,
  className,
}: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentType>("qris");
  const [expanded, setExpanded] = useState<PaymentType>("bank");
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMethodChange = (value: PaymentType) => {
    setSelectedMethod(value);
    if (value === "bank") {
      setExpanded("bank");
    }
    if (onSelect) {
      onSelect(value);
    }
  };

  const toggleExpand = (method: PaymentType) => {
    if (method === "bank") {
      setExpanded(expanded === method ? ("" as PaymentType) : method);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-semibold text-[#333]">
          Payment Method
        </h3>
        <div className="flex items-center gap-1 text-xs md:text-sm text-green-600">
          <Lock className="h-3 w-3 md:h-4 md:w-4" />
          <span>Secure Payment</span>
        </div>
      </div>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => handleMethodChange(value as PaymentType)}
        className="space-y-3"
      >
        {/* QRIS Payment - Simplified */}
        <div
          className={cn(
            "rounded-lg border border-gray-200 overflow-hidden transition-all duration-300",
            selectedMethod === "qris" ? "shadow-md" : ""
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between p-3 md:p-4 cursor-pointer",
              selectedMethod === "qris" ? "bg-amber-50" : "bg-white"
            )}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <RadioGroupItem
                value="qris"
                id="qris"
                className="text-[#B99733]"
              />
              <Label
                htmlFor="qris"
                className="flex items-center gap-2 md:gap-3 cursor-pointer"
              >
                <QrCode className="h-4 w-4 md:h-5 md:w-5 text-[#B99733]" />
                <span className="font-medium text-sm md:text-base">QRIS</span>
                <span className="ml-1 md:ml-2 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                  Instant
                </span>
              </Label>
            </div>
            <div className="flex items-center">
              <Image
                src="/images/payment/qris.png"
                alt="QRIS"
                width={60}
                height={24}
                className="h-8 w-12 md:h-10 md:w-16"
              />
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div
          className={cn(
            "rounded-lg border border-gray-200 overflow-hidden transition-all duration-300",
            expanded === "bank" ? "shadow-md" : ""
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between p-3 md:p-4 cursor-pointer",
              selectedMethod === "bank" ? "bg-amber-50" : "bg-white"
            )}
            onClick={() => toggleExpand("bank")}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <RadioGroupItem
                value="bank"
                id="bank"
                className="text-[#B99733]"
              />
              <Label
                htmlFor="bank"
                className="flex items-center gap-2 md:gap-3 cursor-pointer"
              >
                <Building className="h-4 w-4 md:h-5 md:w-5 text-[#B99733]" />
                <span className="font-medium text-sm md:text-base">
                  Bank Transfer
                </span>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {!isMobile && (
                <div className="flex gap-1 md:gap-4">
                  <Image
                    src="/images/payment/bca.png"
                    alt="BCA"
                    width={36}
                    height={24}
                    className="h-6 w-6 md:h-8 md:w-8"
                  />
                  <Image
                    src="/images/payment/mandiri.png"
                    alt="Mandiri"
                    width={36}
                    height={24}
                    className="h-5 w-10 md:h-6 md:w-14 -ml-1"
                  />
                  <Image
                    src="/images/payment/visa.png"
                    alt="VISA"
                    width={36}
                    height={24}
                    className="h-5 w-8 md:h-6 md:w-9 -ml-1"
                  />
                </div>
              )}
              {expanded === "bank" ? (
                <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </div>
          </div>

          {expanded === "bank" && (
            <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
              <div className="space-y-3 md:space-y-4">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Transfer the exact amount to one of our bank accounts below.
                  Your booking will be confirmed once the payment is verified.
                </p>

                <div className="space-y-3">
                  {/* BCA Bank */}
                  <div className="rounded-md border border-gray-200 p-2 md:p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/images/payment/bca.png"
                          alt="BCA"
                          width={30}
                          height={24}
                          className="h-5 w-5 md:h-6 md:w-6"
                        />
                        <span className="font-medium text-sm md:text-base">
                          Bank BCA
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 md:h-8 text-xs gap-1 px-2 md:px-3"
                        onClick={() => copyToClipboard("1234567890")}
                      >
                        {copied ? (
                          <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                        ) : (
                          <Copy className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs md:text-sm">
                      <div className="text-muted-foreground">
                        Account Number:
                      </div>
                      <div className="font-medium">1234567890</div>
                      <div className="text-muted-foreground">Account Name:</div>
                      <div className="font-medium">PT Luxury Hotels</div>
                    </div>
                  </div>

                  {/* Mandiri Bank */}
                  <div className="rounded-md border border-gray-200 p-2 md:p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/images/payment/mandiri.png"
                          alt="Mandiri"
                          width={60}
                          height={24}
                          className="h-5 w-12 md:h-6 md:w-16"
                        />
                        <span className="font-medium text-sm md:text-base">
                          Bank Mandiri
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 md:h-8 text-xs gap-1 px-2 md:px-3"
                        onClick={() => copyToClipboard("0987654321")}
                      >
                        {copied ? (
                          <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                        ) : (
                          <Copy className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs md:text-sm">
                      <div className="text-muted-foreground">
                        Account Number:
                      </div>
                      <div className="font-medium">0987654321</div>
                      <div className="text-muted-foreground">Account Name:</div>
                      <div className="font-medium">PT Luxury Hotels</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-amber-50 p-2 md:p-3 text-xs md:text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-[#B99733] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">
                        Payment Amount:{" "}
                        <span className="text-[#B99733]">Rp 1.250.000</span>
                      </p>
                      <p className="text-muted-foreground text-xs md:text-sm">
                        Please transfer the exact amount including the unique
                        code
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </RadioGroup>

      <div className="mt-3 md:mt-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
        <div className="flex gap-1 items-center">
          <Image
            src="/images/payment/qris.png"
            alt="QRIS"
            width={32}
            height={20}
            className="h-6 w-6 md:h-8 md:w-8"
          />
          <Image
            src="/images/payment/bca.png"
            alt="BCA"
            width={32}
            height={20}
            className="h-6 w-6 md:h-8 md:w-8"
          />
          <Image
            src="/images/payment/mandiri.png"
            alt="Mandiri"
            height={20}
            width={32}
            className="h-4 w-10 md:h-5 md:w-14"
          />
          <Image
            src="/images/payment/visa.png"
            alt="VISA"
            height={20}
            width={32}
            className="h-4 w-8 md:h-5 md:w-10 ml-1"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Secure payment processing
        </span>
      </div>
    </div>
  );
}

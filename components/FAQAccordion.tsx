"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FAQItem = {
  question: string;
  answer: string;
};

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openItem, setOpenItem] = useState<number | null>(0); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="border border-[#B99733]/30 rounded-md overflow-hidden transition-all duration-200 hover:border-[#B99733]/70"
          >
            <button
              className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
              onClick={() => toggleItem(index)}
              aria-expanded={openItem === index}
              aria-controls={`faq-content-${index}`}
            >
              <h3 className="font-medium text-base">{item.question}</h3>
              <motion.span
                animate={{ rotate: openItem === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-5 w-5 text-[#B99733]" />
              </motion.span>
            </button>

            <AnimatePresence>
              {openItem === index && (
                <motion.div
                  id={`faq-content-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 overflow-hidden"
                >
                  <motion.div
                    className="border-t border-gray-100 pt-3 pb-4 text-gray-600 leading-relaxed"
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.answer}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

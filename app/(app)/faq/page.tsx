"use client";

import FAQAccordion from "@/components/FAQAccordion";
import { motion, Variants } from "framer-motion";

// Sample FAQ data
const faqItems = [
  {
    question: "Lorem Ipsum?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere et lorem quis commodo. Fusce ut dui nibh. Nunc iaculis finibus purus, pretium rhoncus risus condimentum non. Vivamus feugiat, mauris nec fermentum aliquam, nibh risus hendrerit velit, eget maximus massa diam eget massa.",
  },
  {
    question: "Lorem Ipsum?",
    answer:
      "Nulla facilisi. Sed vitae metus vel enim consequat dictum. Duis at enim a diam fringilla molestie. Donec at magna at lacus feugiat tincidunt. Sed ac metus at elit scelerisque congue in eget dolor.",
  },
  {
    question: "Lorem Ipsum?",
    answer:
      "Aliquam erat volutpat. Proin euismod, velit sit amet tempus tempor, justo elit tincidunt nisi, vitae facilisis enim lectus nec magna. Praesent vel dui vel justo vehicula condimentum.",
  },
  {
    question: "Lorem Ipsum?",
    answer:
      "Cras id tincidunt risus. Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean eu libero vitae eros facilisis varius.",
  },
  {
    question: "Lorem Ipsum?",
    answer:
      "Fusce semper, nisl ut vestibulum semper, risus mi placerat libero, ac scelerisque tortor nibh at risus. Donec id aliquam urna. Vivamus non enim eu augue pharetra consequat.",
  },
  {
    question: "Lorem Ipsum?",
    answer:
      "Praesent vel neque at justo egestas varius. Nulla facilisi. Mauris vel lacus vel tortor pharetra fringilla vel id tellus. Integer et elit non magna elementum blandit.",
  },
  {
    question: "Lorem Ipsum?",
    answer:
      "Vivamus vel magna vel dolor sollicitudin varius. Nulla facilisi. Donec vel ex vel magna porttitor ultricies. Integer et elit non magna elementum blandit.",
  },
  {
    question: "Lorem Ipsum?",
    answer:
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In hac habitasse platea dictumst. Sed vel tellus at nunc egestas tempor vel eu justo.",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const dotsVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const dotVariant: Variants = {
  animate: {
    scale: [1, 1.3, 1],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

export default function FAQPage() {
  return (
    <motion.div
      className="min-h-screen bg-[#fffdf4] py-16 px-4 md:py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Heading with minecraft font */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="font-minecraft text-4xl md:text-5xl lg:text-6xl inline-block mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="text-black">Frequently </span>
            <span className="text-[#B99733]">Asked</span>
          </motion.h1>
          <div className="flex justify-center">
            <motion.h1
              className="font-minecraft text-4xl md:text-5xl lg:text-6xl inline-block mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <span className="text-[#B99733]">Questions</span>
            </motion.h1>
          </div>

          <motion.div
            className="flex justify-center mb-16"
            variants={dotsVariants}
            animate="animate"
          >
            <motion.div
              variants={dotVariant}
              className="w-3 h-3 bg-[#B99733] mx-2 rounded-full"
            ></motion.div>
            <motion.div
              variants={dotVariant}
              className="w-3 h-3 bg-[#B99733] mx-2 rounded-full"
            ></motion.div>
            <motion.div
              variants={dotVariant}
              className="w-3 h-3 bg-[#B99733] mx-2 rounded-full"
            ></motion.div>
          </motion.div>
        </motion.div>

        {/* FAQ Accordion */}
        <FAQAccordion items={faqItems} />

        {/* Contact section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-gray-600 mb-3">Still have questions?</p>
          <motion.a
            href="mailto:support@mge.com"
            className="inline-block bg-[#B99733] text-white px-6 py-3 font-minecraft hover:bg-[#8d7326] transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Contact Us
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}

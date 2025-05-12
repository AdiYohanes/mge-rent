import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export default function FoodItem(props) {
  const { name, price, image, quantity, onAdd, onRemove } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow h-full flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-medium text-base mb-1 truncate">{name}</h3>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-lg font-semibold text-[#B99733]">
            Rp{price.toLocaleString()}
          </p>
          <div className="flex items-center">
            {quantity > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onRemove}
                  className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  <Minus size={14} />
                </motion.button>
                <span className="mx-2 text-base font-medium">{quantity}</span>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAdd}
              className="w-7 h-7 flex items-center justify-center bg-[#B99733] text-white rounded hover:bg-[#A68622] transition-colors"
            >
              <Plus size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

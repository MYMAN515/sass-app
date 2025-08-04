'use client';

import { motion } from 'framer-motion';

const ProductTypeModal = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-xl space-y-6 text-center"
      >
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Select Product Type
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-sm">
          Choose the category that best fits your product image.
        </p>

        <div className="space-y-3">
          <button
            onClick={() =>
              onSelect({
                productType: 'Gourmet Food Product',
                purpose: 'menu display and marketing',
                realism: 'photo-realistic',
                outputQuality: '4K studio-grade',
              })
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition"
          >
            🍔 Food (e.g., Burger, Cake)
          </button>

          <button
            onClick={() =>
              onSelect({
                productType: 'Cosmetic Packaging',
                purpose: 'ecommerce showcase',
                realism: 'marketing-style rendering',
                outputQuality: 'HD ecommerce-ready',
              })
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition"
          >
            💄 Cosmetics (e.g., Cream, Lipstick)
          </button>

          <button
            onClick={() =>
              onSelect({
                productType: 'Electronics Product',
                purpose: 'catalog and online ads',
                realism: 'photo-realistic',
                outputQuality: '4K studio-grade',
              })
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition"
          >
            🖥️ Electronics (e.g., Phone, Speaker)
          </button>

          <button
            onClick={() =>
              onSelect({
                productType: 'Perfume Bottle',
                purpose: 'luxury branding visuals',
                realism: 'artistic stylized',
                outputQuality: 'square - Instagram style',
              })
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition"
          >
            🧴 Perfume & Fragrance
          </button>

          <button
            onClick={() =>
              onSelect({
                productType: 'Home Decor Item',
                purpose: 'interior product promotion',
                realism: 'photo-realistic',
                outputQuality: 'HD ecommerce-ready',
              })
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition"
          >
            🕯️ Home Decor (e.g., Candle, Vase)
          </button>

          <button
            onClick={() =>
              onSelect({
                productType: 'Bottle Product',
                purpose: 'label design showcase',
                realism: 'photo-realistic',
                outputQuality: 'vertical - story format',
              })
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition"
          >
            🧃 Bottles (Juice, Oils, etc.)
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-200 mt-4"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default ProductTypeModal;

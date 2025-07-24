"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "../zustand/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";

function BottomCart() {
  const [items, setCartItems] = useState([]);
  const { getCartItems, getTotalItems } = useCartStore((state) => state);
  const totalItems = getTotalItems();

  useEffect(() => {
    const cartItems = getCartItems();
    setCartItems(cartItems);
  }, [getCartItems]);

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-20"
        >
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-green-500  shadow-xl px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaCartShopping className="text-white h-6 w-6" />
                  <h2 className="text-white font-medium text-sm">
                    Shopping Cart
                  </h2>
                  <span className="bg-white text-green-600 rounded-full px-2 py-1 text-xs font-bold">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>

                <Link
                  href="/cart"
                  className="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BottomCart;
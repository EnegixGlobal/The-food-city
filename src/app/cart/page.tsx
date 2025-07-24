"use client";

import React, { useState, useEffect } from "react";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import Container from "../components/Container";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Button from "../components/Button";
import Link from "next/link";
import { useCartStore } from "../zustand/cartStore";
import Spinner from "../components/Spinner";
import { FaRupeeSign } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";

const CartPage = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get cart data from Zustand store
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getSubtotal,
  } = useCartStore();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    setLoading(false);
  }, []);

  // Sample cart items data (fallback for SSR)
  const cartItems = isHydrated ? cart : [];

  // Calculate totals using store methods or fallback
  const subtotal = isHydrated ? getSubtotal() : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Container */}
      <Container>
        {/* Header */}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="flex-7">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Cart Items List */}
              {loading ? (
                <Spinner className="h-14!" />
              ) : cartItems.length > 0 ? (
                cartItems.map(
                  (item: {
                    id: number;
                    name: string;
                    image: string;
                    price: number;
                    quantity: number;
                    specialInstructions?: string;
                  }) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-100 last:border-0">
                      <div className="flex md:p-6 p-3">
                        {/* Item Image */}
                        <div className="md:mr-4 mr-2 flex-shrink-0">
                          <Image
                            width={150}
                            height={150}
                            src={item.image}
                            alt={item.name}
                            className="md:w-48 md:h-32 h-24 w-36 object-cover rounded-lg"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="w-full px-2">
                          <div className="flex items-start justify-between">
                            <h3 className="md:text-xl font-bold text-gray-800">
                              {item.name}
                            </h3>
                            <button
                              className="text-gray-400 hover:text-red-600 transition"
                              onClick={() => removeFromCart(item.id)}>
                              <FiTrash2 size={18} />
                            </button>
                          </div>

                          <p className="text-red-600 flex items-center justify-start font-bold">
                            <FaRupeeSign />
                            {typeof item.price === "number"
                              ? item.price.toFixed(2)
                              : item.price}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center mt-2">
                            <button
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }>
                              <FiMinus size={16} />
                            </button>
                            <span className="mx-4 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }>
                              <FiPlus size={16} />
                            </button>
                          </div>

                          {/* Special Instructions */}
                          {item.specialInstructions && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">Note:</span>{" "}
                                {item.specialInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center pt-10 h-48 py-6">
                  <p className="text-gray-500">Your cart is empty.</p>
                  <Link href="/">
                    <Button className="mt-4">Continue Shopping</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="flex-3 mb-16 md:mb-0">
            <div className="bg-white rounded-xl shadow-md md:p-6 sticky top-20 p-4">
              <h2 className="md:text-2xl text-xl font-bold text-red-900 mb-6 border-b pb-2">
                Order Summary
              </h2>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6 ">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium flex items-center">
                    <FaRupeeSign />
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-green-500">Free</span>
                </div>

                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="text-gray-600 font-bold text-xl">
                    Grand Total
                  </span>
                  <span className="font-medium flex items-center">
                    <FaRupeeSign />
                    {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

             <div className="flex flex-col items-center ">
               <Link href="/checkout" className="">
                <Button className="flex items-center gap-2"><FaCartShopping /> Place Order</Button>
              </Link>

              <Link href="/">
                <div className="w-full underline text-xl  mt-2 py-3">Continue Shopping</div>
              </Link>
             </div>
              <div className="md:hidden bg-red-900 fixed w-full rounded-t-2xl h-18   bottom-0 left-0 ">
                <div className=" flex items-center justify-between w-full py-5 px-4 shadow-md ">
                  <span className="text-lg flex items-center font-bold text-white">
                    Total
                    <span className="text-xl flex items-center  font-bold text-gray-200 ml-2">
                      <FaRupeeSign className="h-4" />
                      {subtotal.toFixed(2)}
                    </span>
                  </span>
                  <Link href="/checkout">
                    <Button className=" text-red-900 hover:bg-gray-100">
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CartPage;

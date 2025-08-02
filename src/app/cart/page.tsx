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
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    getCartSummary,
  } = useCartStore();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    setLoading(false);
  }, []);

  // Get cart summary
  const cartSummary = isHydrated
    ? getCartSummary()
    : {
        itemCount: 0,
        uniqueItemCount: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
        products: [],
        addons: [],
        isEmpty: true,
      };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Container */}
      <Container>
        {/* Header */}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart</h1>
          <p className="text-gray-600">
            {cartSummary.itemCount}{" "}
            {cartSummary.itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="flex-7">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Cart Items List */}
              {loading ? (
                <Spinner className="h-14!" />
              ) : cartSummary.isEmpty ? (
                <div className="text-center py-16">
                  <FaCartShopping className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add some delicious items to get started!
                  </p>
                  <Link href="/">
                    <Button className="bg-red-900 hover:bg-red-800">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                cart.map((item: any) => (
                  <div
                    key={item.cartItemId}
                    className="border-b border-gray-100 last:border-0">
                    <div className="flex md:p-6 p-3">
                      {/* Item Image */}
                      <div className="md:mr-4 mr-2 flex-shrink-0">
                        <Image
                          width={150}
                          height={150}
                          src={item.imageUrl || "/placeholder-food.svg"}
                          alt={item.title}
                          className="md:w-48 md:h-32 h-24 w-36 object-cover rounded-lg"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="w-full px-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="md:text-xl font-bold text-gray-800">
                              {item.title}
                            </h3>

                            {/* Item Type Badge */}
                            <div className="flex items-center gap-2 mt-1">
                              {item.isVeg && (
                                <span className="text-green-600 text-xs">
                                  🟢 VEG
                                </span>
                              )}
                            </div>



                            {/* Selected Customization */}
                            {item.selectedCustomization && (
                              <div className="mt-2">
                                <div className="text-sm font-medium text-blue-700">Customization:</div>
                                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs inline-block mt-1">
                                  {item.selectedCustomization.value} - ₹{item.selectedCustomization.price}
                                </div>
                              </div>
                            )}

                            {/* Selected Addons */}
                            {item.selectedAddons &&
                              item.selectedAddons.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-sm font-medium text-green-700">
                                    Selected Add-ons:
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedAddons.map((addon: any) => (
                                      <span
                                        key={addon._id}
                                        className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                        {addon.title} (+₹{addon.price})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Price */}
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-red-600 flex items-center font-bold">
                                  <FaRupeeSign />
                                  {item.effectivePrice.toFixed(2)}
                                </span>
                                {item.discountedPrice &&
                                  item.price > item.discountedPrice && (
                                    <span className="text-gray-400 line-through text-sm flex items-center">
                                      <FaRupeeSign />
                                      {item.price.toFixed(2)}
                                    </span>
                                  )}
                                {item.selectedAddons &&
                                  item.selectedAddons.length > 0 && (
                                    <span className="text-green-600 text-sm">
                                      + ₹
                                      {item.selectedAddons.reduce(
                                        (sum: number, addon: any) =>
                                          sum + addon.price,
                                        0
                                      )}{" "}
                                      add-ons
                                    </span>
                                  )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Total: ₹{item.totalPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            {/* Remove Button */}
                            <button
                              className="text-gray-400 hover:text-red-600 transition"
                              onClick={() => removeFromCart(item.cartItemId)}>
                              <FiTrash2 size={18} />
                            </button>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-full">
                              <button
                                onClick={() =>
                                  decrementQuantity(item.cartItemId)
                                }
                                className="p-2 text-gray-600 hover:text-red-900 transition">
                                <FiMinus size={14} />
                              </button>
                              <span className="px-3 py-1 font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  incrementQuantity(item.cartItemId)
                                }
                                className="p-2 text-gray-600 hover:text-red-900 transition">
                                <FiPlus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Items ({cartSummary.uniqueItemCount})
                  </span>
                  <span className="font-medium flex items-center">
                    <FaRupeeSign />
                    {cartSummary.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-green-500">
                    {cartSummary.deliveryFee === 0
                      ? "Free"
                      : `₹${cartSummary.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {cartSummary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -₹{cartSummary.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {cartSummary.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium flex items-center">
                      <FaRupeeSign />
                      {cartSummary.tax.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="text-gray-900 font-bold text-xl">
                    Grand Total
                  </span>
                  <span className="font-bold text-xl flex items-center text-red-600">
                    <FaRupeeSign />
                    {cartSummary.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <Link href="/checkout" className="w-full">
                  <Button
                    className="w-full flex items-center justify-center gap-2 bg-red-900 hover:bg-red-800"
                    disabled={cartSummary.isEmpty}>
                    <FaCartShopping />
                    Place Order
                  </Button>
                </Link>

                <Link href="/">
                  <div className="w-full underline text-lg mt-3 py-2 text-center text-red-900 hover:text-red-700">
                    Continue Shopping
                  </div>
                </Link>
              </div>

              {/* Mobile Bottom Bar */}
              <div className="md:hidden bg-red-900 fixed w-full rounded-t-2xl bottom-0 left-0 z-50">
                <div className="flex items-center justify-between w-full py-4 px-4 shadow-lg">
                  <div className="text-white">
                    <div className="text-sm">Total</div>
                    <div className="text-xl flex items-center font-bold">
                      <FaRupeeSign className="h-4" />
                      {cartSummary.total.toFixed(2)}
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button
                      className="bg-white text-red-900 hover:bg-gray-100"
                      disabled={cartSummary.isEmpty}>
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

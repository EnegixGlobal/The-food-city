"use client";

import React, { useState, useEffect } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import Container from "../components/Container";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Button from "../components/Button";
import Link from "next/link";
import { useCartStore } from "../zustand/cartStore";
import { useAddonStore } from "../zustand/addonStore";
import { useCombinedCartStore } from "../zustand/combinedCartStore";
import Spinner from "../components/Spinner";
import { FaRupeeSign } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";

const CartPage = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get cart data from stores
  const { cart, incrementQuantity, decrementQuantity } =
    useCartStore();

  // Get addon cart data
  const {
    addons,
    incrementAddonQuantity,
    decrementAddonQuantity,
    getTotalAddonPrice
  } = useAddonStore();

  // Get combined cart summary
  const { getCombinedCartSummary, clearAllCarts } = useCombinedCartStore();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    setLoading(false);
  }, []);

  // Get combined cart summary
  const cartSummary = isHydrated
    ? getCombinedCartSummary()
    : {
        products: [],
        productCount: 0,
        productTotal: 0,
        addons: [],
        addonCount: 0,
        addonTotal: 0,
        totalItems: 0,
        totalUniqueItems: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        deliveryFee: 0,
        grandTotal: 0,
        isEmpty: true,
      };

  // Debug logging
  useEffect(() => {
    if (isHydrated) {
      console.log("🛒 Cart Summary Debug:", cartSummary);
      console.log("📊 Addon Total:", cartSummary.addonTotal);
      console.log("🍟 Addons:", addons);
    }
  }, [isHydrated, cartSummary.addonTotal, addons]);

  console.log(getTotalAddonPrice())

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Container */}
      <Container>
        {/* Header */}
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your Cart
              </h1>
              <p className="text-gray-600">
                {cartSummary.totalItems}{" "}
                {cartSummary.totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            {!cartSummary.isEmpty && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear your entire cart?"
                    )
                  ) {
                    try {
                      clearAllCarts();
                    } catch (error) {
                      console.error("Error clearing carts:", error);
                    }
                  }
                }}
                className="text-red-600 hover:text-red-800 underline text-sm">
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="flex-7">
            {/* Product Cart Section */}
            {cart && cart.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🍽️ Food Items
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                      {cart.length}
                    </span>
                  </h2>
                </div>

                {cart.map((item: any) => {

                  return (
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
                          alt={item.title || "Product"}
                          className="md:w-48 md:h-32 h-24 w-36 object-cover rounded-lg"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="w-full px-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="md:text-xl font-bold text-gray-800">
                              {item.title || "Unknown Product"}
                            </h3>

                            {/* Selected Customization */}
                            {item.selectedCustomization && (
                              <div className="mt-1">
                                <div className="bg-gray-100  px-2 py-1 rounded text-xs inline-block">
                                  {item.selectedCustomization.option}
                                </div>
                              </div>
                            )}

                            {/* Price Display */}
                            <div className="mt-2">
                              <span className="text-red-600 flex items-center font-bold">
                                <FaRupeeSign />
                                {(item.totalPrice && item.totalPrice > 0 
                                  ? item.totalPrice 
                                  : (item.selectedCustomization 
                                    ? item.selectedCustomization.price * item.quantity
                                    : (item.effectivePrice || item.price) * item.quantity)
                                )?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-full">
                              <button
                                onClick={() => {
                                  try {
                                    decrementQuantity(item.cartItemId);
                                  } catch (error) {
                                    console.error(
                                      "Error decrementing product quantity:",
                                      error
                                    );
                                  }
                                }}
                                className="p-2 text-gray-600 hover:text-red-900 transition">
                                <FiMinus size={14} />
                              </button>
                              <span className="px-3 py-1 font-medium min-w-[2rem] text-center">
                                {item.quantity || 0}
                              </span>
                              <button
                                onClick={() => {
                                  try {
                                    incrementQuantity(item.cartItemId);
                                  } catch (error) {
                                    console.error(
                                      "Error incrementing product quantity:",
                                      error
                                    );
                                  }
                                }}
                                className="p-2 text-gray-600 hover:text-red-900 transition">
                                <FiPlus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Addon Cart Section */}
            {addons && addons.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🍟 Add-ons
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {addons.length}
                    </span>
                  </h2>
                </div>

                {addons.map((item: any) => (
                  <div
                    key={item.addonCartItemId}
                    className="border-b border-gray-100 last:border-0">
                    <div className="flex md:p-6 p-3">
                      {/* Item Image */}
                      <div className="md:mr-4 mr-2 flex-shrink-0">
                        <Image
                          width={150}
                          height={150}
                          src={item.imageUrl || "/placeholder-food.svg"}
                          alt={item.title || "Addon"}
                          className="md:w-48 md:h-32 h-24 w-36 object-cover rounded-lg"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="w-full px-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="md:text-xl font-bold text-gray-800">
                              {item.title || "Unknown Addon"}
                            </h3>

                            {/* Selected Customization */}
                            {item.selectedCustomization && (
                              <div className="mt-1">
                                <div className="bg-gray-100 px-3 py-2 rounded text-xs inline-block">
                                  {item.selectedCustomization.option}
                                </div>
                              </div>
                            )}

                            {/* Price Display */}
                            <div className="mt-2">
                              <span className="text-red-600 flex items-center font-bold">
                                <FaRupeeSign />
                                {(item.totalPrice && item.totalPrice > 0 
                                  ? item.totalPrice 
                                  : (item.selectedCustomization 
                                    ? item.selectedCustomization.price * item.quantity
                                    : (item.effectivePrice || item.price) * item.quantity)
                                )?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-full">
                              <button
                                onClick={() => {
                                  try {
                                    decrementAddonQuantity(
                                      item.addonCartItemId
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Error decrementing addon quantity:",
                                      error
                                    );
                                  }
                                }}
                                className="p-2 text-gray-600 hover:text-red-900 transition">
                                <FiMinus size={14} />
                              </button>
                              <span className="px-3 py-1 font-medium min-w-[2rem] text-center">
                                {item.quantity || 0}
                              </span>
                              <button
                                onClick={() => {
                                  try {
                                    incrementAddonQuantity(
                                      item.addonCartItemId
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Error incrementing addon quantity:",
                                      error
                                    );
                                  }
                                }}
                                className="p-2 text-gray-600 hover:text-red-900 transition">
                                <FiPlus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty Cart State */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-md p-8">
                <Spinner className="h-14!" />
              </div>
            ) : cartSummary.isEmpty ? (
              <div className="bg-white rounded-xl shadow-md text-center py-16">
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
            ) : null}
          </div>
          {/* Order Summary Section */}
          <div className="flex-3 mb-16 md:mb-0">
            <div className="bg-white rounded-xl shadow-md md:p-6 sticky top-20 p-4">
              <h2 className="md:text-2xl text-xl font-bold text-red-900 mb-6 border-b pb-2">
                Order Summary
              </h2>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                {/* Products Subtotal */}
                {cartSummary.productCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      🍽️ Food Items ({cartSummary.productCount})
                    </span>
                    <span className="font-medium flex items-center">
                      <FaRupeeSign />
                      {cartSummary.productTotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}

                {/* Addons Subtotal */}
                {cartSummary.addonCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      🍟 Add-ons ({cartSummary.addonCount})
                    </span>
                    <span className="font-medium flex items-center">
                      <FaRupeeSign />
                      {cartSummary.addonTotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}

                {/* Subtotal */}
                {(cartSummary.productCount > 0 ||
                  cartSummary.addonCount > 0) && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700 font-medium">
                      Subtotal ({cartSummary.totalUniqueItems} items)
                    </span>
                    <span className="font-bold flex items-center">
                      <FaRupeeSign />
                      {cartSummary.subtotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-green-500">
                    {cartSummary.deliveryFee === 0
                      ? "Free"
                      : `₹${cartSummary.deliveryFee?.toFixed(2) || "0.00"}`}
                  </span>
                </div>
                {cartSummary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -₹{cartSummary.discount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                {cartSummary.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium flex items-center">
                      <FaRupeeSign />
                      {cartSummary.tax?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="text-gray-900 font-bold text-xl">
                    Grand Total
                  </span>
                  <span className="font-bold text-xl flex items-center text-red-600">
                    <FaRupeeSign />
                    {cartSummary.grandTotal?.toFixed(2) || "0.00"}
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
                      {cartSummary.grandTotal?.toFixed(2) || "0.00"}
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

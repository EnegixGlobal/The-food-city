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
  const { cart, incrementQuantity, decrementQuantity } = useCartStore();

  // Get addon cart data
  const {
    addons,
    incrementAddonQuantity,
    decrementAddonQuantity,
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

      console.log(cart)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      {/* Container */}
      <Container>
        {/* Header */}
        <div className="py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                Shopping Cart
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {cartSummary.totalItems}{" "}
                {cartSummary.totalItems === 1 ? "item" : "items"}
              </p>
            </div>
            {!cartSummary.isEmpty && (
              <button
                onClick={() => {
                  if (window.confirm("Clear entire cart?")) {
                    try {
                      clearAllCarts();
                    } catch (error) {
                      console.error("Error clearing carts:", error);
                    }
                  }
                }}
                className="text-red-500 hover:text-red-700 text-xs md:text-sm font-medium transition-colors">
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Cart Items Section */}
          <div className="flex-7">
            {/* Product Cart Section */}
            {cart && cart.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 md:mb-6 border border-gray-100">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 md:px-6 py-3 md:py-4">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    🍽️ Food Items
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs md:text-sm font-medium">
                      {cart.length}
                    </span>
                  </h2>
                </div>

                {cart.map((item: any) => {
                  return (
                    <div
                      key={item.cartItemId}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex p-3 md:p-6">
                        {/* Item Image */}
                        <div className="mr-3 md:mr-4 flex-shrink-0">
                          <Image
                            width={120}
                            height={120}
                            src={item.imageUrl || "/placeholder-food.svg"}
                            alt={item.title || "Product"}
                            className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-xl shadow-sm"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1 pr-2">
                              <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                                {item.title || "Unknown Product"}
                              </h3>

                              {/* Selected Customization */}
                              {item.selectedCustomization && (
                                <div className="mb-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {item.selectedCustomization.option}
                                  </span>
                                </div>
                              )}

                              {/* Price Display */}
                              <div className="mt-auto">
                                <span className="text-red-600 flex items-center font-bold text-sm md:text-base">
                                  <FaRupeeSign className="text-xs md:text-sm" />
                                  {(item.totalPrice && item.totalPrice > 0
                                    ? item.totalPrice
                                    : item.selectedCustomization
                                    ? item.selectedCustomization.price *
                                      item.quantity
                                    : (item.effectivePrice || item.price) *
                                      item.quantity
                                  )?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end justify-between h-full">
                              {/* Quantity Controls */}
                              <div className="flex items-center bg-gray-100 rounded-full border">
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
                                  className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-full hover:bg-red-50">
                                  <FiMinus size={12} />
                                </button>
                                <span className="px-3 py-1 font-bold text-sm min-w-[2rem] text-center">
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
                                  className="p-2 text-gray-600 hover:text-green-600 transition-colors rounded-full hover:bg-green-50">
                                  <FiPlus size={12} />
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
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 md:mb-6 border border-gray-100">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 md:px-6 py-3 md:py-4">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    🍟 Add-ons
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs md:text-sm font-medium">
                      {addons.length}
                    </span>
                  </h2>
                </div>

                {addons.map((item: any) => (
                  <div
                    key={item.addonCartItemId}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex p-3 md:p-6">
                      {/* Item Image */}
                      <div className="mr-3 md:mr-4 flex-shrink-0">
                        <Image
                          width={120}
                          height={120}
                          src={item.imageUrl || "/placeholder-food.svg"}
                          alt={item.title || "Addon"}
                          className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-xl shadow-sm"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between h-full">
                          <div className="flex-1 pr-2">
                            <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                              {item.title || "Unknown Addon"}
                            </h3>

                            {/* Selected Customization */}
                            {item.selectedCustomization && (
                              <div className="mb-2">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {item.selectedCustomization.option}
                                </span>
                              </div>
                            )}

                            {/* Price Display */}
                            <div className="mt-auto">
                              <span className="text-red-600 flex items-center font-bold text-sm md:text-base">
                                <FaRupeeSign className="text-xs md:text-sm" />
                                {(item.totalPrice && item.totalPrice > 0
                                  ? item.totalPrice
                                  : item.selectedCustomization
                                  ? item.selectedCustomization.price *
                                    item.quantity
                                  : (item.effectivePrice || item.price) *
                                    item.quantity
                                )?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between h-full">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-gray-100 rounded-full border">
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
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-full hover:bg-red-50">
                                <FiMinus size={12} />
                              </button>
                              <span className="px-3 py-1 font-bold text-sm min-w-[2rem] text-center">
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
                                className="p-2 text-gray-600 hover:text-green-600 transition-colors rounded-full hover:bg-green-50">
                                <FiPlus size={12} />
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
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <Spinner className="h-14!" />
              </div>
            ) : cartSummary.isEmpty ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-12 md:py-16">
                <div className="mb-6">
                  <FaCartShopping className="mx-auto text-4xl md:text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    Add some delicious items to get started!
                  </p>
                </div>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
          {/* Order Summary Section */}
          <div className="flex-3 mb-16 md:mb-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 sticky top-20">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 pb-2 border-b border-gray-200">
                Order Summary
              </h2>

              {/* Pricing Breakdown */}
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                

                {/* Addons Subtotal */}
                {cartSummary.addonCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-600">
                      🍟 Add-ons ({cartSummary.addonCount})
                    </span>
                    <span className="font-semibold text-sm md:text-base flex items-center">
                      <FaRupeeSign className="text-xs" />
                      {cartSummary.addonTotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}

                {/* Subtotal */}
                {(cartSummary.productCount > 0 ||
                  cartSummary.addonCount > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-700 font-medium">
                      Subtotal
                    </span>
                    <span className="font-bold text-sm md:text-base flex items-center">
                      <FaRupeeSign className="text-xs" />
                      {cartSummary.subtotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}

             

                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-gray-600">
                    Delivery
                  </span>
                  <span className="font-medium text-xs md:text-sm text-green-600">
                    Free
                  </span>
                </div>
                {cartSummary.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-600">
                      Discount
                    </span>
                    <span className="font-medium text-xs md:text-sm text-green-600">
                      -₹{cartSummary.discount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t pt-3 mt-3 bg-gray-50 -mx-4 md:-mx-6 px-4 md:px-6 py-3 rounded-b-2xl">
                  <span className="text-gray-900 font-bold text-base md:text-xl">
                    Grand Total
                  </span>
                  <span className="font-bold text-lg md:text-2xl flex items-center text-red-600">
                    <FaRupeeSign className="text-sm md:text-lg" />
                    {cartSummary.grandTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/checkout" className="w-full block">
                  <Button
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 md:py-4 rounded-xl shadow-lg font-semibold text-sm md:text-base"
                    disabled={cartSummary.isEmpty}>
                    <FaCartShopping />
                    Place Order
                  </Button>
                </Link>

                <Link href="/" className="block">
                  <div className="w-full text-center py-2 md:py-3 text-sm md:text-base text-red-600 hover:text-red-700 font-medium">
                    Continue Shopping
                  </div>
                </Link>
              </div>

              {/* Mobile Bottom Bar */}
              <div className="md:hidden bg-gradient-to-r from-red-500 to-red-600 fixed w-full bottom-0 left-0 z-50 shadow-2xl">
                <div className="flex items-center justify-between w-full py-3 px-4">
                  <div className="text-white">
                    <div className="text-xs opacity-90">Total</div>
                    <div className="text-lg flex items-center font-bold">
                      <FaRupeeSign className="text-sm" />
                      {cartSummary.grandTotal?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button
                      className="bg-white text-red-600 hover:bg-gray-100 px-6 py-2 text-sm font-semibold rounded-lg shadow-lg"
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

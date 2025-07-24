"use client";

import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus, FaUser, FaRupeeSign } from "react-icons/fa";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiArrowRight,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import Input from "../components/Input";
import Container from "../components/Container";
import Image from "next/image";
import Button from "../components/Button";
import { useCartStore } from "../zustand/cartStore";

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

const CheckoutPage = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Get cart data from Zustand store
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getTotalWithTaxAndDelivery,
  } = useCartStore();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use real cart data after hydration
  const cartItems = isHydrated ? cart : [];

  // Form states
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    instructions: "",
    flatNumber: "",
    Landmark: "",
  });
  const [showAddressSidebar, setShowAddressSidebar] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Login, 2: Address, 3: Payment

  // Calculate totals using cart store functions
  const subtotal = isHydrated ? getSubtotal() : 0;

  // Handle quantity changes using cart store
  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1 || !isHydrated) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: number) => {
    if (isHydrated) {
      removeFromCart(id);
    }
  };

  // Handle address input change
  const handleAddressChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for button click
  const handleSubmit = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      // Process payment and place order
      alert("Order placed successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 ">
      <header className="bg-white shadow-md">
        <Container className="py-2! flex justify-between items-center">
          <div>
            <Image
              src="/logo.png"
              alt="Secure Checkout"
              width={60}
              height={60}
              className="inline-block -rotate-12 mr-3"
            />
            <span className="text-2xl font-bold text-gray-900 mb-8">
              Secure Checkout
            </span>
          </div>
          <div className="hover:text-yellow-500">
            <FaUser className="text-2xl  inline-block mr-2" />
            <span className="font-bold">Rajiv</span>
          </div>
        </Container>
      </header>
      <Container className="py-6!">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:w-2/3">
            <div className="bg-white  shadow-sm p-6 mb-6">
              {/* Progress Steps */}
              <div className="flex justify-between mb-8">
                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 1 ? "text-red-900" : "text-gray-400"
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeStep >= 1 ? "bg-red-100" : "bg-gray-100"
                    }`}>
                    <FiUser className="text-lg" />
                  </div>
                  <span className="mt-2 text-sm font-bold">Login</span>
                </div>
                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 2 ? "text-red-900" : "text-gray-400"
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeStep >= 2 ? "bg-red-100" : "bg-gray-100"
                    }`}>
                    <FiMapPin className="text-lg" />
                  </div>
                  <span className="mt-2 text-sm font-bold">Address</span>
                </div>
                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 3 ? "text-red-900" : "text-gray-400"
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeStep >= 3 ? "bg-red-100" : "bg-gray-100"
                    }`}>
                    <FiCreditCard className="text-lg" />
                  </div>
                  <span className="mt-2 text-sm font-bold">Payment</span>
                </div>
              </div>

              {/* Step 1: Login */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Enter your phone number
                  </h2>
                  <p className="text-gray-600">
                    We&apos;ll send you an OTP to verify your number
                  </p>
                  <div className="relative mt-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300  "
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delivery Address
                  </h2>
                  <Button
                    onClick={() => setShowAddressSidebar(true)}
                    className="w-full py-3! px-4 border bg-white! border-gray-300 rounded-none text-left flex justify-between items-center ">
                    <span className="text-gray-700">
                      {address.street
                        ? `${address.street}, ${address.city}`
                        : "Add delivery address"}
                    </span>
                    <FiArrowRight className="text-gray-500" />
                  </Button>
                </div>
              )}

              {/* Step 3: Payment */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Choose Payment Method
                  </h2>

                  <Button className="py-3! w-full rounded-none bg-[#1ba672]! text-white">
                    Proceed to Pay
                  </Button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {activeStep > 1 && (
                  <Button
                    onClick={() => setActiveStep(activeStep - 1)}
                    className="px-6 py-3 border bg-white! border-gray-300 rounded-none  text-gray-700 font-medium hover:bg-gray-50">
                    Back
                  </Button>
                )}
                {activeStep !== 3 && (
                  <Button
                    onClick={handleSubmit}
                    className={`ml-auto px-6 py-3 rounded-none font-medium ${
                      activeStep < 3
                        ? "bg-red-900! text-white hover:bg-red-800"
                        : "bg-red-900! text-white hover:bg-red-800"
                    }`}>
                    {activeStep < 3 ? "Continue" : "Place Order"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white  shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Your cart is empty
                  </div>
                ) : (
                  cartItems.map((item: CartItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <FaRupeeSign size={12} className="mr-1" />
                            {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex p-1 items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 text-gray-600 hover:text-red-900">
                            <FaMinus size={14} />
                          </button>
                          <span className="px-2 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 text-gray-600 hover:text-red-900">
                            <FaPlus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:text-red-700">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="flex items-center">
                    <FaRupeeSign size={12} className="mr-1" />
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="flex items-center text-green-500">
                    Free
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2">
                  <span>Total</span>
                  <span className="flex items-center">
                    <FaRupeeSign size={14} className="mr-1" />
                    {isHydrated ? getTotalWithTaxAndDelivery().toFixed(2) : subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Address Sidebar */}
      {showAddressSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/75 transition-opacity"
              onClick={() => setShowAddressSidebar(false)}></div>
            <div className="fixed inset-y-0 left-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        Add Delivery Address
                      </h2>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setShowAddressSidebar(false)}>
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter your street address"
                          value={address.street}
                          onChange={handleAddressChange}
                          className="block w-full px-4 py-3 font-thin "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Door/Flat no.
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter your door/flat number"
                          value={address.flatNumber}
                          onChange={handleAddressChange}
                          className="block w-full px-4 py-3 font-thin "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Landmark (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter your landmark"
                          value={address.Landmark}
                          onChange={handleAddressChange}
                          className="block w-full px-4 py-3 font-thin "
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <Button
                      onClick={() => {
                        setShowAddressSidebar(false);
                        setActiveStep(3);
                      }}
                      className="w-full py-3 rounded-none!">
                      Save Address
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

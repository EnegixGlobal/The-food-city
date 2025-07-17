import React from "react";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import Container from "../components/Container";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Button from "../components/Button";
import Link from "next/link";

const CartPage = () => {
  // Sample cart items data
  const cartItems = [
    {
      id: 1,
      name: "Paneer Tikka Pizza",
      price: 12.99,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      specialInstructions: "Extra cheese, no onions",
    },
    {
      id: 2,
      name: "Butter Chicken",
      price: 14.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      specialInstructions: "Medium spicy",
    },
  ];

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const deliveryFee = 2.99;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Container */}
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-900 mb-2">Your Cart</h1>
          <p className="text-lg text-gray-600">
            Review your delicious selections
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="flex-7">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Cart Items List */}
              {cartItems.map((item) => (
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
                        className="w-full h-20 md:h-36 object-cover rounded-lg"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="w-full px-2">
                      <div className="flex items-start justify-between">
                        <h3 className="md:text-xl font-bold text-gray-800">
                          {item.name}
                        </h3>
                        <button className="text-gray-400 hover:text-red-600 transition">
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <p className="text-red-600 font-bold">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2">
                        <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                          <FiMinus size={16} />
                        </button>
                        <span className="mx-4 font-medium">
                          {item.quantity}
                        </span>
                        <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition">
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
              ))}

              {/* Empty Cart State (if needed) */}
              {cartItems.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <button className="mt-4 bg-red-900 hover:bg-red-800 text-white px-6 py-2 rounded-full font-medium transition">
                    Browse Menu
                  </button>
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
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="text-gray-600 font-bold text-xl">
                    Grand Total
                  </span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-between w-full p-4 bg-red-900 text-white rounded-lg shadow-md">
                <span className="text-lg font-bold">
                  Total
                  <span className="text-lg font-bold ml-2 text-gray-300">
                    {" "}
                    ${total.toFixed(2)}
                  </span>
                </span>
                <Link href="/checkout">
                  <Button className="">Checkout</Button>
                </Link>
              </div>
              {/* Checkout Button */}
              {/* Continue Shopping */}
              <Link href="/" >
              <Button className="w-full mt-4 py-3">
                Continue Shopping
              </Button>
              </Link>
              <div className="md:hidden bg-red-900 fixed w-full rounded-t-2xl h-18   bottom-0 left-0 ">
                <div className=" flex items-center justify-between w-full py-5 px-4 shadow-md ">
                  <span className="text-lg font-bold text-white">
                    Total
                    <span className="text-xl font-bold text-gray-200 ml-2">
                      ${total.toFixed(2)}
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

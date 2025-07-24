"use client";

import React, { useState } from "react";
import { FaRupeeSign, FaRegEdit, FaStar, FaPlus } from "react-icons/fa";
import { FiCheckCircle, FiTruck, FiXCircle } from "react-icons/fi";

const UserProfilePage = () => {
  const [activeTab] = useState("orders");
  const [userData] = useState({
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    address: "12, MG Road, Bangalore - 560001",
    joinedDate: "15 March 2022",
    loyaltyPoints: 1250,
  });

  // Sample orders data
  const orders = [
    {
      id: "#ORD-7894",
      date: "12 Nov 2023",
      items: 3,
      amount: 549,
      status: "Delivered",
      rating: 4,
    },
    {
      id: "#ORD-7893",
      date: "5 Nov 2023",
      items: 5,
      amount: 892,
      status: "Delivered",
      rating: 5,
    },
    {
      id: "#ORD-7892",
      date: "28 Oct 2023",
      items: 2,
      amount: 325,
      status: "Cancelled",
      rating: null,
    },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
            <FiCheckCircle className="mr-1" /> {status}
          </span>
        );
      case "On the way":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
            <FiTruck className="mr-1" /> {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center">
            <FiXCircle className="mr-1" /> {status}
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  const renderStars = (rating: number | null) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${
              rating !== null && star <= rating
                ? "text-yellow-400"
                : "text-gray-300"
            } text-sm`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="">
        {/* Profile Header */}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {activeTab === "orders" ? (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order History
              </h2>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-2 md:mb-0">
                          <h3 className="font-medium text-gray-900">
                            {order.id}
                          </h3>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Items:</span>{" "}
                            {order.items}
                          </div>
                          <div className="text-sm font-medium flex items-center">
                            <FaRupeeSign className="mr-1" size={12} />
                            {order.amount}
                          </div>
                          <div>{statusBadge(order.status)}</div>
                        </div>
                      </div>

                      {order.rating && (
                        <div className="mt-3 flex items-center">
                          <span className="text-sm text-gray-500 mr-2">
                            Your rating:
                          </span>
                          {renderStars(order.rating)}
                        </div>
                      )}

                      <div className="mt-3 flex space-x-3">
                        <button className="text-sm text-red-900 hover:text-red-700">
                          Reorder
                        </button>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          View Details
                        </button>
                        {order.status === "Delivered" && !order.rating && (
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            Rate Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    You haven&apos;t placed any orders yet
                  </p>
                  <button className="mt-4 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800">
                    Order Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userData.phone}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Address Book
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Home Address
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {userData.address}
                        </p>
                      </div>
                      <button className="text-red-900 hover:text-red-700">
                        <FaRegEdit />
                      </button>
                    </div>
                  </div>
                  <button className="mt-4 text-sm text-red-900 hover:text-red-700 flex items-center">
                    <FaPlus className="mr-1" /> Add New Address
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Security
                  </h3>
                  <div className="space-y-4">
                    <button className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-left">
                      Change Password
                    </button>
                    <button className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-left">
                      Two-Factor Authentication
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;

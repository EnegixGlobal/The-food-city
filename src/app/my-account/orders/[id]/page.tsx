"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";

interface OrderItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedCustomization?: {
    option: string;
    price: number;
  };
}

interface Addon {
  addOnId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedCustomization?: {
    option: string;
    price: number;
  };
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}

interface TrackingInfo {
  orderPlaced: {
    status: string;
    timestamp: string;
  };
  confirmed?: {
    status: string;
    timestamp: string;
  };
  preparing?: {
    status: string;
    timestamp: string;
  };
  outForDelivery?: {
    status: string;
    timestamp: string;
    deliveryPersonName?: string;
    deliveryPersonPhone?: string;
  };
  delivered?: {
    status: string;
    timestamp: string;
    deliveredBy?: string;
  };
}

interface OrderDetails {
  _id: string;
  orderId: string;
  items: OrderItem[];
  addons: Addon[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  onlineDiscount: number;
  tax: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  orderDate: string;
  trackingInfo: TrackingInfo;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentCompletedAt?: string;
  cancellationReason?: string;
}


const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const trackingSteps = [
  { key: "orderPlaced", label: "Order Placed", icon: "📝" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "outForDelivery", label: "Out for Delivery", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/order/${orderId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();

        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || "Failed to fetch order details");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-none shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-none shadow-sm p-6">
            <div className="text-center">
              <div className="text-red-600 text-lg font-medium mb-2">Error</div>
              <p className="text-gray-600 mb-4">{error || "Order not found"}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-colors">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = trackingSteps.findIndex(
    (step) =>
      step.key === order.status ||
      (step.key === "outForDelivery" && order.status === "out_for_delivery")
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-none transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  #{order.orderId}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                ₹{order.totalAmount}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                {format(new Date(order.orderDate), "MMM dd, yyyy • hh:mm a")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* <span
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                order.status
              )}`}>
              {order.status.replace("_", " ").toUpperCase()}
            </span> */}
            <span
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border ${getPaymentStatusColor(
                order.paymentStatus
              )}`}>
              Payment: {order.paymentStatus.toUpperCase()}
            </span>
            <span className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
              {order.paymentMethod.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Order Tracking */}
        <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Order Tracking
          </h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
            <div
              className="absolute left-6 top-8 w-0.5 bg-orange-500 transition-all duration-500"
              style={{
                height: `${
                  (currentStatusIndex / (trackingSteps.length - 1)) * 100
                }%`,
              }}></div>

            {/* Tracking Steps */}
            <div className="space-y-6">
              {trackingSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const trackingData =
                  order.trackingInfo[step.key as keyof TrackingInfo];

                return (
                  <div
                    key={step.key}
                    className="relative flex items-start space-x-4">
                    {/* Step Icon */}
                    <div
                      className={`
                      relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 text-lg
                      ${
                        isCompleted
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }
                      ${isCurrent ? "ring-4 ring-orange-100" : ""}
                    `}>
                      {step.icon}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 pb-8">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? "text-gray-900" : "text-gray-500"
                          }`}>
                          {step.label}
                        </p>
                        {trackingData && (
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(trackingData.timestamp),
                              "MMM dd, hh:mm a"
                            )}
                          </p>
                        )}
                      </div>
                      {trackingData && (
                        <p
                          className={`text-sm mt-1 ${
                            isCompleted ? "text-gray-600" : "text-gray-400"
                          }`}>
                          {trackingData.status}
                        </p>
                      )}
                      {step.key === "outForDelivery" &&
                        order.trackingInfo.outForDelivery && (
                          <div className="mt-2 text-sm text-gray-600">
                            {order.trackingInfo.outForDelivery
                              .deliveryPersonName && (
                              <p>
                                Delivery Person:{" "}
                                {
                                  order.trackingInfo.outForDelivery
                                    .deliveryPersonName
                                }
                              </p>
                            )}
                            {order.trackingInfo.outForDelivery
                              .deliveryPersonPhone && (
                              <p>
                                Contact:{" "}
                                {
                                  order.trackingInfo.outForDelivery
                                    .deliveryPersonPhone
                                }
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 bg-white rounded-none shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border border-gray-100 rounded-none">
                  <div className="w-16 h-16 relative rounded-none overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    {item.selectedCustomization && (
                      <p className="text-sm text-blue-600 font-medium">
                        {item.selectedCustomization.option}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-orange-600">
                      ₹{item.price} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add-ons */}
              {order.addons.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Add-ons</h3>
                  {order.addons.map((addon, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {addon.name}
                        </p>
                        {addon.selectedCustomization && (
                          <p className="text-xs text-blue-600 font-medium">
                            {addon.selectedCustomization.option}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Qty: {addon.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{addon.price * addon.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Customer Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{order.subtotal}</span>
                </div>
                {order.deliveryCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="text-gray-900">
                      ₹{order.deliveryCharge}
                    </span>
                  </div>
                )}
                {order.onlineDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">
                      -₹{order.onlineDiscount}
                    </span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">₹{order.tax}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-sm text-gray-600">
                    {order.customerInfo.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-600">
                    {order.customerInfo.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-sm text-gray-600">
                    {order.customerInfo.address}
                  </p>
                </div>
                {order.customerInfo.pincode && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pincode</p>
                    <p className="text-sm text-gray-600">
                      {order.customerInfo.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            {(order.razorpayPaymentId || order.paymentCompletedAt) && (
              <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="space-y-3">
                  {order.razorpayPaymentId && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Payment ID
                      </p>
                      <p className="text-sm text-gray-600 font-mono">
                        {order.razorpayPaymentId}
                      </p>
                    </div>
                  )}
                  {order.paymentCompletedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Payment Completed
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(
                          new Date(order.paymentCompletedAt),
                          "MMM dd, yyyy • hh:mm a"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import ReviewModal from "../components/ReviewModal";

// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderItem {
  productId: any;
  _id: any;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Addon {
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

interface TrackingInfo {
  orderPlaced: {
    status: string;
    timestamp: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  addons: Addon[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  onlineDiscount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  orderDate: string;
  trackingInfo: TrackingInfo;
}

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );

  // Review Modal States
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    productId: "",
    productTitle: "",
    productImage: "",
  });

  // Handle opening review modal
  const openReviewModal = (
    productId: string,
    productTitle: string,
    productImage: string
  ) => {
    setReviewModal({
      isOpen: true,
      productId,
      productTitle,
      productImage,
    });
  };

  // Handle closing review modal
  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      productId: "",
      productTitle: "",
      productImage: "",
    });
  };

  console.log(orders);

  // Handle review submitted
  const handleReviewSubmitted = () => {
    // You could refresh orders or show a success message here
    console.log("Review submitted successfully!");
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const router = useRouter();

  const fetchOrders = async (page: number = 1, status: string = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(status && { status }),
      });

      const response = await fetch(`/api/order?${queryParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setCurrentPage(data.data.currentPage);
        setTotalPages(data.data.totalPages);
      } else {
        setError(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedStatus);
  }, [currentPage, selectedStatus]);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Process payment for pending order
  const processPayment = async (order: Order) => {
    try {
      setProcessingPayment(order._id);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please try again.");
        return;
      }

      // Create payment order
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: order.orderId }),
      });

      const paymentData = await response.json();
      if (!response.ok || !paymentData.success) {
        throw new Error(paymentData.message || "Failed to create payment");
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.data.amount,
        currency: paymentData.data.currency,
        name: "The Food City",
        description: `Payment for Order #${order.orderId}`,
        order_id: paymentData.data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.orderId,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok && verifyData.success) {
              alert("Payment successful! Your order has been confirmed.");
              // Refresh orders to show updated payment status
              fetchOrders(currentPage, selectedStatus);
            } else {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setProcessingPayment(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(null);
          },
        },
        theme: {
          color: "#f97316", // orange-500
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment processing error:", error);
      alert(
        error instanceof Error ? error.message : "Payment processing failed"
      );
      setProcessingPayment(null);
    }
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/my-account/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-none shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-4 mb-4">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-none shadow-sm p-6">
            <div className="text-center">
              <div className="text-red-600 text-lg font-medium mb-2">Error</div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => fetchOrders(currentPage, selectedStatus)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-colors">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-none shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            My Orders
          </h1>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
            <button
              onClick={() => handleStatusFilter("")}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                selectedStatus === ""
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              All Orders
            </button>
            {[
              "pending",
              "confirmed",
              "preparing",
              "out_for_delivery",
              "delivered",
            ].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors capitalize ${
                  selectedStatus === status
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-none shadow-sm p-6 sm:p-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Orders Found
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedStatus
                  ? `No ${selectedStatus} orders found.`
                  : "You haven't placed any orders yet."}
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-colors">
                Start Ordering
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleOrderClick(order._id)}
                className="bg-white rounded-none shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200 group">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        #{order.orderId}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {format(
                          new Date(order.orderDate),
                          "MMM dd, yyyy • hh:mm a"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                      {/* Payment Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}>
                        {order.paymentStatus.toUpperCase()}
                      </span>

                      {/* Payment Method Badge */}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.paymentMethod === "online"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}>
                          {order.paymentMethod === "online" ? "ONLINE" : "COD"}
                        </span>
                      </div>
                    </div>

                    {/* Right side - Payment Status and Amount */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          ₹{order.totalAmount}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items.length + order.addons.length} item
                          {order.items.length + order.addons.length > 1
                            ? "s"
                            : ""}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-400 transition-colors">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-start space-x-4">
                    {/* First Item Image */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-none overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 group-hover:shadow-md transition-shadow">
                      {order.items[0]?.imageUrl ? (
                        <Image
                          src={order.items[0].imageUrl}
                          alt={order.items[0].title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Items Summary */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <p className="text-base font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          {order.items[0]?.title}
                        </p>
                        {order.items.length > 1 && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              +{order.items.length - 1} more item
                              {order.items.length > 2 ? "s" : ""}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-medium">
                            {order.customerInfo.name}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="line-clamp-2">
                            {order.customerInfo.address}
                          </span>
                        </div>
                      </div>

                      {/* Pay Online Button */}
                      {order.paymentStatus === "pending" && (
                        <div className="mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              processPayment(order);
                            }}
                            disabled={processingPayment === order._id}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-none hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm hover:shadow-md">
                            {processingPayment === order._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                  />
                                </svg>
                                Pay Online
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Review Buttons for Items */}
                      {order.status === "delivered" &&
                        order.items.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs text-gray-500 mb-2">
                              📝 Write reviews for your items:
                            </div>

                            {order.items.map((item, itemIndex) => (
                              <button
                                key={itemIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Use a more reliable product ID
                                  const productId = item.productId;
                                  openReviewModal(
                                    productId,
                                    item.title,
                                    item.imageUrl
                                  );
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-none hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                                </svg>
                                Write Review for{" "}
                                {item.title.length > 12
                                  ? item.title.substring(0, 12) + "..."
                                  : item.title}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Add-ons Summary */}
                  {order.addons.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-4 h-4 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          Add-ons
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {order.addons.map((addon, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-200">
                            {addon.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-none shadow-sm p-3 sm:p-4 mt-4 sm:mt-6">
            <div className="flex justify-center items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 rounded-none border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                Previous
              </button>

              <div className="flex space-x-0.5 sm:space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 sm:px-3 py-2 rounded-none text-xs sm:text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 rounded-none border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                Next
              </button>
            </div>

            {/* Pagination Info */}
            <div className="text-center mt-3 text-sm text-gray-600">
              Showing page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        productId={reviewModal.productId}
        productTitle={reviewModal.productTitle}
        productImage={reviewModal.productImage}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}

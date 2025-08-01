"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

// Types
interface OrderItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface OrderAddOn {
  addOnId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}

interface TrackingInfo {
  orderPlaced: {
    timestamp: string;
    status: string;
  };
  confirmed?: {
    timestamp: string;
    status: string;
  };
  preparing?: {
    timestamp: string;
    status: string;
  };
  outForDelivery?: {
    timestamp: string;
    status: string;
    deliveryPersonName?: string;
    deliveryPersonPhone?: string;
  };
  delivered?: {
    timestamp: string;
    status: string;
    deliveredBy?: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
  addons: OrderAddOn[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  onlineDiscount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "online" | "cod";
  orderDate: string;
  trackingInfo: TrackingInfo;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const statusOptions = [
    { value: "", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 border border-blue-300",
    preparing: "bg-orange-100 text-orange-800 border border-orange-300",
    out_for_delivery: "bg-purple-100 text-purple-800 border border-purple-300",
    delivered: "bg-green-100 text-green-800 border border-green-300",
    cancelled: "bg-red-100 text-red-800 border border-red-300",
  };

  const paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    paid: "bg-green-100 text-green-800 border border-green-300",
    failed: "bg-red-100 text-red-800 border border-red-300",
    refunded: "bg-gray-100 text-gray-800 border border-gray-300",
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.totalPages);
        setTotalCount(data.data.totalCount);
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      if (data.success) {
        // Update the order in the list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus as Order["status"] }
              : order
          )
        );

        // Update selected order if it's the same
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus as Order["status"] } : null
          );
        }
      } else {
        throw new Error(data.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      if (data.success) {
        // Remove the order from the list
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );

        // Close details modal if it was the deleted order
        if (selectedOrder && selectedOrder._id === orderId) {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }

        // Update total count
        setTotalCount((prev) => prev - 1);
      } else {
        throw new Error(data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  // View order details
  const viewOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order details");
      }

      if (data.success) {
        setSelectedOrder(data.data);
        setShowOrderDetails(true);
      } else {
        throw new Error(data.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch order details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  // Handle filter change
  const handleFilterChange = (newStatusFilter: string) => {
    setStatusFilter(newStatusFilter);
    setCurrentPage(1);
  };

  // Effects
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Orders Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all customer orders
              </p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 hover:bg-red-700 disabled:opacity-50">
              <FiRefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900">
                Total Orders
              </h3>
              <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
            </div>
            <div className="bg-green-50 p-4 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900">
                Delivered
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter((order) => order.status === "delivered").length}
              </p>
            </div>
            <div className="bg-orange-50 p-4 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900">
                Processing
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {
                  orders.filter((order) =>
                    ["confirmed", "preparing", "out_for_delivery"].includes(
                      order.status
                    )
                  ).length
                }
              </p>
            </div>
            <div className="bg-red-50 p-4 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900">Cancelled</h3>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter((order) => order.status === "cancelled").length}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Orders Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <>
              {/* Order Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            #{order.orderId}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <div className="flex flex-col gap-1 mt-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold ${
                                statusColors[order.status]
                              }`}>
                              {order.status.replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold ${
                                paymentStatusColors[order.paymentStatus]
                              }`}>
                              {order.paymentStatus} •{" "}
                              {order.paymentMethod.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-lg">
                          {order.customerInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.customerInfo.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.customerInfo.phone}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 text-sm text-gray-700">
                        <p className="font-medium mb-1">Delivery Address:</p>
                        <p>{order.customerInfo.address}</p>
                        <p>Pincode: {order.customerInfo.pincode}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Order Items ({order.items.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-gray-50 p-2">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover bg-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">
                                  No Image
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                Qty: {item.quantity} ×{" "}
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-center py-2 text-sm text-gray-500 bg-gray-50">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                        {order.addons.length > 0 && (
                          <div className="text-center py-2 text-sm text-blue-600 bg-blue-50">
                            +{order.addons.length} add-ons included
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Update Actions */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update Status:
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateOrderStatus(order._id, "preparing")
                              }
                              disabled={
                                updatingStatus || order.status === "preparing"
                              }
                              className={`flex-1 px-3 py-2 text-xs font-medium border transition-colors ${
                                order.status === "preparing"
                                  ? "bg-orange-100 border-orange-300 text-orange-800 cursor-not-allowed"
                                  : "bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
                              } ${
                                updatingStatus
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}>
                              {order.status === "preparing"
                                ? "✓ Preparing"
                                : "Preparing"}
                            </button>
                            <button
                              onClick={() =>
                                updateOrderStatus(order._id, "out_for_delivery")
                              }
                              disabled={
                                updatingStatus ||
                                order.status === "out_for_delivery"
                              }
                              className={`flex-1 px-3 py-2 text-xs font-medium border transition-colors ${
                                order.status === "out_for_delivery"
                                  ? "bg-purple-100 border-purple-300 text-purple-800 cursor-not-allowed"
                                  : "bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
                              } ${
                                updatingStatus
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}>
                              {order.status === "out_for_delivery"
                                ? "✓ Out for Delivery"
                                : "Out for Delivery"}
                            </button>
                            <button
                              onClick={() =>
                                updateOrderStatus(order._id, "delivered")
                              }
                              disabled={
                                updatingStatus || order.status === "delivered"
                              }
                              className={`flex-1 px-3 py-2 text-xs font-medium border transition-colors ${
                                order.status === "delivered"
                                  ? "bg-green-100 border-green-300 text-green-800 cursor-not-allowed"
                                  : "bg-white border-green-300 text-green-700 hover:bg-green-50"
                              } ${
                                updatingStatus
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}>
                              {order.status === "delivered"
                                ? "✓ Delivered"
                                : "Delivered"}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => viewOrderDetails(order._id)}
                            className="flex-1 bg-red-800 text-white px-4 py-2 text-sm font-medium hover:bg-red-900 transition-colors flex items-center justify-center gap-2">
                            <FiEye className="w-4 h-4" />
                            View Full Details
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="bg-red-600 text-white px-3 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                            title="Delete Order">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-white border border-gray-200 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * limit, totalCount)}
                        </span>{" "}
                        of <span className="font-medium">{totalCount}</span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex shadow-sm -space-x-px"
                        aria-label="Pagination">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                          <FiChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
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
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}>
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details - {selectedOrder.orderId}
                </h2>
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Order Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Order ID:</span>{" "}
                        {selectedOrder.orderId}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(selectedOrder.orderDate)}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold ${
                            statusColors[selectedOrder.status]
                          }`}>
                          {selectedOrder.status.replace("_", " ")}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Payment:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold ${
                            paymentStatusColors[selectedOrder.paymentStatus]
                          }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Payment Method:</span>{" "}
                        {selectedOrder.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedOrder.customerInfo.name}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedOrder.customerInfo.phone}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedOrder.customerInfo.address}
                      </p>
                      <p>
                        <span className="font-medium">Pincode:</span>{" "}
                        {selectedOrder.customerInfo.pincode}
                      </p>
                      {selectedOrder.userId && (
                        <>
                          <p>
                            <span className="font-medium">User Email:</span>{" "}
                            {selectedOrder.userId.email}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Items
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {item.imageUrl && (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-cover mr-3 bg-gray-200"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {item.slug}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add-ons */}
                {selectedOrder.addons.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Add-ons
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Add-on
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrder.addons.map((addon, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {addon.image && (
                                    <Image
                                      width={40}
                                      height={40}
                                      src={addon.image}
                                      alt={addon.name}
                                      className="w-10 h-10 object-cover mr-3 bg-gray-200"
                                    />
                                  )}
                                  <p className="text-sm font-medium text-gray-900">
                                    {addon.name}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {formatCurrency(addon.price)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {addon.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {formatCurrency(addon.price * addon.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Order Total */}
                <div className="bg-gray-50 p-4 border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <span>
                        {formatCurrency(selectedOrder.deliveryCharge)}
                      </span>
                    </div>
                    {selectedOrder.onlineDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Online Discount:</span>
                        <span>
                          -{formatCurrency(selectedOrder.onlineDiscount)}
                        </span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Tracking
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedOrder.trackingInfo).map(
                      ([key, value]) => {
                        if (
                          value &&
                          typeof value === "object" &&
                          "timestamp" in value
                        ) {
                          return (
                            <div key={key} className="flex items-start">
                              <div className="flex-shrink-0 w-3 h-3 bg-blue-600 mt-2 mr-4"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {value.status}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(value.timestamp)}
                                </p>
                                {key === "outForDelivery" &&
                                  value.deliveryPersonName && (
                                    <p className="text-xs text-gray-500">
                                      Delivery Person:{" "}
                                      {value.deliveryPersonName} (
                                      {value.deliveryPersonPhone})
                                    </p>
                                  )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Update Order Status
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder._id, "preparing")
                      }
                      disabled={
                        updatingStatus || selectedOrder.status === "preparing"
                      }
                      className={`px-4 py-2 text-sm font-medium border transition-colors ${
                        selectedOrder.status === "preparing"
                          ? "bg-orange-100 border-orange-300 text-orange-800 cursor-not-allowed"
                          : "bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
                      } ${
                        updatingStatus ? "opacity-50 cursor-not-allowed" : ""
                      }`}>
                      {selectedOrder.status === "preparing"
                        ? "✓ Preparing"
                        : "Set to Preparing"}
                    </button>
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder._id, "out_for_delivery")
                      }
                      disabled={
                        updatingStatus ||
                        selectedOrder.status === "out_for_delivery"
                      }
                      className={`px-4 py-2 text-sm font-medium border transition-colors ${
                        selectedOrder.status === "out_for_delivery"
                          ? "bg-purple-100 border-purple-300 text-purple-800 cursor-not-allowed"
                          : "bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
                      } ${
                        updatingStatus ? "opacity-50 cursor-not-allowed" : ""
                      }`}>
                      {selectedOrder.status === "out_for_delivery"
                        ? "✓ Out for Delivery"
                        : "Set to Out for Delivery"}
                    </button>
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder._id, "delivered")
                      }
                      disabled={
                        updatingStatus || selectedOrder.status === "delivered"
                      }
                      className={`px-4 py-2 text-sm font-medium border transition-colors ${
                        selectedOrder.status === "delivered"
                          ? "bg-green-100 border-green-300 text-green-800 cursor-not-allowed"
                          : "bg-white border-green-300 text-green-700 hover:bg-green-50"
                      } ${
                        updatingStatus ? "opacity-50 cursor-not-allowed" : ""
                      }`}>
                      {selectedOrder.status === "delivered"
                        ? "✓ Delivered"
                        : "Set to Delivered"}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => deleteOrder(selectedOrder._id)}
                    className="bg-red-600 text-white px-4 py-2 hover:bg-red-700 flex items-center gap-2">
                    <FiTrash2 className="w-4 h-4" />
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;

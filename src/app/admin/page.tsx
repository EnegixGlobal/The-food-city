"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Users,
  Utensils,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { FiRefreshCw, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

// Types
interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  description: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  phone: string;
  items: number;
  total: string;
  status: string;
  paymentStatus: string;
  orderDate: string;
}

interface PopularItem {
  name: string;
  orders: number;
  revenue: string;
  slug: string;
}

interface DashboardData {
  stats: DashboardStat[];
  recentOrders: RecentOrder[];
  popularItems: PopularItem[];
  orderStatusDistribution: Record<string, number>;
  paymentMethodStats: Record<string, { count: number; revenue: number }>;
  summary: {
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    monthlyOrders: number;
    monthlyRevenue: number;
    averageOrderValue: number;
  };
  trends: {
    ordersChange: number;
    revenueChange: number;
    monthlyOrdersChange: number;
    monthlyRevenueChange: number;
  };
}

const DashboardPage = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Date filter state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0], // Today
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const iconMap = {
    orders: ShoppingBag,
    revenue: FaRupeeSign,
    totalRevenue: DollarSign,
    products: Utensils,
    customers: Users,
    monthlyOrders: Package,
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 border border-blue-300",
    preparing: "bg-orange-100 text-orange-800 border border-orange-300",
    out_for_delivery: "bg-purple-100 text-purple-800 border border-purple-300",
    delivered: "bg-green-100 text-green-800 border border-green-300",
    cancelled: "bg-red-100 text-red-800 border border-red-300",
  };


  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Build query parameters for date filtering
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(`/api/dashboard?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      if (data.success) {
        setDashboardData(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status display text
  const getStatusText = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Handle date range change
  const handleDateRangeChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply date filter
  const applyDateFilter = () => {
    fetchDashboardData();
    setShowDatePicker(false);
  };

  // Quick date presets
  const setQuickDateRange = (days: number) => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - days))
      .toISOString()
      .split("T")[0];

    setDateRange({ startDate, endDate });
    setTimeout(() => {
      fetchDashboardData();
    }, 100);
  };

  // Format date for display
  const formatDateRange = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
    };

    return `${start.toLocaleDateString(
      "en-US",
      formatOptions
    )} - ${end.toLocaleDateString("en-US", formatOptions)}`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, fetchDashboardData]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 animate-spin text-red-800 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 mb-4">
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">Real-time insights and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 bg-red-900 text-white px-4 py-2 hover:bg-red-800 disabled:opacity-50 transition-colors">
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Date Range:
              </span>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors">
                {formatDateRange()}
              </button>
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Quick:</span>
              <button
                onClick={() => setQuickDateRange(7)}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
                7D
              </button>
              <button
                onClick={() => setQuickDateRange(30)}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
                30D
              </button>
              <button
                onClick={() => setQuickDateRange(90)}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
                90D
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              Updating data...
            </div>
          )}
        </div>

        {/* Date Picker Dropdown */}
        {showDatePicker && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateRangeChange("startDate", e.target.value)
                  }
                  max={dateRange.endDate}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", e.target.value)
                  }
                  min={dateRange.startDate}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={applyDateFilter}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Apply Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && dashboardData && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          <p className="text-sm">Warning: {error}</p>
        </div>
      )}

      {dashboardData && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {dashboardData.stats.map((stat, index) => {
              const IconComponent =
                iconMap[stat.icon as keyof typeof iconMap] || ShoppingBag;

              return (
                <div
                  key={index}
                  className="bg-white p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-2">
                        {stat.trend === "up" && (
                          <FiTrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        {stat.trend === "down" && (
                          <FiTrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <p
                          className={`text-sm font-medium ${
                            stat.trend === "up"
                              ? "text-green-600"
                              : stat.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}>
                          {stat.change} {stat.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-4 border ${
                        stat.trend === "up"
                          ? "bg-green-50 border-green-200"
                          : stat.trend === "down"
                          ? "bg-red-50 border-red-200"
                          : "bg-blue-50 border-blue-200"
                      }`}>
                      <IconComponent
                        className={`h-6 w-6 ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Average Order Value
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    ₹
                    {dashboardData.summary.averageOrderValue.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    ₹
                    {dashboardData.summary.monthlyRevenue.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    Monthly Orders
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {dashboardData.summary.monthlyOrders.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {dashboardData.summary.totalOrders > 0
                      ? Math.round(
                          ((dashboardData.orderStatusDistribution.delivered ||
                            0) /
                            dashboardData.summary.totalOrders) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Recent Orders and Popular Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <button
                  onClick={() => router.push("/admin/orders")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.recentOrders.slice(0, 6).map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                        {order.customer.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.id}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.customer}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {order.total}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items} items
                      </p>
                      <div className="flex gap-1 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium ${
                            statusColors[
                              order.status as keyof typeof statusColors
                            ] || "bg-gray-100 text-gray-800"
                          }`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Popular Menu Items
                </h2>
                <button
                  onClick={() => router.push("/admin/products")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.popularItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 text-orange-600 p-3 border border-orange-200">
                        <Utensils className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.revenue}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500"></div>
                        <span className="text-xs text-green-600">Popular</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Status Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(dashboardData.orderStatusDistribution).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="text-center p-4 bg-gray-50 border border-gray-200">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {getStatusText(status)}
                    </p>
                    <div
                      className={`w-full h-1 mt-2 ${
                        status === "delivered"
                          ? "bg-green-500"
                          : status === "cancelled"
                          ? "bg-red-500"
                          : status === "preparing"
                          ? "bg-orange-500"
                          : status === "out_for_delivery"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                      }`}></div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Payment Method Stats */}
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Method Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(dashboardData.paymentMethodStats).map(
                ([method, stats]) => (
                  <div
                    key={method}
                    className="p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {method}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {stats.count} orders
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{stats.revenue.toLocaleString("en-IN")}
                    </p>
                    <div className="mt-2 bg-gray-200 h-2">
                      <div
                        className={`h-2 ${
                          method === "online" ? "bg-blue-500" : "bg-green-500"
                        }`}
                        style={{
                          width: `${
                            (stats.revenue /
                              Math.max(
                                ...Object.values(
                                  dashboardData.paymentMethodStats
                                ).map((s) => s.revenue)
                              )) *
                            100
                          }%`,
                        }}></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

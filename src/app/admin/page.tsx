import React from "react";
import {  ShoppingBag, Users, Utensils } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

const DashboardPage = () => {
  // Sample data - replace with real data from your API
  const stats = [
    {
      title: "Today's Orders",
      value: "142",
      icon: ShoppingBag,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Customers",
      value: "1,284",
      icon: Users,
      change: "+5%",
      trend: "up",
    },
    {
      title: "Menu Items",
      value: "87",
      icon: Utensils,
      change: "+3",
      trend: "up",
    },

    {
      title: "Today's Revenue",
      value: "₹3,845",
      icon: FaRupeeSign,
      change: "+18%",
      trend: "up",
    },
  ];

  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "John Smith",
      items: 3,
      total: "₹345.20",
      status: "Delivered",
    },
    {
      id: "#ORD-002",
      customer: "Sarah Johnson",
      items: 5,
      total: "₹578.50",
      status: "On the way",
    },
    {
      id: "#ORD-003",
      customer: "Michael Brown",
      items: 2,
      total: "₹232.10",
      status: "Preparing",
    },
    {
      id: "#ORD-004",
      customer: "Emily Davis",
      items: 4,
      total: "₹462.75",
      status: "Delivered",
    },
    {
      id: "#ORD-005",
      customer: "Robert Wilson",
      items: 1,
      total: "₹115.99",
      status: "Cancelled",
    },
  ];

  const popularItems = [
    { name: "Margherita Pizza", orders: 142, revenue: "₹1,845" },
    { name: "Chicken Burger", orders: 98, revenue: "₹1,254" },
    { name: "Veg Pasta", orders: 76, revenue: "₹988" },
    { name: "Caesar Salad", orders: 65, revenue: "₹845" },
    { name: "Chocolate Brownie", orders: 53, revenue: "₹689" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: Today, {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1 text-gray-900">
                  {stat.value}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                  {stat.change} from yesterday
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  stat.trend === "up" ? "bg-green-50" : "bg-red-50"
                }`}>
                <stat.icon
                  className={`h-6 w-6 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders and Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <button className="text-sm font-medium text-red-900 hover:text-red-700">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.items}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {order.total}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "On the way"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "Preparing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Popular Menu Items
            </h2>
            <button className="text-sm font-medium text-red-900 hover:text-red-700">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {popularItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-red-100 text-red-900 p-2 rounded-lg mr-3">
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
                <p className="text-sm font-medium text-gray-900">
                  {item.revenue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

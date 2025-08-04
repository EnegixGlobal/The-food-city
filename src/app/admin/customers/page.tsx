"use client";

import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPhoneAlt,
  FaBan,
  FaCheck,
  FaEnvelope,
  FaCalendarAlt,
} from "react-icons/fa";
import { FiCheckCircle, FiUser, FiLoader } from "react-icons/fi";
import { showAlert } from "../../zustand/alertStore";

interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  isBlocked: boolean;
  addresses: string[];
  createdAt: string;
  updatedAt: string;
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [blockingUser, setBlockingUser] = useState<string | null>(null);
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data);
        setFilteredCustomers(data.data);
      } else {
        showAlert.error("Error", data.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showAlert.error("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Toggle block status
  const toggleBlockStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setBlockingUser(userId);
      const response = await fetch(`/api/users/block/${userId}`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (data.success) {
        // Update local state
        const updatedCustomers = customers.map((customer) =>
          customer._id === userId
            ? { ...customer, isBlocked: !currentStatus }
            : customer
        );
        setCustomers(updatedCustomers);
        setFilteredCustomers(
          updatedCustomers.filter(
            (customer) =>
              customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              customer.phone.includes(searchTerm) ||
              (customer.email &&
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        );

        showAlert.success(
          "Success",
          `Customer ${!currentStatus ? "blocked" : "unblocked"} successfully`
        );
      } else {
        showAlert.error(
          "Error",
          data.message || "Failed to toggle block status"
        );
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
      showAlert.error("Error", "Failed to connect to server");
    } finally {
      setBlockingUser(null);
    }
  };

  // Search functionality
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.email &&
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusBadge = (isBlocked: boolean) => {
    if (isBlocked) {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center">
          <FaBan className="mr-1" /> Blocked
        </span>
      );
    } else {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
          <FiCheckCircle className="mr-1" /> Active
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FiLoader className="animate-spin h-8 w-8 text-red-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Customer Management
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
            />
          </div>
          <button
            onClick={fetchCustomers}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-none hover:bg-red-800">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Addresses
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500">
                    <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      No customers found
                    </p>
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No customers have registered yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-900 font-medium">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {customer._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaPhoneAlt className="mr-2 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.email ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No email</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {customer.addresses.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(customer.isBlocked)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          toggleBlockStatus(customer._id, customer.isBlocked)
                        }
                        disabled={blockingUser === customer._id}
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          customer.isBlocked
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } ${
                          blockingUser === customer._id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}>
                        {blockingUser === customer._id ? (
                          <FiLoader className="animate-spin mr-1" />
                        ) : customer.isBlocked ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaBan className="mr-1" />
                        )}
                        {customer.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.length}
          </p>
          <p className="text-xs text-blue-600 mt-1">All registered users</p>
        </div>
        <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">
            Active Customers
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter((c) => !c.isBlocked).length}
          </p>
          <p className="text-xs text-green-600 mt-1">Not blocked</p>
        </div>
        <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">
            Blocked Customers
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter((c) => c.isBlocked).length}
          </p>
          <p className="text-xs text-red-600 mt-1">Currently blocked</p>
        </div>
        <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">With Email</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter((c) => c.email).length}
          </p>
          <p className="text-xs text-blue-600 mt-1">Email provided</p>
        </div>
      </div>

      {/* Results Summary */}
      {filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">{filteredCustomers.length}</span> of{" "}
            <span className="font-medium">{customers.length}</span> customers
            {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

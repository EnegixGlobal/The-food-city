"use client";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";

interface Address {
  _id: string;
  fullAddress: string;
  pincode: string;
  user: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/address", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();

      if (data.success) {
        setAddresses(data.data || []);
      } else {
        setError(data.message || "Failed to fetch addresses");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim() || !newPincode.trim()) return;

    // Validate pincode format
    if (!/^\d{6}$/.test(newPincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/users/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullAddress: newAddress.trim(),
          pincode: newPincode.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh addresses list
        await fetchAddresses();
        setNewAddress("");
        setNewPincode("");
        setIsAddingAddress(false);
        toast.success("Address added successfully!");
      } else {
        toast.error(data.message || "Failed to add address");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAddress = async (addressId: string) => {
    if (!editAddress.trim() || !editPincode.trim()) return;

    // Validate pincode format
    if (!/^\d{6}$/.test(editPincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/users/address/${addressId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullAddress: editAddress.trim(),
          pincode: editPincode.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh addresses list
        await fetchAddresses();
        setEditingAddress(null);
        setEditAddress("");
        setEditPincode("");
        toast.success("Address updated successfully!");
      } else {
        toast.error(data.message || "Failed to update address");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update address"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/users/address/${addressId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // Refresh addresses list
        await fetchAddresses();
        toast.success("Address deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete address");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete address"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingAddress = (address: Address) => {
    setEditingAddress(address._id);
    setEditAddress(address.fullAddress);
    setEditPincode(address.pincode || "");
  };

  const cancelEditing = () => {
    setEditingAddress(null);
    setEditAddress("");
    setEditPincode("");
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-none p-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              My Addresses
            </h1>
            <Button
              onClick={() => setIsAddingAddress(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-none">
              + Add New Address
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-none p-4 mb-4 sm:mb-6">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Add Address Form */}
        {isAddingAddress && (
          <div className="bg-white rounded-none shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Add New Address
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newAddress"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  id="newAddress"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none   resize-none text-sm outline-none"
                  placeholder="Enter your complete address..."
                />
              </div>
              <div>
                <label
                  htmlFor="newPincode"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <Input
                  id="newPincode"
                  type="text"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  maxLength={6}
                  className="w-full px-3 text-sm"
                  placeholder="Enter 6-digit pincode"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddAddress}
                  disabled={
                    !newAddress.trim() || !newPincode.trim() || submitting
                  }
                  className="px-4 py-2 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  {submitting ? "Adding..." : "Add Address"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingAddress(false);
                    setNewAddress("");
                    setNewPincode("");
                  }}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-none shadow-sm p-6 sm:p-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Addresses Found
              </h3>
              <p className="text-gray-600 mb-4">
                You haven&apos;t added any addresses yet. Add your first address to
                get started.
              </p>
              <button
                onClick={() => setIsAddingAddress(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-colors">
                Add Your First Address
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="bg-white rounded-none shadow-sm border border-gray-100 p-4 sm:p-6">
                {editingAddress === address._id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor={`editAddress-${address._id}`}
                        className="block text-sm font-medium text-gray-700 mb-2">
                        Full Address *
                      </label>
                      <textarea
                        id={`editAddress-${address._id}`}
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-none  resize-none text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`editPincode-${address._id}`}
                        className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <Input
                        id={`editPincode-${address._id}`}
                        type="text"
                        value={editPincode}
                        onChange={(e) => setEditPincode(e.target.value)}
                        maxLength={6}
                        className="w-full px-3 text-sm"
                        placeholder="Enter 6-digit pincode"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateAddress(address._id)}
                        disabled={
                          !editAddress.trim() ||
                          !editPincode.trim() ||
                          submitting
                        }
                        className="px-4 py-2 bg-orange-500 text-white rounded-none hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        {submitting ? "Updating..." : "Update"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={submitting}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 mb-4 sm:mb-0 sm:mr-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-sm">📍</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-gray-900 leading-relaxed mb-1">
                            {address.fullAddress}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Pincode:</span>{" "}
                            {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={() => startEditingAddress(address)}
                        disabled={submitting}
                        className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs sm:text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        disabled={submitting}
                        className="px-3 sm:px-4 py-2 border border-red-300 text-red-600 rounded-none hover:bg-red-50 transition-colors disabled:opacity-50 text-xs sm:text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

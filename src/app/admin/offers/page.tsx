"use client";

import React, { useState, useEffect } from "react";
import {
  FaRupeeSign,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPercentage,
  FaCalendarAlt,
  FaTicketAlt,
  FaTimes,
  FaUpload,
  FaSearch,
} from "react-icons/fa";
import { FiCheckCircle, FiLoader } from "react-icons/fi";
import { showAlert } from "../../zustand/alertStore";
import Input from "../../components/Input";
import Image from "next/image";

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
}

interface Coupon {
  _id: string;
  code: string;
  offerImage?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicableItems: string[];
  applicableProducts?: Product[];
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CouponFormData {
  code: string;
  offerImage: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  applicableItems: string[];
  startDate: string;
  endDate: string;
  usageLimit: string;
  isActive: boolean;
}

const CouponsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    offerImage: "",
    discountType: "percentage",
    discountValue: "",
    applicableItems: [],
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });

  const baseUrl = process.env.PUBLIC_URL || "";

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showAlert.error("Invalid File Type", "Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert.error("File Too Large", "Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.message === "Upload successful") {
        setFormData({
          ...formData,
          offerImage: data.url,
        });
        showAlert.success("Image Uploaded", "Image uploaded successfully!");
      } else {
        showAlert.error(
          "Upload Failed",
          data.error || "Failed to upload image"
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert.error("Upload Error", "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/coupon`);
      const data = await response.json();

      if (response.ok && data.success) {
        setCoupons(data.data || []);
      } else {
        if (response.status !== 404) {
          showAlert.error(
            "Fetch Failed",
            data.message || "Failed to fetch coupons"
          );
        }
        setCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      showAlert.error("Network Error", "Failed to fetch coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/product`);
      const data = await response.json();

      if (response.ok && data.success) {
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.code ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.usageLimit
    ) {
      showAlert.error("Missing Fields", "Please fill in all required fields");
      return;
    }

    if (formData.applicableItems.length === 0) {
      showAlert.error(
        "Missing Products",
        "Please select at least one applicable product"
      );
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      showAlert.error("Invalid Dates", "End date must be after start date");
      return;
    }

    const couponData = {
      code: formData.code.toUpperCase(),
      offerImage: formData.offerImage,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      applicableItems: formData.applicableItems,
      startDate: formData.startDate,
      endDate: formData.endDate,
      usageLimit: parseInt(formData.usageLimit),
      isActive: formData.isActive,
    };

    try {
      const url = editingCoupon
        ? `${baseUrl}/api/coupon/${editingCoupon._id}`
        : `${baseUrl}/api/coupon`;
      const method = editingCoupon ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.success(
          editingCoupon ? "Coupon Updated" : "Coupon Created",
          data.message
        );
        resetForm();
        fetchCoupons();
      } else {
        showAlert.error(
          editingCoupon ? "Update Failed" : "Creation Failed",
          data.message ||
            `Failed to ${editingCoupon ? "update" : "create"} coupon`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showAlert.error("Network Error", "Failed to submit form");
    }
  };

  // Handle edit
  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      offerImage: coupon.offerImage || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      applicableItems: coupon.applicableItems,
      startDate: coupon.startDate.split("T")[0], // Format for input[type="date"]
      endDate: coupon.endDate.split("T")[0],
      usageLimit: coupon.usageLimit.toString(),
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/coupon/${coupon._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.success("Coupon Deleted", data.message);
        fetchCoupons();
      } else {
        showAlert.error(
          "Delete Failed",
          data.message || "Failed to delete coupon"
        );
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showAlert.error("Network Error", "Failed to delete coupon");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      offerImage: "",
      discountType: "percentage",
      discountValue: "",
      applicableItems: [],
      startDate: "",
      endDate: "",
      usageLimit: "",
      isActive: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  // Filter coupons based on search term
  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper functions
  const statusBadge = (coupon: Coupon) => {
    const isExpired = new Date() > new Date(coupon.endDate);
    const isActive = coupon.isActive && !isExpired;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center ${
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
        {isActive ? (
          <>
            <FiCheckCircle className="mr-1" /> Active
          </>
        ) : isExpired ? (
          "Expired"
        ) : (
          "Inactive"
        )}
      </span>
    );
  };

  const discountDisplay = (coupon: Coupon) => (
    <div className="flex items-center">
      {coupon.discountType === "percentage" ? (
        <>
          <FaPercentage className="text-gray-500 mr-1" size={12} />
          <span className="font-medium">{coupon.discountValue}%</span>
        </>
      ) : (
        <>
          <FaRupeeSign className="text-gray-500 mr-1" size={12} />
          <span className="font-medium">{coupon.discountValue}</span>
        </>
      )}
    </div>
  );

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-none shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Coupons & Offers Management
              </h1>
              <p className="text-gray-600">
                Create and manage discount coupons for your restaurant
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-none flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              <FaPlus /> Create New Coupon
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-none shadow-md p-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-none shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <FiLoader className="animate-spin text-4xl text-orange-500" />
              <span className="ml-3 text-lg text-gray-600">
                Loading coupons...
              </span>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "No coupons found" : "No coupons available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by creating your first coupon"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-none flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl mx-auto">
                  <FaPlus /> Create Your First Coupon
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                {/* Table Header */}
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicable Items
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr
                      key={coupon._id}
                      className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Coupon Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {coupon.offerImage ? (
                            <div className="flex-shrink-0 h-16 w-16 mr-4">
                              <Image
                                src={coupon.offerImage}
                                alt={coupon.code}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-none object-cover border border-gray-200"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-16 w-16 mr-4 bg-gray-100 rounded-none flex items-center justify-center">
                              <FaTicketAlt className="text-gray-400 text-xl" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center">
                              <FaTicketAlt className="text-orange-500 mr-2" />
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                                {coupon.code}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Created:{" "}
                              {new Date(coupon.createdAt).toLocaleDateString(
                                "en-IN"
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-medium">
                          {discountDisplay(coupon)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {coupon.discountType === "percentage"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {coupon.usedCount} / {coupon.usageLimit}
                          </div>
                          <div className="text-xs text-gray-500">
                            {coupon.usageLimit - coupon.usedCount} remaining
                          </div>
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900">
                            <FaCalendarAlt
                              className="mr-1 text-gray-400"
                              size={12}
                            />
                            {new Date(coupon.startDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            to{" "}
                            {new Date(coupon.endDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusBadge(coupon)}
                      </td>

                      {/* Applicable Items */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {coupon.applicableProducts?.length || 0} products
                          </div>
                          {coupon.applicableProducts &&
                            coupon.applicableProducts.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {coupon.applicableProducts
                                  .slice(0, 2)
                                  .map((product) => (
                                    <span
                                      key={product._id}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                      {product.title}
                                    </span>
                                  ))}
                                {coupon.applicableProducts.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                    +{coupon.applicableProducts.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-none transition-colors duration-200"
                            title="Edit Coupon">
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-none transition-colors duration-200"
                            title="Delete Coupon">
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Coupons</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {coupons.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">
              Active Coupons
            </h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {
                coupons.filter(
                  (c) => c.isActive && new Date() <= new Date(c.endDate)
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">
              Total Redeemed
            </h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-none shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Avg. Discount</h3>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {coupons.length > 0
                ? Math.round(
                    coupons.reduce(
                      (sum, coupon) => sum + coupon.discountValue,
                      0
                    ) / coupons.length
                  )
                : 0}
              {coupons.length > 0 && coupons[0]?.discountType === "percentage"
                ? "%"
                : "₹"}
            </p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Coupon Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-none p-6 text-center hover:border-orange-500 transition-colors duration-200">
                  {formData.offerImage ? (
                    <div className="relative">
                      <Image
                        src={formData.offerImage}
                        alt="Preview"
                        width={200}
                        height={150}
                        className="w-48 h-36 object-cover rounded-none mb-4 mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, offerImage: "" })
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200">
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">
                        Click to upload coupon image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-none cursor-pointer transition-colors duration-200 ${
                          uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}>
                        {uploadingImage ? (
                          <>
                            <FiLoader className="inline animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          "Choose Image"
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coupon Code */}

                <Input
                  label="Coupon Code *"
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Enter coupon code (e.g., SAVE20)"
                  required
                />

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full border border-gray-300 rounded-none p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    required>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              {/* Form Fields Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Discount Value */}
                <Input
                  label={`Discount ${
                    formData.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Amount (₹)"
                  } *`}
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder={
                    formData.discountType === "percentage"
                      ? "e.g., 20"
                      : "e.g., 100"
                  }
                  step="0.01"
                  min="0"
                  max={
                    formData.discountType === "percentage" ? "100" : undefined
                  }
                  required
                />

                {/* Usage Limit */}
                <Input
                  label="Usage Limit *"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  placeholder="Maximum uses allowed"
                  min="1"
                  required
                />

                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center h-12">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Activate this coupon immediately
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Fields Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full pl-10 p-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full pl-10 p-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Applicable Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicable Products * (Select at least one)
                </label>
                <div className="border border-gray-300 rounded-none p-4 max-h-60 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No products available
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {products.map((product) => (
                        <label
                          key={product._id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applicableItems.includes(
                              product._id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  applicableItems: [
                                    ...formData.applicableItems,
                                    product._id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableItems:
                                    formData.applicableItems.filter(
                                      (id) => id !== product._id
                                    ),
                                });
                              }
                            }}
                            className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <div className="flex items-center">
                            <Image
                              src={product.imageUrl}
                              alt={product.title}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded object-cover mr-2"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.title}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <FaRupeeSign className="mr-1" size={10} />
                                {product.price}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.applicableItems.length} product(s)
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-none font-medium transition-colors duration-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    uploadingImage || formData.applicableItems.length === 0
                  }
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-none font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;

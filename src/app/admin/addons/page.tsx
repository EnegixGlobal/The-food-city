"use client";

import React, { useState, useEffect } from "react";
import {
  FaRupeeSign,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUpload,
  FaStar,
  FaLeaf,
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { showAlert } from "../../zustand/alertStore";
import Input from "../../components/Input";
import Image from "next/image";

interface AddOn {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imagePublicId: string;
  rating?: number;
  ratingCount?: number;
  isVeg: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddOnFormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  imagePublicId: string;
  isVeg: boolean;
}

const AddOnsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [formData, setFormData] = useState<AddOnFormData>({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    imagePublicId: "",
    isVeg: true,
  });

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

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.message === "Upload successful") {
        setFormData({
          ...formData,
          imageUrl: data.url,
          imagePublicId: data.publicId,
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

  // Fetch add-ons
  const fetchAddOns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/addons");
      const data = await response.json();

      if (response.ok && data.success) {
        setAddOns(data.data || []);
      } else {
        if (response.status !== 404) {
          showAlert.error(
            "Fetch Failed",
            data.message || "Failed to fetch add-ons"
          );
        }
        setAddOns([]);
      }
    } catch (error) {
      console.error("Error fetching add-ons:", error);
      showAlert.error("Network Error", "Failed to fetch add-ons");
      setAddOns([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price) {
      showAlert.error("Missing Fields", "Please fill in all required fields");
      return;
    }

    if (!formData.imageUrl) {
      showAlert.error("Missing Image", "Please upload an image");
      return;
    }

    const addOnData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      imagePublicId: formData.imagePublicId,
      isVeg: formData.isVeg,
    };

    try {
      const url = editingAddOn ? `/api/addons/${editingAddOn._id}` : "/api/addons";
      const method = editingAddOn ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addOnData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.success(
          editingAddOn ? "Add-on Updated" : "Add-on Created",
          data.message
        );
        resetForm();
        fetchAddOns();
      } else {
        showAlert.error(
          editingAddOn ? "Update Failed" : "Creation Failed",
          data.message || `Failed to ${editingAddOn ? "update" : "create"} add-on`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showAlert.error("Network Error", "Failed to submit form");
    }
  };

  // Handle edit
  const handleEdit = (addOn: AddOn) => {
    setEditingAddOn(addOn);
    setFormData({
      title: addOn.title,
      description: addOn.description,
      price: addOn.price.toString(),
      imageUrl: addOn.imageUrl,
      imagePublicId: addOn.imagePublicId,
      isVeg: addOn.isVeg,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (addOn: AddOn) => {
    if (!confirm(`Are you sure you want to delete "${addOn.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/addons/${addOn._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.success("Add-on Deleted", data.message);
        fetchAddOns();
      } else {
        showAlert.error("Delete Failed", data.message || "Failed to delete add-on");
      }
    } catch (error) {
      console.error("Error deleting add-on:", error);
      showAlert.error("Network Error", "Failed to delete add-on");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      imageUrl: "",
      imagePublicId: "",
      isVeg: true,
    });
    setEditingAddOn(null);
    setShowForm(false);
  };

  // Filter add-ons based on search term
  const filteredAddOns = addOns.filter((addOn) =>
    addOn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addOn.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchAddOns();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-none shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Add-ons Management
              </h1>
              <p className="text-gray-600">
                Manage your restaurant add-ons and extras
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-none flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaPlus /> Add New Add-on
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-none shadow-md p-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search add-ons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Add-ons Table */}
        <div className="bg-white rounded-none shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <FiLoader className="animate-spin text-4xl text-orange-500" />
              <span className="ml-3 text-lg text-gray-600">Loading add-ons...</span>
            </div>
          ) : filteredAddOns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "No add-ons found" : "No add-ons available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by adding your first add-on"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-none flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
                >
                  <FaPlus /> Add Your First Add-on
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
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name & Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAddOns.map((addOn) => (
                    <tr key={addOn._id} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-16 w-16">
                          <Image
                            src={addOn.imageUrl}
                            alt={addOn.title}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-none object-cover border border-gray-200"
                          />
                        </div>
                      </td>

                      {/* Name & Description */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {addOn.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {addOn.description}
                          </div>
                        </div>
                      </td>

                      {/* Type (Veg/Non-Veg) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {addOn.isVeg ? (
                            <div className="flex items-center">
                              <div className="bg-green-500 text-white p-1 rounded-full mr-2">
                                <FaLeaf className="text-xs" />
                              </div>
                              <span className="text-sm text-green-600 font-medium">Veg</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-2 font-bold">
                                N
                              </div>
                              <span className="text-sm text-red-600 font-medium">Non-Veg</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-orange-600 font-bold">
                          <FaRupeeSign className="text-sm mr-1" />
                          <span className="text-lg">{addOn.price}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {addOn.rating && addOn.ratingCount ? (
                          <div className="flex items-center">
                            <FaStar className="text-yellow-500 text-sm mr-1" />
                            <span className="text-sm font-medium text-gray-700">
                              {addOn.rating}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({addOn.ratingCount})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            New
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(addOn.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(addOn)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-none transition-colors duration-200 group"
                            title="Edit Add-on"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(addOn)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-none transition-colors duration-200 group"
                            title="Delete Add-on"
                          >
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
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingAddOn ? "Edit Add-on" : "Add New Add-on"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add-on Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-none p-6 text-center hover:border-orange-500 transition-colors duration-200">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className=" w-48 h-48 object-cover rounded-none mb-4"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, imageUrl: "", imagePublicId: "" })
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">
                        Click to upload or drag and drop an image
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
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <FiLoader className="inline animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          "Choose Image"
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, JPEG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <Input
              label="Title *"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter add-on title"
                required
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter add-on description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-none p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              {/* Price */}
              <Input
              label="Price *"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Enter price"
                step="0.01"
                min="0"
                required
              />

              {/* Veg/Non-Veg */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isVeg"
                      checked={formData.isVeg}
                      onChange={() => setFormData({ ...formData, isVeg: true })}
                      className="mr-2 text-green-500 focus:ring-green-500"
                    />
                    <FaLeaf className="text-green-500 mr-1" />
                    Vegetarian
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isVeg"
                      checked={!formData.isVeg}
                      onChange={() => setFormData({ ...formData, isVeg: false })}
                      className="mr-2 text-red-500 focus:ring-red-500"
                    />
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-1">
                      N
                    </span>
                    Non-Vegetarian
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-none font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || !formData.imageUrl}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-none font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingAddOn ? "Update Add-on" : "Create Add-on"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOnsPage;

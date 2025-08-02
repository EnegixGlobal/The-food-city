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
} from "react-icons/fa";
import { FiClock, FiLoader } from "react-icons/fi";
import { showAlert } from "../../zustand/alertStore";
import Input from "../../components/Input";
import Image from "next/image";

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  rating: number;
  ratingCount: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  isVeg: boolean;
  spicyLevel: number;
  prepTime: string;
  addOns: string[];
  discountPercentage?: number;
  isCustomizable?: boolean;
  customizableOptions?: Array<{
    option: string;
    price: number;
  }>;
}

interface AddOn {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
}

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  discountedPrice: string;
  category: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  isVeg: boolean;
  isBestSeller: boolean;
  spicyLevel: number;
  prepTime: string;
  addOns: string[];
  isCustomizable: boolean;
  customizableOptions: Array<{
    option: string;
    price: number;
  }>;
}

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState("indian");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: "",
    discountedPrice: "",
    category: "indian",
    imageUrl: "",
    cloudinaryPublicId: "",
    isVeg: true,
    isBestSeller: false,
    spicyLevel: 0,
    prepTime: "30 min",
    addOns: [],
    isCustomizable: false,
    customizableOptions: [],
  });

  const categories = [
    { key: "indian", label: "Indian" },
    { key: "chinese", label: "Chinese" },
    { key: "south-indian", label: "South Indian" },
    { key: "tandoor", label: "Tandoor" },
  ];

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

      console.log(data);

      if (data.message === "Upload successful") {
        setFormData({
          ...formData,
          imageUrl: data.url,
          cloudinaryPublicId: data.publicId,
        });
        showAlert.success("Image Uploaded", "Image uploaded successfully!");
      } else {
        showAlert.error(
          "Upload Failed",
          data.message || "Failed to upload image"
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert.error("Upload Error", "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch products by category
  const fetchProducts = async (category: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/product?category=${category}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setProducts(data.data.products || []);
      } else {
        showAlert.error(
          "Fetch Failed",
          data.message || "Failed to fetch products"
        );
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert.error("Network Error", "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch addons
  const fetchAddOns = async () => {
    try {
      const response = await fetch("/api/addons");
      const data = await response.json();

      if (response.ok && data.success) {
        setAddOns(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching addons:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price) {
      showAlert.error("Missing Fields", "Please fill in all required fields");
      return;
    }

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      discountedPrice: formData.discountedPrice
        ? parseFloat(formData.discountedPrice)
        : undefined,
      category: formData.category,
      imageUrl:
        formData.imageUrl || "https://source.unsplash.com/featured/?food",
      cloudinaryPublicId:
        formData.cloudinaryPublicId || `product_${Date.now()}`,
      isVeg: formData.isVeg,
      isBestSeller: formData.isBestSeller,
      spicyLevel: formData.spicyLevel,
      prepTime: formData.prepTime,
      addOns: formData.addOns.filter((id) => id.trim() !== ""),
      isCustomizable: formData.isCustomizable,
      customizableOptions: formData.isCustomizable ? formData.customizableOptions : [],
    };

    try {
      setLoading(true);
      let response;

      if (editingProduct) {
        // Update existing product
        response = await fetch(`/api/product/${editingProduct.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        // Create new product
        response = await fetch("/api/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.success(
          editingProduct ? "Product Updated" : "Product Created",
          editingProduct
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
        resetForm();
        fetchProducts(activeTab);
      } else {
        showAlert.error(
          "Save Failed",
          data.message || "Failed to save product"
        );
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showAlert.error("Network Error", "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/product/${product.slug}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.success("Product Deleted", "Product deleted successfully!");
        fetchProducts(activeTab);
      } else {
        showAlert.error(
          "Delete Failed",
          data.message || "Failed to delete product"
        );
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert.error("Network Error", "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || "",
      category: product.category,
      imageUrl: product.imageUrl,
      cloudinaryPublicId: product.cloudinaryPublicId,
      isVeg: product.isVeg,
      isBestSeller: product.isBestSeller,
      spicyLevel: product.spicyLevel,
      prepTime: product.prepTime,
      addOns: product.addOns || [],
      isCustomizable: product.isCustomizable || false,
      customizableOptions: (product.customizableOptions || []).map(option => ({
        option: option.option,
        price: option.price,
      })),
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      discountedPrice: "",
      category: activeTab,
      imageUrl: "",
      cloudinaryPublicId: "",
      isVeg: true,
      isBestSeller: false,
      spicyLevel: 0,
      prepTime: "30 min",
      addOns: [],
      isCustomizable: false,
      customizableOptions: [],
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Filter products
  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load data on mount and tab change
  useEffect(() => {
    fetchProducts(activeTab);
    if (addOns.length === 0) {
      fetchAddOns();
    }
  }, [activeTab]);

  // Utility components
  const StatusBadge = ({ available }: { available: boolean }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}>
      {available ? "Available" : "Unavailable"}
    </span>
  );

  const VegBadge = ({ isVeg }: { isVeg: boolean }) => (
    <div
      className={`w-4 h-4 rounded-full border-2 ${
        isVeg ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600"
      }`}
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
    />
  );

  const SpicyBadge = ({ level }: { level: number }) => (
    <div className="flex items-center">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className={`text-xs ${i < level ? "text-red-500" : "text-gray-300"}`}>
          🌶️
        </span>
      ))}
    </div>
  );

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Menu Management
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-none hover:bg-red-800 disabled:opacity-50"
            onClick={() => {
              setFormData({ ...formData, category: activeTab });
              setShowForm(true);
            }}
            disabled={loading}>
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveTab(category.key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === category.key
                  ? "border-red-900 text-red-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              disabled={loading}>
              {category.label}{" "}
              {`${
                activeTab === category.key
                  ? `(${filteredProducts.length})`
                  : " "
              }`}
            </button>
          ))}
        </nav>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={loading}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <Input
                      type="text"
                      required
                      className="rounded-none"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      className="w-full p-2 border border-gray-300 outline-none"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }>
                      {categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-none outline-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <Input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="rounded-none"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discounted Price (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-none"
                      value={formData.discountedPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountedPrice: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time
                    </label>
                    <Input
                      type="text"
                      className="rounded-none"
                      value={formData.prepTime}
                      onChange={(e) =>
                        setFormData({ ...formData, prepTime: e.target.value })
                      }
                      placeholder="30 min"
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-none p-4">
                    {formData.imageUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <Image
                            height={100}
                            width={100}
                            src={formData.imageUrl}
                            alt="Product preview"
                            className="max-h-32 w-auto rounded-none object-cover"
                          />
                        </div>
                        <div className="flex justify-center space-x-2">
                          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-none hover:bg-blue-700 transition-colors">
                            <FaUpload className="inline mr-2" />
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                              }}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                imageUrl: "",
                                cloudinaryPublicId: "",
                              })
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-none hover:bg-red-700 transition-colors"
                            disabled={uploadingImage}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mb-4">
                          <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                          <p className="text-gray-500 text-sm">
                            Upload product image
                          </p>
                        </div>
                        <label className="cursor-pointer bg-red-900 text-white px-6 py-2 rounded-none hover:bg-red-800 transition-colors inline-flex items-center">
                          <FaUpload className="mr-2" />
                          {uploadingImage ? "Uploading..." : "Choose Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                        <p className="text-xs text-gray-400 mt-2">
                          Supported formats: JPG, PNG, GIF (Max 5MB)
                        </p>
                      </div>
                    )}

                    {uploadingImage && (
                      <div className="mt-4 flex items-center justify-center">
                        <FiLoader className="animate-spin text-red-900 mr-2" />
                        <span className="text-sm text-gray-600">
                          Uploading image...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spicy Level
                  </label>
                  <div className="flex items-center space-x-4">
                    {[0, 1, 2, 3].map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="spicyLevel"
                          value={level}
                          checked={formData.spicyLevel === level}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              spicyLevel: parseInt(e.target.value),
                            })
                          }
                          className="mr-1"
                        />
                        <span className="flex items-center">
                          {level === 0
                            ? "None"
                            : [...Array(level)].map((_, i) => (
                                <span key={i} className="text-red-500">
                                  🌶️
                                </span>
                              ))}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>
                      <span className="font-medium">None:</span> No spice -
                      Perfect for mild taste preferences
                    </p>
                    <p>
                      <span className="font-medium">🌶️ Level 1:</span> Mild
                      spice - Gentle warmth with subtle heat
                    </p>
                    <p>
                      <span className="font-medium">🌶️🌶️ Level 2:</span> Medium
                      spice - Moderate heat with flavorful kick
                    </p>
                    <p>
                      <span className="font-medium">🌶️🌶️🌶️ Level 3:</span> Hot
                      spice - Intense heat for spice lovers
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) =>
                        setFormData({ ...formData, isVeg: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Vegetarian
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isBestSeller: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Best Seller
                  </label>
                </div>

                {/* Customizable Options Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-800">
                      Customizable Options
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isCustomizable"
                        checked={formData.isCustomizable}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isCustomizable: e.target.checked,
                            customizableOptions: e.target.checked
                              ? formData.customizableOptions
                              : [],
                          })
                        }
                        className="mr-2"
                      />
                      <label htmlFor="isCustomizable" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Enable customizable options for this product
                      </label>
                    </div>
                  </div>

                  {formData.isCustomizable && (
                    <div className="border border-gray-300 rounded-none p-4 bg-gray-50">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">
                          Customization Options
                        </h4>
                        <p className="text-xs font-medium text-gray-600 mb-3">
                          Add customizable options with their additional prices (e.g., &quot;With Rabri&quot; - ₹20).
                        </p>
                      </div>

                      {formData.customizableOptions.map((option, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-none p-4 mb-3">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-semibold text-gray-800">
                              Option {index + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedOptions = formData.customizableOptions.filter(
                                  (_, i) => i !== index
                                );
                                setFormData({
                                  ...formData,
                                  customizableOptions: updatedOptions,
                                });
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium">
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Option *
                              </label>
                              <input
                                type="text"
                                value={option.option}
                                onChange={(e) => {
                                  const updatedOptions = [...formData.customizableOptions];
                                  updatedOptions[index] = {
                                    ...option,
                                    option: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    customizableOptions: updatedOptions,
                                  });
                                }}
                                placeholder="e.g., With Rabri"
                                className="w-full px-3 py-2 border border-gray-300 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Additional Price (₹)
                              </label>
                              <input
                                type="number"
                                value={option.price}
                                onChange={(e) => {
                                  const updatedOptions = [...formData.customizableOptions];
                                  updatedOptions[index] = {
                                    ...option,
                                    price: parseFloat(e.target.value) || 0,
                                  };
                                  setFormData({
                                    ...formData,
                                    customizableOptions: updatedOptions,
                                  });
                                }}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            customizableOptions: [
                              ...formData.customizableOptions,
                              {
                                option: '',
                                price: 0,
                              },
                            ],
                          });
                        }}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-none font-medium text-gray-700 hover:border-gray-400 hover:text-gray-800 text-sm">
                        + Add New Option
                      </button>
                    </div>
                  )}
                </div>

                {addOns.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Add-ons (Optional)
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-none p-3 bg-gray-50">
                      <div className="space-y-2">
                        {addOns.map((addon) => (
                          <label
                            key={addon._id}
                            className="flex items-center justify-between p-2 bg-white rounded-md border hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.addOns.includes(addon._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      addOns: [...formData.addOns, addon._id],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      addOns: formData.addOns.filter(
                                        (id) => id !== addon._id
                                      ),
                                    });
                                  }
                                }}
                                className="mr-3"
                              />
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    addon.isVeg ? "bg-green-500" : "bg-red-500"
                                  }`}
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  {addon.title}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-green-600">
                                ₹{addon.price}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                      {formData.addOns.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">
                              {formData.addOns.length}
                            </span>{" "}
                            add-on{formData.addOns.length !== 1 ? "s" : ""}{" "}
                            selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    disabled={loading}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800 disabled:opacity-50"
                    disabled={loading}>
                    {loading ? (
                      <div className="flex items-center">
                        <FiLoader className="animate-spin mr-2" />
                        {editingProduct ? "Updating..." : "Creating..."}
                      </div>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-none shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="animate-spin text-2xl text-red-900 mr-2" />
            <span>Loading products...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-3 py-4">
                        <div className="flex items-center">
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            height={48}
                            width={48}
                            className="w-12 h-12 rounded-none object-cover mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://source.unsplash.com/featured/?food";
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium line-clamp-2 text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-gray-500 max-w-xs">
                          <p className="line-clamp-2 mb-1">
                            {product.description}
                          </p>
                          <div className="flex items-center text-xs">
                            <FiClock className="mr-1" />
                            {product.prepTime}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm">
                          <div className="flex items-center font-medium text-gray-900">
                            <FaRupeeSign
                              className="text-gray-500 mr-1"
                              size={12}
                            />
                            {product.discountedPrice || product.price}
                          </div>
                          {product.discountedPrice && (
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="line-through mr-1">
                                ₹{product.price}
                              </span>
                              <span className="text-green-600 font-medium">
                                {product.discountPercentage}% off
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center space-x-2">
                          <VegBadge isVeg={product.isVeg} />
                          <SpicyBadge level={product.spicyLevel} />
                          {product.isBestSeller && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <FaStar className="mr-1" size={10} />
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge available={product.isAvailable} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-red-900 hover:text-red-700 p-1"
                            disabled={loading}
                            title="Edit">
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-gray-500 hover:text-red-600 p-1"
                            disabled={loading}
                            title="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-sm text-gray-500">
                      {searchTerm ? (
                        <>No products found matching &quot;{searchTerm}&quot;</>
                      ) : (
                        <>
                          No products found in{" "}
                          {categories.find((c) => c.key === activeTab)?.label}{" "}
                          category
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-none shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {products.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-none shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Vegetarian</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {products.filter((p) => p.isVeg).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-none shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Best Sellers</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {products.filter((p) => p.isBestSeller).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-none shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Avg. Price</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center">
            <FaRupeeSign className="mr-1" size={14} />
            {products.length > 0
              ? Math.round(
                  products.reduce(
                    (sum, p) => sum + (p.discountedPrice || p.price),
                    0
                  ) / products.length
                )
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

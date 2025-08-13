"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(100);

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

      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        showAlert.error("Upload Failed", "Invalid server response");
        return;
      }

      if (!response.ok || data.error) {
        showAlert.error(
          "Upload Failed",
          data.error || data.message || "Failed to upload image"
        );
        return;
      }

      // Support both nested (data.data.secure_url) and legacy (data.secure_url) structures
      const secureUrl = data?.data?.secure_url || data?.secure_url;
      const publicId = data?.data?.public_id || data?.public_id;

      if (!secureUrl) {
        console.warn("Upload response missing secure_url shape:", data);
        showAlert.error(
          "Upload Failed",
          "Upload succeeded but no image URL returned"
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl: secureUrl,
        cloudinaryPublicId: publicId || prev.cloudinaryPublicId || "",
      }));
      showAlert.success("Image Uploaded", "Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert.error("Upload Error", "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch products by category
  const fetchProducts = useCallback(
    async (category: string, page: number = 1) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/product?category=${category}&page=${page}&limit=${pageSize}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setProducts(data.data.products || []);
          setTotalCount(data.data.totalCount || 0);
          setCurrentPage(data.data.currentPage || 1);
          setTotalPages(data.data.totalPages || 1);
        } else {
          showAlert.error(
            "Fetch Failed",
            data.message || "Failed to fetch products"
          );
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        showAlert.error("Network Error", "Failed to fetch products");
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Fetch addons
  const fetchAddOns = useCallback(async () => {
    try {
      const response = await fetch("/api/addons");
      const data = await response.json();

      if (response.ok && data.success) {
        setAddOns(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching addons:", error);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      showAlert.error(
        "Missing Fields",
        "Please fill in the title and description fields"
      );
      return;
    }

    // Validate discounted price when present
    const hasDiscountInput =
      (formData.discountedPrice ?? "").toString().trim() !== "";
    const priceNum = formData.price ? parseFloat(formData.price) : 0;
    const discountedNum = hasDiscountInput
      ? parseFloat(formData.discountedPrice)
      : undefined;
    if (
      hasDiscountInput &&
      discountedNum !== undefined &&
      !Number.isNaN(discountedNum) &&
      discountedNum >= priceNum
    ) {
      showAlert.warning(
        "Invalid discount",
        "Discounted price must be less than the original price."
      );
      return;
    }

    const productData = {
      title: formData.title,
      description: formData.description,
      price: priceNum,
      // discountedPrice is set only if provided; otherwise send a flag to unset
      ...(hasDiscountInput
        ? { discountedPrice: parseFloat(formData.discountedPrice) }
        : { removeDiscountedPrice: true }),
      category: formData.category,
      imageUrl: formData.imageUrl || "/placeholder-food.svg",
      cloudinaryPublicId:
        formData.cloudinaryPublicId || `product_${Date.now()}`,
      isVeg: formData.isVeg,
      isBestSeller: formData.isBestSeller,
      spicyLevel: formData.spicyLevel,
      prepTime: formData.prepTime,
      addOns: formData.addOns.filter((id) => id.trim() !== ""),
      isCustomizable: formData.isCustomizable,
      customizableOptions: formData.isCustomizable
        ? formData.customizableOptions
        : [],
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
        fetchProducts(activeTab, currentPage);
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
        fetchProducts(activeTab, currentPage);
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
      customizableOptions: (product.customizableOptions || []).map(
        (option) => ({
          option: option.option,
          price: option.price,
        })
      ),
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

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        // For search, we'll use client-side filtering for now
        // In a real app, you might want to implement server-side search
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load data on mount and tab change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when changing tabs
    fetchProducts(activeTab, 1);
    if (addOns.length === 0) {
      fetchAddOns();
    }
  }, [activeTab, addOns.length, fetchProducts, fetchAddOns]);

  // Load data when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(activeTab, currentPage);
    }
  }, [currentPage, activeTab, fetchProducts]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchProducts(activeTab, 1);
  };

  // Derive effective total pages (backend sets, but ensure correctness for 100/page scenario)
  const effectiveTotalPages = Math.max(
    1,
    Math.ceil((totalCount || 0) / (pageSize || 100))
  );

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

  const SpicyBadge = ({ level }: { level: number }) => {
    const spiceIcons = ["🌶️", "🌶️", "🌶️"];

    if (level === 0) {
      return (
        <div className="flex items-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            No Spice
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        {spiceIcons.slice(0, level).map((_, i) => (
          <span key={i} className="text-xs text-red-500">
            🌶️
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">Level {level}</span>
      </div>
    );
  };

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
              {`${activeTab === category.key ? `(${totalCount})` : " "}`}
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
                      Price (₹)
                    </label>
                    <Input
                      type="number"
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
                      <label
                        htmlFor="isCustomizable"
                        className="text-sm font-medium text-gray-700 cursor-pointer">
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
                          Add customizable options with their additional prices
                          (e.g., &quot;With Rabri&quot; - ₹20).
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
                                const updatedOptions =
                                  formData.customizableOptions.filter(
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
                                  const updatedOptions = [
                                    ...formData.customizableOptions,
                                  ];
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
                                value={option.price === 0 ? "" : option.price}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updatedOptions = [
                                    ...formData.customizableOptions,
                                  ];
                                  updatedOptions[index] = {
                                    ...option,
                                    price: val === "" ? 0 : parseFloat(val),
                                  };
                                  setFormData({
                                    ...formData,
                                    customizableOptions: updatedOptions,
                                  });
                                }}
                                step="1"
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
                                option: "",
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Properties
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(searchTerm ? filteredProducts : products).length > 0 ? (
                  (searchTerm ? filteredProducts : products).map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors">
                      {/* Product Info */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.title}
                              height={56}
                              width={56}
                              className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder-food.svg";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {product.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          <div className="flex items-center text-xs text-gray-500">
                            <FiClock className="mr-1 flex-shrink-0" />
                            <span>{product.prepTime}</span>
                          </div>

                          {product.isCustomizable &&
                            product.customizableOptions &&
                            product.customizableOptions.length > 0 && (
                              <div className="mt-2 p-2 bg-orange-50 rounded-md border border-orange-100">
                                <div className="text-xs font-medium text-orange-700 mb-1">
                                  Customizable Options (
                                  {product.customizableOptions.length})
                                </div>
                                <div className="space-y-1">
                                  {product.customizableOptions
                                    .slice(0, 2)
                                    .map((option, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 truncate pr-2">
                                          {option.option}
                                        </span>
                                        <span className="text-orange-600 font-medium whitespace-nowrap">
                                          +₹{option.price}
                                        </span>
                                      </div>
                                    ))}
                                  {product.customizableOptions.length > 2 && (
                                    <div className="text-xs text-orange-500 font-medium">
                                      +{product.customizableOptions.length - 2}{" "}
                                      more options
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 flex items-center justify-end">
                            <FaRupeeSign className="text-sm mr-1" />
                            {product.discountedPrice || product.price}
                          </div>
                          {product.discountedPrice && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500 line-through flex items-center justify-end">
                                <FaRupeeSign className="text-xs mr-1" />
                                {product.price}
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                {product.discountPercentage}% OFF
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Properties */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          {/* Veg/Non-Veg & Spicy Level */}
                          <div className="flex items-center space-x-2">
                            <VegBadge isVeg={product.isVeg} />
                            <SpicyBadge level={product.spicyLevel} />
                          </div>

                          {/* Additional Properties */}
                          <div className="flex flex-wrap gap-1">
                            {product.isBestSeller && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FaStar className="mr-1" size={8} />
                                Best Seller
                              </span>
                            )}
                            {product.isCustomizable && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                                Customizable
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge available={product.isAvailable} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            disabled={loading}
                            title="Edit Product">
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            disabled={loading}
                            title="Delete Product">
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="text-4xl text-gray-300">🍽️</div>
                        <div className="text-sm text-gray-500">
                          {searchTerm ? (
                            <>
                              No products found matching &ldquo;
                              <span className="font-medium">{searchTerm}</span>
                              &rdquo;
                            </>
                          ) : (
                            <>
                              No products found in{" "}
                              <span className="font-medium">
                                {
                                  categories.find((c) => c.key === activeTab)
                                    ?.label
                                }
                              </span>{" "}
                              category
                            </>
                          )}
                        </div>
                        {!searchTerm && totalCount === 0 && (
                          <button
                            onClick={() => {
                              setFormData({ ...formData, category: activeTab });
                              setShowForm(true);
                            }}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-red-900 text-white text-sm font-medium rounded-md hover:bg-red-800 transition-colors">
                            <FaPlus className="mr-2" />
                            Add Your First Product
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls (Fixed 100 per page; total ~183 => 2 pages) */}
      {effectiveTotalPages > 1 && (
        <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 sm:px-6 mt-4 rounded-none shadow-sm">
          {/* Info */}
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to
            {" "}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of
            {" "}
            <span className="font-medium">{totalCount}</span> products (100 per page)
          </div>
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 text-sm rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            {/* Page 1 Button */}
            <button
              onClick={() => handlePageChange(1)}
              className={`px-3 py-2 border text-sm rounded-md transition-colors ${
                currentPage === 1
                  ? "bg-red-50 border-red-500 text-red-600"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}>
              1
            </button>
            {/* Page 2 Button (only if needed) */}
            {effectiveTotalPages >= 2 && (
              <button
                onClick={() => handlePageChange(2)}
                className={`px-3 py-2 border text-sm rounded-md transition-colors ${
                  currentPage === 2
                    ? "bg-red-50 border-red-500 text-red-600"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}>
                2
              </button>
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === effectiveTotalPages}
              className="px-3 py-2 border border-gray-300 text-sm rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-none shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
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

"use client";

import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiTag,
  FiPercent,
  FiShoppingBag,
  FiChevronRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

interface ApplicableProduct {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  applicableItems: string[];
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
  applicableProducts: ApplicableProduct[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Coupon[];
}

const OffersPage = () => {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOffers, setExpandedOffers] = useState<{
    [key: string]: boolean;
  }>({});

  // Handle product click - redirect to search page with product name
  const handleProductClick = (productTitle: string) => {
    const searchQuery = encodeURIComponent(productTitle);
    router.push(`/search?q=${searchQuery}`);
  };

  // Fetch coupons data
  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/coupon`, { next: { revalidate: 30 } });
      const data: ApiResponse = await response.json();

      if (data.success) {
        setCoupons(data.data);
      } else {
        setError(data.message || "Failed to fetch offers");
      }
    } catch (err) {
      setError("Failed to fetch offers");
      console.error("Error fetching coupons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const toggleExpanded = (couponId: string) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [couponId]: !prev[couponId],
    }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You can add a toast notification here
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  const formatDiscount = (type: string, value: number) => {
    return type === "fixed" ? `₹${value}` : `${value}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Loading Component
  const LoadingSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="h-48 md:h-64 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Error Component
  const ErrorComponent = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="text-center py-12">
        <div className="text-6xl text-red-500 mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Failed to Load Offers
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchCoupons}
          className="bg-red-900 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition">
          Try Again
        </button>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white mt-10 md:py-16 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                🎉 Special Offers & Deals
              </h1>
              <p className="md:text-xl text-lg max-w-3xl mx-auto opacity-90">
                Loading amazing deals just for you...
              </p>
            </div>
          </div>
          <LoadingSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white mt-10 md:py-16 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                🎉 Special Offers & Deals
              </h1>
              <p className="md:text-xl text-lg max-w-3xl mx-auto opacity-90">
                Discover amazing deals and discounts on your favorite dishes
              </p>
            </div>
          </div>
          <ErrorComponent />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white mt-10 md:py-16 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              🎉 Special Offers & Deals
            </h1>
            <p className="md:text-xl text-lg max-w-3xl mx-auto opacity-90">
              Save big on your favorite dishes with our exclusive offers.
              Limited time deals you can&apos;t resist!
            </p>
            <div className="mt-6 flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                {coupons.length} Active Offers Available
              </div>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {coupons.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
                <FiTag className="w-full h-full" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Active Offers
              </h3>
              <p className="text-gray-600 text-lg">
                Check back soon for amazing deals and discounts!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  {/* Offer Header */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold">
                        <FiPercent className="inline mr-1" />
                        {formatDiscount(
                          coupon.discountType,
                          coupon.discountValue
                        )}{" "}
                        OFF
                      </div>
                      <div className="text-sm opacity-90">
                        <FiClock className="inline mr-1" />
                        Valid till {formatDate(coupon.endDate)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      Save{" "}
                      {formatDiscount(
                        coupon.discountType,
                        coupon.discountValue
                      )}
                    </h3>
                    <p className="text-sm opacity-90">
                      On {coupon.applicableProducts.length} selected items
                    </p>
                  </div>

                  {/* Product Preview */}
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FiShoppingBag className="mr-2 text-red-600" />
                        Applicable Items ({coupon.applicableProducts.length})
                      </h4>

                      {/* Show first 3 products */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {coupon.applicableProducts
                          .slice(0, 3)
                          .map((product) => (
                            <div
                              key={product._id}
                              className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                              onClick={() => handleProductClick(product.title)}>
                              <div className="w-full h-16 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                <Image
                                  src={
                                    product.imageUrl || "/placeholder-food.svg"
                                  }
                                  alt={product.title}
                                  width={80}
                                  height={64}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              </div>
                              <p className="text-xs text-gray-600 font-medium line-clamp-2 hover:text-red-600 transition-colors">
                                {product.title}
                              </p>
                              <p className="text-xs text-red-600 font-bold">
                                ₹{product.price}
                              </p>
                            </div>
                          ))}
                      </div>

                      {/* Show more button if there are more than 3 products */}
                      {coupon.applicableProducts.length > 3 && (
                        <button
                          onClick={() => toggleExpanded(coupon._id)}
                          className="w-full text-center text-red-600 text-sm font-medium hover:text-red-700 transition flex items-center justify-center">
                          {expandedOffers[coupon._id]
                            ? "Show Less"
                            : `+${
                                coupon.applicableProducts.length - 3
                              } More Items`}
                          <FiChevronRight
                            className={`ml-1 transition-transform ${
                              expandedOffers[coupon._id] ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      )}

                      {/* Expanded products */}
                      {expandedOffers[coupon._id] &&
                        coupon.applicableProducts.length > 3 && (
                          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                            {coupon.applicableProducts
                              .slice(3)
                              .map((product) => (
                                <div
                                  key={product._id}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                                  onClick={() =>
                                    handleProductClick(product.title)
                                  }>
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                      src={
                                        product.imageUrl ||
                                        "/placeholder-food.svg"
                                      }
                                      alt={product.title}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-red-600 transition-colors">
                                      {product.title}
                                    </p>
                                    <p className="text-sm text-red-600 font-bold">
                                      ₹{product.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                    </div>

                    {/* Coupon Code */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FiTag className="text-red-600 mr-2" />
                          <span className="font-mono font-bold text-lg text-gray-900">
                            {coupon.code}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                          Copy Code
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Usage limit: {coupon.usageLimit} • Status:{" "}
                        {coupon.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OffersPage;

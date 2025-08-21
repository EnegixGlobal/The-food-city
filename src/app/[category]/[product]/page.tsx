"use client";

import Button from "@/app/components/Button";
import Container from "@/app/components/Container";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import RecommendationCard from "@/app/components/RecommendationCard";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaFire, FaLeaf, FaMinus, FaPlus } from "react-icons/fa";
import { FiStar, FiClock, FiPlus, FiMinus } from "react-icons/fi";
import { GiChickenOven, GiNoodles, GiIndiaGate } from "react-icons/gi";
import { FaCartPlus } from "react-icons/fa6";
import { useCartStore } from "@/app/zustand/cartStore";
import CustomizationModal from "@/app/components/CustomizationModal";
import ReviewsModal from "@/app/components/ReviewsModal";
import useUserStore from "@/app/zustand/userStore";
import BottomCart from "@/app/components/BottomCart";

interface AddOn {
  rating: number;
  _id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  isVeg: boolean;
  isCustomizable?: boolean;
  customizableOptions?: Array<{
    option: string;
    price: number;
    isDefault: boolean;
    isAvailable: boolean;
    _id: string;
  }>;
}

interface Review {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  imageUrl?: string;
  isHelpful: boolean;
  helpfullCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  ratingCount: number;
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
  isBestSeller: boolean;
  isVeg: boolean;
  spicyLevel: number;
  prepTime: string;
  isCustomizable?: boolean;
  customizableOptions?: Array<{
    option: string;
    price: number;
    isDefault: boolean;
    isAvailable: boolean;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  addOns: AddOn[]; // retained for backward compatibility but no longer shown in UI
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Product;
}

interface ProductPageProps {
  params: Promise<{
    product: string;
  }>;
}

function ProductPage({ params }: ProductPageProps) {
  const [productSlug, setProductSlug] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  // Similar products
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  // Cart store
  const {
    addProductToCart,
    cart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useCartStore();

  const { user } = useUserStore();

  // Format date for reviews
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle helpful status update
  const handleHelpfulUpdate = async (reviewId: string, isHelpful: boolean) => {
    try {
      const response = await fetch(`/api/review/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isHelpful }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the local reviews state
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === reviewId
              ? { ...review, isHelpful, helpfullCount: data.data.helpfulCount }
              : review
          )
        );
      } else {
        console.error("Failed to update helpful status:", data.message);
      }
    } catch (error) {
      console.error("Error updating helpful status:", error);
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/review/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // Remove the review from local state
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== reviewId)
        );

        // Refresh product data to update average rating
        if (product) {
          fetchReviews(product._id);
        }
      } else {
        console.error("Failed to delete review:", data.message);
        alert("Failed to delete review: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review. Please try again.");
    }
  };

  // Handle review update
  const handleUpdateReview = async (
    reviewId: string,
    updatedData: { rating: number; comment: string; imageUrl?: string }
  ) => {
    try {
      const response = await fetch(`/api/review/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (data.success) {
        // Update the review in local state
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === reviewId
              ? {
                  ...review,
                  ...updatedData,
                  updatedAt: new Date().toISOString(),
                }
              : review
          )
        );

        // Refresh product data to update average rating
        if (product) {
          fetchReviews(product._id);
        }
      } else {
        console.error("Failed to update review:", data.message);
        alert("Failed to update review: " + data.message);
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Error updating review. Please try again.");
    }
  };

  // Fetch product data
  const fetchProduct = async (slug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/product/${slug}`, {
        next: { revalidate: 300 },
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProduct(data.data);
        // Fetch reviews after product is loaded
        fetchReviews(data.data._id);
        // Fetch similar products
        fetchSimilar(data.data);
      } else {
        setError(data.message || "Product not found");
      }
    } catch (err) {
      setError("Failed to fetch product details");
      console.error("Error fetching product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch similar products based on same category (excluding current) and optional spice/veg alignment
  const fetchSimilar = async (base: Product) => {
    try {
      setIsLoadingSimilar(true);
      // Build query: same category, larger limit to allow filtering; we'll show up to 30
      const params = new URLSearchParams({
        category: base.category,
        page: "1",
        // API caps limit to 50; requesting 60 gets clamped. Use 50 explicitly.
        limit: "50",
        sortBy: "rating",
        sortOrder: "desc",
      });
      const res = await fetch(
        `/api/product?${params.toString()}`,
        { next: { revalidate: 3600 } } // revalidate every hour
      );
      const data = await res.json();
      if (res.ok && data?.data?.products) {
        let candidates: Product[] = data.data.products.filter(
          (p: Product) => p.slug !== base.slug
        );
        // Optional: prioritize same veg status & similar spicyLevel
        candidates = candidates.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          if (a.isVeg === base.isVeg) scoreA += 2;
          else scoreA -= 1;
          if (b.isVeg === base.isVeg) scoreB += 2;
          else scoreB -= 1;
          scoreA -= Math.abs(a.spicyLevel - base.spicyLevel);
          scoreB -= Math.abs(b.spicyLevel - base.spicyLevel);
          // Higher rating preference
          scoreA += a.rating;
          scoreB += b.rating;
          return scoreB - scoreA;
        });
        const top = candidates.slice(0, 30);
        // Debug log to verify count in browser console
        console.log(
          "Similar products fetched:",
          candidates.length,
          "showing",
          top.length
        );
        setSimilarProducts(top);
      } else {
        setSimilarProducts([]);
      }
    } catch (e) {
      console.error("Error fetching similar products", e);
      setSimilarProducts([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  // Fetch reviews for the product
  const fetchReviews = async (productId: string) => {
    try {
      setIsLoadingReviews(true);
      const response = await fetch(`/api/review?productId=${productId}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
      } else {
        console.error("Failed to fetch reviews:", data.message);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Use useEffect to handle the async params
  useEffect(() => {
    window.scrollTo(0, 0);
    const getParams = async () => {
      const resolvedParams = await params;
      setProductSlug(resolvedParams.product);
      fetchProduct(resolvedParams.product);
    };
    getParams();
  }, [params]);

  // Handle add to cart with quantity reset
  const handleAddtocart = () => {
    if (!product) return;

    try {
      // Check if product is customizable
      if (
        product.isCustomizable &&
        product.customizableOptions &&
        product.customizableOptions.length > 0
      ) {
        // Show customize modal for customizable items
        setShowCustomizationModal(true);
        return;
      }

      // Normalize product data for cart store
      const normalizedProduct = {
        _id: product._id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountedPrice: product.discountedPrice,
        category: product.category,
        imageUrl: product.imageUrl,
        isVeg: product.isVeg,
        isBestSeller: product.isBestSeller,
        spicyLevel: product.spicyLevel,
        prepTime: parseInt(product.prepTime) || 30, // Convert string to number
        rating: product.rating,
      };

      addProductToCart(normalizedProduct, quantity, selectedAddons);

      // Reset quantity to 1 after adding to cart
      setQuantity(1);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  // Handle customization selection and add to cart
  const handleCustomizationAdd = (selectedOption: any) => {
    if (!product) return;

    try {
      // Normalize product data for cart store
      const normalizedProduct = {
        _id: product._id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountedPrice: product.discountedPrice,
        category: product.category,
        imageUrl: product.imageUrl,
        isVeg: product.isVeg,
        isBestSeller: product.isBestSeller,
        spicyLevel: product.spicyLevel,
        prepTime: parseInt(product.prepTime) || 30, // Convert string to number
        rating: product.rating,
      };

      addProductToCart(
        normalizedProduct,
        quantity,
        selectedAddons,
        selectedOption
      );

      // Reset quantity to 1 after adding to cart
      setQuantity(1);
    } catch (error) {
      console.error("Error adding customized product to cart:", error);
    }
  };

  // Show loading state while productSlug is being resolved
  if (!productSlug) {
    return (
      <>
        <Navbar />
        <div className="bg-gradient-to-b from-red-50 to-white min-h-screen pb-12">
          <Container>
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading product details...</p>
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  // Check if current product is in cart (any variant)
  const isItemInCart = product
    ? cart.some((cartItem: any) => cartItem._id === product._id)
    : false;

  // Get the cart item for this product
  const cartItem =
    product && isItemInCart
      ? cart.find((cartItem: any) => cartItem._id === product._id)
      : null;

  const itemQuantityInCart = cartItem ? cartItem.quantity : 0;

  // Handle increment quantity in cart
  const handleIncrementCart = () => {
    try {
      if (cartItem && cartItem.cartItemId) {
        incrementQuantity(cartItem.cartItemId);
      }
    } catch (error) {
      console.error("Error incrementing quantity:", error);
    }
  };

  // Handle decrement quantity in cart
  const handleDecrementCart = () => {
    try {
      if (cartItem && cartItem.cartItemId) {
        if (itemQuantityInCart <= 1) {
          // Remove item if quantity is 1 or less
          removeFromCart(cartItem.cartItemId);
        } else {
          decrementQuantity(cartItem.cartItemId);
        }
      }
    } catch (error) {
      console.error("Error decrementing quantity:", error);
    }
  };

  const getCategoryIcon = () => {
    if (!product) return <GiIndiaGate className="text-3xl text-red-900" />;
    switch (product.category) {
      case "indian":
        return <GiIndiaGate className="text-3xl text-red-900" />;
      case "chinese":
        return <GiNoodles className="text-3xl text-red-900" />;
      case "south-indian":
        return <FaLeaf className="text-3xl text-red-900" />;
      case "tandoor":
        return <GiChickenOven className="text-3xl text-red-900" />;
      default:
        return <GiIndiaGate className="text-3xl text-red-900" />;
    }
  };

  // Loading Skeleton Component
  const ProductSkeleton = () => (
    <Container>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Skeleton */}
        <div className="lg:w-1/2">
          <div className="sticky top-14">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="w-full h-96 lg:h-[500px] bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse mb-6"></div>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            <div className="mb-6">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="w-24 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );

  // Error Component
  const ErrorComponent = () => (
    <Container>
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl text-red-500 mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchProduct(productSlug)}>Try Again</Button>
        </div>
      </div>
    </Container>
  );

  // Show loading state while fetching
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-gradient-to-b from-red-50 to-white min-h-screen pb-12">
          <ProductSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  // Show error state if product not found
  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="bg-gradient-to-b from-red-50 to-white min-h-screen pb-12">
          <ErrorComponent />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-b from-red-50 to-white min-h-screen pb-12">
        {/* Product Section */}

        <Container>
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
            {/* Left Column - Product Image */}
            <div className="lg:w-1/2">
              <div className="sticky top-14">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-64 sm:h-96 object-cover lg:h-[500px]"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4 justify-between">
                  <div className="flex items-center gap-1">
                    <div className="text-xl sm:text-3xl text-red-900">
                      {getCategoryIcon()}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {product.category.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-gray-500 font-thin text-right">
                    {product.isCustomizable && "Customisable"}
                  </p>
                </div>

                {/* Product Name and Rating */}
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {product.title}
                  </h1>
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full flex-shrink-0">
                    <FiStar className="text-yellow-500 mr-1 text-sm" />
                    <span className="font-bold text-sm">
                      {product.rating?.toFixed(1) || "New"}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                  {product.discountedPrice && !product.isCustomizable ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xl sm:text-2xl font-bold text-red-900">
                        ₹{product.discountedPrice.toFixed(2)}
                      </p>
                      <p className="text-base sm:text-lg text-gray-500 line-through">
                        ₹{product.price.toFixed(2)}
                      </p>

                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        {Math.round(
                          ((product.price - product.discountedPrice) /
                            product.price) *
                            100
                        )}
                        % OFF
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold text-red-900">
                      ₹
                      {product.customizableOptions?.[0]?.price?.toFixed(2) ||
                        product.price.toFixed(1)}
                    </p>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiClock className="mr-1 text-xs sm:text-sm" />
                    <span>{product.prepTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaFire className="mr-1 text-xs sm:text-sm" />
                    <span>
                      {["Mild", "Medium", "Hot", "Extra Hot"][
                        product.spicyLevel
                      ] || "Mild"}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.isVeg
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {product.isVeg ? "VEG" : "NON-VEG"}
                  </div>
                  {product.isBestSeller && (
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                      BESTSELLER
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  {isItemInCart ? (
                    // Quantity Controls for items already in cart
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                      <button
                        onClick={handleDecrementCart}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                      >
                        <FaMinus className="text-xs sm:text-sm" />
                      </button>

                      <div className="flex flex-col items-center mx-4">
                        <span className="text-xs text-green-600 font-medium">
                          In Cart
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-green-700">
                          {itemQuantityInCart}
                        </span>
                      </div>

                      <button
                        onClick={handleIncrementCart}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                      >
                        <FaPlus className="text-xs sm:text-sm" />
                      </button>
                    </div>
                  ) : (
                    // Regular quantity selector and add to cart
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center border border-gray-300 rounded-full">
                          <button
                            onClick={() =>
                              setQuantity((prev) => Math.max(1, prev - 1))
                            }
                            className="p-2 text-gray-600 hover:text-red-900"
                          >
                            <FiMinus className="text-sm" />
                          </button>
                          <span className="px-3 sm:px-4 font-medium text-sm sm:text-base">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity((prev) => prev + 1)}
                            className="p-2 text-gray-600 hover:text-red-900"
                          >
                            <FiPlus className="text-sm" />
                          </button>
                        </div>

                        <Button
                          onClick={handleAddtocart}
                          className="flex-1 ml-2 sm:ml-4 py-2 sm:py-3 bg-red-900 hover:bg-red-800 text-sm sm:text-base"
                        >
                          <span className="flex items-center justify-center gap-1 sm:gap-2">
                            <FaCartPlus className="text-sm" />
                            <span className="hidden sm:inline">
                              ADD TO CART{" "}
                            </span>
                            <span className="sm:hidden">ADD</span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Customer Reviews ({reviews.length})
                  </h3>
                  {product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(product.rating)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div
                        key={review._id}
                        className="border-b border-gray-100 pb-4 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          {/* User Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {review.userId.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1">
                            {/* User Name and Rating */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {review.userId.name}
                                </h4>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= review.rating
                                          ? "text-yellow-500 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>

                            {/* Review Comment */}
                            <p className="text-sm text-gray-700 leading-relaxed mb-2">
                              {review.comment}
                            </p>

                            {/* Review Image */}
                            {review.imageUrl && (
                              <div className="mt-2">
                                <Image
                                  src={review.imageUrl}
                                  alt="Review image"
                                  width={100}
                                  height={100}
                                  className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(review.imageUrl, "_blank")
                                  }
                                />
                              </div>
                            )}

                            {/* Helpful Button */}
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleHelpfulUpdate(
                                    review._id,
                                    !review.isHelpful
                                  )
                                }
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                  review.isHelpful
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                <svg
                                  className={`w-3 h-3 ${
                                    review.isHelpful ? "fill-current" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V9a2 2 0 00-2-2h-.095c-.5 0-.905.031-1.312.09C10.279 7.224 9.641 7.5 9 7.5c-1.062 0-2.062.5-2.5 1.5-1 2.5-1.5 4-1.5 6.5 0 1.036.208 2.047.61 2.985A2.95 2.95 0 007 19.5c1.216 0 2.357-.596 3.047-1.578l.953-1.354"
                                  />
                                </svg>
                                {review.isHelpful
                                  ? "Helpful"
                                  : "Mark as helpful"}
                              </button>
                              {review.helpfullCount > 0 && (
                                <span className="text-xs text-gray-500">
                                  {review.helpfullCount} found this helpful
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show All Reviews Button */}
                    {reviews.length > 3 && (
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => setShowReviewsModal(true)}
                          className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                        >
                          <span>Show All {reviews.length} Reviews</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-3xl sm:text-4xl text-gray-300 mb-2">
                      ⭐
                    </div>
                    <p className="text-sm sm:text-base text-gray-500">
                      No reviews yet
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Be the first to review this item!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* You May Also Like - Similar Products */}
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              You May Also Like
            </h2>
            {isLoadingSimilar ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex md:px-20 border-t border-gray-300 py-4"
                  >
                    <div className="flex-1 space-y-2 pr-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="w-40 h-40 bg-gray-200 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : similarProducts.length > 0 ? (
              <div>
                {similarProducts.map((sp) => (
                  <RecommendationCard
                    key={sp._id}
                    item={{
                      id: sp._id,
                      name: sp.title,
                      price: sp.discountedPrice || sp.price,
                      rating: sp.rating,
                      ratingCount: sp.ratingCount,
                      image: sp.imageUrl,
                      isVeg: sp.isVeg,
                      description: sp.description,
                      isCustomizable: sp.isCustomizable,
                      customizableOptions:
                        sp.customizableOptions?.map((o) => ({
                          option: o.option,
                          price: o.price,
                        })) || [],
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                No similar products found.
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Customization Modal */}
      <CustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        item={{
          _id: product._id,
          title: product.title,
          imageUrl: product.imageUrl,
          price: product.price,
          discountedPrice: product.discountedPrice,
          isCustomizable: product.isCustomizable,
          customizableOptions: product.customizableOptions,
        }}
        onAddToCart={handleCustomizationAdd}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        reviews={reviews}
        productTitle={product.title}
        onHelpfulUpdate={handleHelpfulUpdate}
        onDeleteReview={handleDeleteReview}
        onUpdateReview={handleUpdateReview}
        currentUserId={user?.id}
      />
      <BottomCart />
      <Footer />
    </>
  );
}

export default ProductPage;

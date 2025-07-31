"use client";

import Button from "@/app/components/Button";
import Container from "@/app/components/Container";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import RecommendationCard from "@/app/components/RecommendationCard";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaFire, FaLeaf } from "react-icons/fa";
import { FiStar, FiClock, FiPlus, FiMinus } from "react-icons/fi";
import { GiChickenOven, GiNoodles, GiIndiaGate } from "react-icons/gi";

interface AddOn {
  rating: number;
  _id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  isVeg: boolean;
}

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
  isBestSeller: boolean;
  isVeg: boolean;
  spicyLevel: number;
  prepTime: string;
  createdAt: string;
  updatedAt: string;
  addOns: AddOn[];
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product data
  const fetchProduct = async (slug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/product/${slug}`);
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setProduct(data.data);
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

  // Use useEffect to handle the async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setProductSlug(resolvedParams.product);
      fetchProduct(resolvedParams.product);
    };
    getParams();
  }, [params]);

  // Mock data - in a real app, you would fetch this based on the productSlug
  // This is just an example - you should replace with your actual data fetching logic

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

  // Related products based on category
  const relatedProducts = [
    {
      id: 233,
      name: "Chicken Tikka",
      price: 13.99,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      isVeg: false,
      description:
        "Succulent chicken pieces marinated in spices and grilled to perfection.",
    },
    {
      id: 354,
      name: "Seekh Kebab",
      price: 12.99,
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      isVeg: false,
      description: "Spiced minced meat skewers, grilled to perfection.",
    },
    {
      id: 444,
      name: "Paneer Tikka",
      price: 11.99,
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80",
      isVeg: true,
      description:
        "Grilled paneer cubes marinated in spices, served with mint chutney.",
    },
  ];

  const handleAddToCart = () => {
    if (!product) return;
    const totalPrice = (product.discountedPrice || product.price) * quantity;
    
    console.log(`Added ${quantity} ${product.title} to cart with total price: ₹${totalPrice}`);
  };

  const getTotalPrice = () => {
    if (!product) return 0;
    return product.discountedPrice || product.price;
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchProduct(productSlug)}>
            Try Again
          </Button>
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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Product Image */}
            <div className="lg:w-1/2">
              <div className="sticky top-14">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-96 object-cover lg:h-[500px]"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl shadow-md p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {getCategoryIcon()}
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {product.category.replace("-", " ")}
                  </span>
                </div>

                {/* Product Name and Rating */}
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.title}
                  </h1>
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                    <FiStar className="text-yellow-500 mr-1" />
                    <span className="font-bold">{product.rating || 'New'}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {product.discountedPrice ? (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-red-900">
                        ₹{product.discountedPrice.toFixed(2)}
                      </p>
                      <p className="text-lg text-gray-500 line-through">
                        ₹{product.price.toFixed(2)}
                      </p>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-red-900">
                      ₹{product.price.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-1" />
                    <span>{product.prepTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaFire className="mr-1" />
                    <span>
                      {
                        ["Mild", "Medium", "Hot", "Extra Hot"][
                          product.spicyLevel
                        ] || "Mild"
                      }
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.isVeg
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}>
                    {product.isVeg ? "VEG" : "NON-VEG"}
                  </div>
                  {product.isBestSeller && (
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                      BESTSELLER
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="flex items-center border border-gray-300 rounded-full">
                    <button
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className="p-2 text-gray-600 hover:text-red-900">
                      <FiMinus />
                    </button>
                    <span className="px-4 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="p-2 text-gray-600 hover:text-red-900">
                      <FiPlus />
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 ml-4 py-2">
                    ADD TO CART - ₹{(getTotalPrice() * quantity).toFixed(2)}
                  </Button>
                </div>
              </div>

              {/* Reviews Section - Show placeholder since API doesn't have reviews */}
              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Customer Reviews
                </h3>
                <div className="text-center py-8">
                  <div className="text-4xl text-gray-300 mb-2">⭐</div>
                  <p className="text-gray-500">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to review this item!</p>
                </div>
              </div>
            </div>
          </div>

          {/* You May Also Like - Show Add-ons */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="">
              {product.addOns && product.addOns.length > 0 ? (
                product.addOns.map((addon, index) => (
                  <RecommendationCard 
                    key={addon._id} 
                    item={{
                      id: index + 1000, // Use index + offset to create unique number ID
                      name: addon.title,
                      price: addon.price,
                      rating: addon.rating, // Default rating for add-ons
                      image: addon.imageUrl,
                      isVeg: addon.isVeg,
                      description: addon.description,
                    }}
                  />
                ))
              ) : (
                relatedProducts.map((item) => (
                  <RecommendationCard key={item.id} item={item} />
                ))
              )}
            </div>
          </div>
        </Container>
      </div>

      <Footer />
    </>
  );
}

export default ProductPage;

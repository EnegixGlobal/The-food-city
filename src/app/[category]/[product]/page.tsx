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
import { FaCartShopping, FaCartPlus } from "react-icons/fa6";
import { useCartStore } from "@/app/zustand/cartStore";
import { useAddonStore } from "@/app/zustand/addonStore";
import CustomizationModal from "@/app/components/CustomizationModal";

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
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  // Cart store
  const {
    addProductToCart,
    isProductInCart,
    cart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useCartStore();

  const { addons } = useAddonStore();

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

  // Handle addon selection
  const handleAddonToggle = (addon: AddOn) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a._id === addon._id);
      if (exists) {
        return prev.filter((a) => a._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  // Check if addon is selected
  const isAddonSelected = (addonId: string) => {
    return selectedAddons.some((addon) => addon._id === addonId);
  };

  // Calculate total price including addons
  const getTotalPrice = () => {
    if (!product) return 0;
    const basePrice = product.discountedPrice || product.price;
    const addonsPrice = selectedAddons.reduce(
      (sum, addon) => sum + addon.price,
      0
    );
    return basePrice + addonsPrice;
  };

  // Handle add to cart
  const handleAddToCart = () => {
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

      addProductToCart(normalizedProduct, quantity, selectedAddons);

      // Show success message or update UI
      console.log(
        `Added ${quantity} ${product.title} to cart with ${selectedAddons.length} addons`
      );
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

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

      // Show success message or update UI
      console.log(
        `Added ${quantity} ${product.title} to cart with ${selectedAddons.length} addons`
      );
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

      // Show success message or update UI
      console.log(
        `Added ${quantity} ${product.title} to cart with customization: ${selectedOption.option}`
      );
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

  const getTotalprice = () => {
    if (!product) return 0;
    const basePrice = product.discountedPrice || product.price;
    const addonsPrice = selectedAddons.reduce(
      (sum, addon) => sum + addon.price,
      0
    );
    return basePrice + addonsPrice;
  };

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
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="text-xl sm:text-3xl text-red-900">
                    {getCategoryIcon()}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {product.category.replace("-", " ")}
                  </span>
                </div>

                {/* Product Name and Rating */}
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {product.title}
                  </h1>
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full flex-shrink-0">
                    <FiStar className="text-yellow-500 mr-1 text-sm" />
                    <span className="font-bold text-sm">{product.rating || "New"}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                  {product.discountedPrice ? (
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
                      ₹{product.price.toFixed(2)}
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
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  {isItemInCart ? (
                    // Quantity Controls for items already in cart
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                      <button
                        onClick={handleDecrementCart}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
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
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
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
                            className="p-2 text-gray-600 hover:text-red-900">
                            <FiMinus className="text-sm" />
                          </button>
                          <span className="px-3 sm:px-4 font-medium text-sm sm:text-base">{quantity}</span>
                          <button
                            onClick={() => setQuantity((prev) => prev + 1)}
                            className="p-2 text-gray-600 hover:text-red-900">
                            <FiPlus className="text-sm" />
                          </button>
                        </div>

                        <Button
                          onClick={handleAddtocart}
                          className="flex-1 ml-2 sm:ml-4 py-2 sm:py-3 bg-red-900 hover:bg-red-800 text-sm sm:text-base">
                          <span className="flex items-center justify-center gap-1 sm:gap-2">
                            <FaCartPlus className="text-sm" />
                            <span className="hidden sm:inline">ADD TO CART - </span>
                            <span className="sm:hidden">ADD - </span>
                            ₹{(getTotalprice() * quantity).toFixed(2)}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section - Show placeholder since API doesn't have reviews */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Customer Reviews
                </h3>
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl text-gray-300 mb-2">⭐</div>
                  <p className="text-sm sm:text-base text-gray-500">No reviews yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Be the first to review this item!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* You May Also Like - Show Add-ons */}
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
              You May Also Like
            </h2>
            <div className="">
              {product.addOns && product.addOns.length > 0 ? (
                product.addOns.map((addon) => (
                  <RecommendationCard
                    key={addon._id}
                    item={{
                      id: addon._id, // Use the actual _id from database
                      name: addon.title,
                      price: addon.price,
                      rating: addon.rating || 4.5, // Default rating for add-ons
                      image: addon.imageUrl,
                      isVeg: addon.isVeg,
                      description: addon.description,
                      isCustomizable: addon.isCustomizable || false,
                      customizableOptions:
                        addon.customizableOptions
                          ?.filter((option) => option.isAvailable)
                          .map((option) => ({
                            option: option.option,
                            price: option.price,
                          })) || [],
                    }}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No add-ons available for this product.
                </div>
              )}
            </div>
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

      <Footer />
    </>
  );
}

export default ProductPage;

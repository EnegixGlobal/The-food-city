import Image from "next/image";
import React, { useState } from "react";
import Button from "./Button";
import { FiClock, FiStar } from "react-icons/fi";
import { FaFire, FaRupeeSign, FaMinus, FaPlus } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa6";
import Link from "next/link";
import { useCartStore } from "../zustand/cartStore.js";
import CustomizationModal from "./CustomizationModal";

interface MainCardProps {
  className?: string;
  category?: string;
  isOnHome?: boolean;
  item?: {
    _id?: string;
    description: string;
    imageUrl: string;
    title: string;
    id?: number;
    slug: string;
    name?: string;
    price: number;
    discountedPrice?: number;
    image?: string;
    rating: number;
    prepTime: string;
    spicyLevel: number;
    isVeg: boolean;
    isBestseller?: boolean;
    isBestSeller?: boolean;
    ratingCount: number;
    isCustomizable?: boolean;
    customizableOptions?: Array<{
      option: string;
      price: number;
    }>;
  };
}

function MainCard({
  className = "",
  item,
  category,
  isOnHome,
  ...props
}: MainCardProps) {
  const {
    addProductToCart,
    addToCart,
    isInCart, // Legacy fallback
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    cart,
  } = useCartStore();

  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  if (!item) {
    return null; // or render a fallback UI
  }

  // Normalize item data
  const normalizedItem = {
    _id: item._id || String(item.id) || `item-${Date.now()}`,
    title: item.title || item.name || "Untitled Item",
    slug: item.slug,
    price: item.price,
    discountedPrice: item.discountedPrice,
    category: category || "general",
    imageUrl: item.imageUrl || item.image || "/placeholder-food.svg",
    isVeg: item.isVeg,
    isBestSeller: item.isBestseller || item.isBestSeller,
    rating: item.rating,
    prepTime:
      typeof item.prepTime === "string"
        ? parseInt(item.prepTime) || 0
        : item.prepTime || 0,
    spicyLevel: item.spicyLevel,
    description: item.description,
    isCustomizable: item.isCustomizable || false,
    customizableOptions: item.customizableOptions || [],
  };

  const handleAddToCart = () => {
    try {
      // Check if item is customizable
      if (
        normalizedItem.isCustomizable &&
        normalizedItem.customizableOptions &&
        normalizedItem.customizableOptions.length > 0
      ) {
        // Show customize modal for customizable items
        setShowCustomizationModal(true);
        return;
      }

      // Use new cart store method if item has MongoDB structure
      if (item._id || (item.title && category)) {
        addProductToCart(normalizedItem, 1, []); // Add product with no addons
      } else {
        // Fallback to legacy method
        addToCart({
          id: item.id,
          name: item.name || item.title,
          price: item.price,
          rating: item.rating,
          slug: item.slug,
          imageUrl: normalizedItem.imageUrl,
          category: category || "general",
          isVeg: item.isVeg,
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handleCustomizationAdd = (selectedOption: any) => {
    try {
      addProductToCart(normalizedItem, 1, [], selectedOption);
    } catch (error) {
      console.error("Error adding customized item to cart:", error);
    }
  };

  // Check if any variant of this product (with any customization) is in cart
  const isItemInCart = item._id
    ? cart.some((cartItem: any) => cartItem._id === normalizedItem._id) // Check if base product is in cart
    : isInCart(String(item.id));

  // Get the first cart item for this product (there might be multiple with different customizations)
  const cartItem = item._id
    ? cart.find((cartItem: any) => cartItem._id === normalizedItem._id)
    : cart.find((cartItem: any) => cartItem.id === String(item.id));

  const itemQuantity = cartItem ? cartItem.quantity : 0;

  // Check if item is customizable
  const isCustomizable = normalizedItem.isCustomizable;

  const handleIncrement = () => {
    try {
      if (cartItem && cartItem.cartItemId) {
        incrementQuantity(cartItem.cartItemId);
      }
    } catch (error) {
      console.error("Error incrementing quantity:", error);
    }
  };

  const handleDecrement = () => {
    try {
      if (cartItem && cartItem.cartItemId) {
        if (itemQuantity <= 1) {
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

  const spiceLevels = [
    { level: 0, label: "Mild", color: "bg-green-100 text-green-800" },
    { level: 1, label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { level: 2, label: "Hot", color: "bg-orange-100 text-orange-800" },
    { level: 3, label: "Extra Hot", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div
      className={`w-full md:max-w-[280px] max-w-[190px] 
                  flex-shrink-0 
                  bg-white rounded-xl shadow-sm overflow-hidden 
                  hover:shadow-xl transition-all duration-300 
                  ${className}`}
      {...props}>
      {/* Item Image */}
      <Link href={`/${category}/${item.slug}`}>
        <div className="relative  md:h-54 h-48 overflow-hidden">
          <Image
            src={normalizedItem.imageUrl}
            alt={normalizedItem.title}
            width={350}
            height={200}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-0 left-0 flex gap-2">
            {normalizedItem.isBestSeller && (
              <span className="bg-yellow-400 text-red-900 px-2 py-1 rounded-br-2xl text-xs font-bold flex items-center">
                <FiStar size={12} className="mr-1" />
                Bestseller
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 flex gap-2">
            {normalizedItem.isCustomizable && (
              <span className=" text-gray-300 font-light px-2 py-1 rounded-br-2xl text-xs md:text-sm  flex items-center">
                Customizable
              </span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 flex ">
            {item.isVeg && (
              <span className="">
                <Image
                  src="/veg.svg"
                  alt="Vegetarian"
                  width={18}
                  height={18}
                  className="bg-white"
                />
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Item Details */}
      <div className="md:p-3 p-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm md:text-[16px] line-clamp-1 max-w-[170px] font-bold text-gray-800">
            {normalizedItem.title}
          </h3>
          <div className="flex flex-col items-end">
            {/* Base Price Display - Following new pricing logic */}
            {normalizedItem.discountedPrice ? (
              // Show discounted price with original price crossed out
              <div className="flex flex-col items-end">
                <span className="text-red-600 flex items-center font-bold text-sm md:text-md">
                  <FaRupeeSign className="h-3" />
                  {normalizedItem.discountedPrice.toFixed(2)}
                </span>
                <span className="text-gray-400 flex items-center line-through text-xs">
                  {normalizedItem.price > 0 && (
                    <>
                      <FaRupeeSign className="h-3" />
                      {normalizedItem.price.toFixed(2)}
                    </>
                  )}
                </span>
              </div>
            ) : normalizedItem.price ? (
              // Show regular price
              <span className="text-red-600 flex items-center font-bold text-sm md:text-md">
                <FaRupeeSign className="h-3" />
                {normalizedItem.price.toFixed(2)}
              </span>
            ) : normalizedItem.isCustomizable &&
              normalizedItem.customizableOptions?.length > 0 ? (
              // Fallback: Show first customization option price
              <div className="flex flex-col items-end">
                <span className="text-red-600 flex items-center font-bold text-sm md:text-md">
                  <FaRupeeSign className="h-3" />
                  {normalizedItem.customizableOptions[0].price.toFixed(2)}
                </span>
              </div>
            ) : (
              // Safety fallback
              <span className="text-red-600 flex items-center font-bold text-sm md:text-md">
                <FaRupeeSign className="h-3" />
                0.00
              </span>
            )}
          </div>
        </div>

        {!isOnHome && (
          <p className="mb-2 text-sm text-gray-700 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Meta Info - Vertical Stack for Mobile */}
        <div className="mb-3 md:flex md:justify-between space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <FiStar className="text-yellow-400" size={10} />
              <span>
                {item.rating.toFixed(1)} ({item.ratingCount})
              </span>
            </div>
            <div className="flex md:ml-4 items-center gap-1">
              <FiClock className="text-gray-400" size={10} />
              <span>{item.prepTime} min</span>
            </div>
          </div>
          <div className="flex items-left text-left justify-start">
            <div className="flex items-center gap-1">
              <FaFire className="text-red-400" size={10} />
              <span className="text-xs">
                {spiceLevels[item.spicyLevel].label}
              </span>
            </div>
          </div>
        </div>

        {isItemInCart ? (
          // Modern Compact Cart Design
          <div className="bg-green-500 text-white rounded-lg p-2">
            <div className="flex items-center justify-between">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <FaMinus className="text-xs" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {itemQuantity} in cart
                </span>
              </div>

              <button
                onClick={handleIncrement}
                className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <FaPlus className="text-xs" />
              </button>
            </div>
          </div>
        ) : (
          // Regular Add to Cart Button
          <Button
            onClick={handleAddToCart}
            className={`w-full rounded-md  bg-white! border! text-green-600! hover:bg-green-50 transition-colors `}>
            <span className="flex items-center justify-center gap-2 text-sm">
              {isCustomizable ? (
                <>
                  <FaCartPlus />
                  ADD
                </>
              ) : (
                <>
                  <FaCartPlus />
                  ADD
                </>
              )}
            </span>
          </Button>
        )}
      </div>

      {/* Customization Modal */}
      <CustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        item={normalizedItem}
        onAddToCart={handleCustomizationAdd}
      />
    </div>
  );
}

export default MainCard;

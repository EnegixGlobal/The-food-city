import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import { FiStar } from "react-icons/fi";
import { useCartStore } from "../zustand/cartStore";
import CardSkeleton from "./CardSkeleton";
import { FaCartShopping } from "react-icons/fa6";
import { FaCartPlus, FaRupeeSign } from "react-icons/fa";
import Link from "next/link";
import CustomizationModal from "./CustomizationModal";

interface CartProps {
  className?: string;
  item?: {
    _id?: string; // MongoDB ID
    category: any;
    ratingCount: number;
    title: string;
    imageUrl: string;
    id?: number; // Legacy ID for backward compatibility
    slug?: string;
    name?: string; // Alternative name field
    price: number | string;
    discountedPrice?: number;
    image?: string; // Alternative image field
    rating: number;
    isVeg?: boolean;
    description?: string;
    isCustomizable?: boolean;
    customizableOptions?: Array<{
      option: string;
      price: number;
    }>;
  };
}

function Card({ className = "", item, ...props }: CartProps) {
  const {
    addProductToCart,
    addToCart, // Legacy fallback
    isProductInCart,
    isInCart, // Legacy fallback
    getCartItems,
  } = useCartStore((state) => state);

  const [cartItems, setCartItems] = useState([]);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  useEffect(() => {
    const items = getCartItems();
    setCartItems(items);
  }, [getCartItems]);

  if (!item) {
    return <CardSkeleton />;
  }

  // Normalize item data to handle both old and new formats
  const normalizedItem = {
    _id: item._id || String(item.id) || `item-${Date.now()}`,
    title: item.title || item.name || "Untitled Item",
    slug:
      item.slug ||
      (item.title || item.name || "untitled")
        .toLowerCase()
        .replace(/\s+/g, "-"),
    price:
      typeof item.price === "string"
        ? parseFloat(item.price.replace("$", "").replace("₹", ""))
        : item.price,
    discountedPrice: item.discountedPrice,
    category: item.category || "general",
    imageUrl: item.imageUrl || item.image || "/placeholder-food.svg",
    isVeg: item.isVeg || false,
    rating: item.rating || 0,
    description: item.description || "",
    isCustomizable: item.isCustomizable || false,
    customizableOptions: item.customizableOptions || [],
  };

  const handleAddToCart = () => {
    try {
      // Check if item is customizable and already in cart
      if ((item.isCustomizable || normalizedItem.isCustomizable) && isItemInCart) {
        // Show customize modal/options instead of adding directly
        setShowCustomizationModal(true);
        return;
      }

      // Use new cart store method if item has MongoDB structure
      if (item._id || (item.title && item.category)) {
        addProductToCart(normalizedItem, 1, []); // Add product with no addons
      } else {
        // Fallback to legacy method for backward compatibility
        addToCart({
          id: item.id,
          name: item.name || item.title,
          price: normalizedItem.price,
          rating: normalizedItem.rating,
          slug: normalizedItem.slug,
          imageUrl: normalizedItem.imageUrl,
          category: normalizedItem.category,
          isVeg: normalizedItem.isVeg,
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

  // Check if item is in cart (try both new and old methods)
  const isItemInCart = item._id
    ? isProductInCart(normalizedItem._id, [])
    : isInCart(String(item.id));

  // Check if item is customizable
  const isCustomizable = item.isCustomizable || normalizedItem.isCustomizable;

  return (
    <div
      className={`w-full md:max-w-[280px] max-w-[180px] 
                  flex-shrink-0 
                  bg-white rounded-xl shadow-md overflow-hidden 
                  hover:shadow-xl transition-all duration-300 
                  ${className}`}
      {...props}>
      <Link href={`/${normalizedItem.category}/${normalizedItem.slug}`}>
        <div className="overflow-hidden">
          <Image
            src={normalizedItem.imageUrl}
            alt={normalizedItem.title}
            width={80}
            height={100}
            className="w-full md:h-[210px] h-[180px] aspect-square object-cover transition-transform duration-500 hover:scale-102"
          />
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="mt-1.5 text-sm md:text-[16px] line-clamp-1 font-bold text-gray-800 mb-2 max-w-[170px]">
            {normalizedItem.title}
          </h3>

          <div className="flex items-center">
            <FiStar className="text-yellow-400 mr-1" />
            <span className="flex items-center justify-center">
              {normalizedItem.rating.toFixed(1)} {`(${item.ratingCount || 0})`}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {normalizedItem.discountedPrice ? (
              <>
                <span className="text-red-600 font-bold flex items-center justify-center text-xs md:text-sm">
                  <FaRupeeSign />
                  {normalizedItem.discountedPrice.toFixed(2)}
                </span>
                <span className="text-gray-400 line-through text-xs flex items-center">
                  <FaRupeeSign />
                  {normalizedItem.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-red-600 font-bold flex items-center justify-center text-xs md:text-sm">
                <FaRupeeSign />
                {normalizedItem.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={false} // Always enabled for customizable items
            className={`text-xs md:text-sm ${
              isItemInCart && !isCustomizable
                ? "bg-green-500! hover:bg-green-600!"
                : isItemInCart && isCustomizable
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white`}>
            <span className="flex items-center justify-center gap-2">
              {isItemInCart && !isCustomizable ? (
                <>
                  <FaCartShopping />
                  Added
                </>
              ) : isItemInCart && isCustomizable ? (
                <>
                  <FaCartPlus />
                  Customize
                </>
              ) : (
                <>
                  <FaCartPlus />
                  Add to Cart
                </>
              )}
            </span>
          </Button>
        </div>
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

export default Card;

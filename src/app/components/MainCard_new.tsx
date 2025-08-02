import Image from "next/image";
import React from "react";
import Button from "./Button";
import { FiClock, FiStar } from "react-icons/fi";
import { FaFire, FaRupeeSign } from "react-icons/fa";
import { FaCartShopping, FaCartPlus } from "react-icons/fa6";
import Link from "next/link";
import { useCartStore } from "../zustand/cartStore";

interface MainCardProps {
  className?: string;
  category?: string;
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
  };
}

function MainCard({ className = "", item, category, ...props }: MainCardProps) {
  const { 
    addProductToCart, 
    addToCart, // Legacy fallback
    isProductInCart, 
    isInCart // Legacy fallback
  } = useCartStore();

  if (!item) {
    return null; // or render a fallback UI
  }

  // Normalize item data
  const normalizedItem = {
    _id: item._id || String(item.id) || `item-${Date.now()}`,
    title: item.title || item.name || 'Untitled Item',
    slug: item.slug,
    price: item.price,
    discountedPrice: item.discountedPrice,
    category: category || 'general',
    imageUrl: item.imageUrl || item.image || '/placeholder-food.svg',
    isVeg: item.isVeg,
    isBestSeller: item.isBestseller || item.isBestSeller,
    rating: item.rating,
    prepTime: item.prepTime,
    spicyLevel: item.spicyLevel,
    description: item.description
  };

  const handleAddToCart = () => {
    try {
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
          category: category || 'general',
          isVeg: item.isVeg
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  // Check if item is in cart
  const isItemInCart = item._id 
    ? isProductInCart(normalizedItem._id, []) 
    : isInCart(String(item.id));

  const spiceLevels = [
    { level: 0, label: "Mild", color: "bg-green-100 text-green-800" },
    { level: 1, label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { level: 2, label: "Hot", color: "bg-orange-100 text-orange-800" },
    { level: 3, label: "Extra Hot", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${className}`}
      {...props}>
      {/* Item Image */}
      <Link href={`/${category}/${item.slug}`}>
        <div className="relative  h-54 overflow-hidden">
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
            {normalizedItem.discountedPrice ? (
              <>
                <span className="text-red-600 flex items-center font-bold text-sm md:text-md">
                  <FaRupeeSign className="h-3" />
                  {normalizedItem.discountedPrice.toFixed(2)}
                </span>
                <span className="text-gray-400 line-through text-xs flex items-center">
                  <FaRupeeSign className="h-2" />
                  {normalizedItem.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-red-600 flex items-center font-bold text-sm md:text-md">
                <FaRupeeSign className="h-3" />
                {normalizedItem.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <p className="mb-2 text-sm text-gray-700 line-clamp-2">{item.description}</p>
        {/* Meta Info */}
        <div className="flex flex-wrap md:gap-4 gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <FiStar className="text-yellow-400 mr-1" />
            <span>
              {item.rating.toFixed(1)} ({item.ratingCount}){" "}
            </span>
          </div>
          <div className="flex items-center">
            <FiClock className="text-gray-400 mr-1" />
            <span>{item.prepTime}</span>
          </div>
          <div className="flex items-center">
            <FaFire className="text-red-400 mr-1" />
            <span>{spiceLevels[item.spicyLevel].label}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          className={`w-full text-sm ${
            isItemInCart
              ? "bg-green-500 hover:bg-green-600"
              : "bg-yellow-500 hover:bg-yellow-600"
          } text-white`}>
          <span className="flex items-center justify-center gap-2">
            {isItemInCart ? <FaCartShopping /> : <FaCartPlus />}
            {isItemInCart ? "ADDED TO CART" : "ADD TO CART"}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default MainCard;

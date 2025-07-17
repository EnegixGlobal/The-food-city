import Image from "next/image";
import React from "react";
import Button from "./Button";
import { FiClock, FiStar } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import Link from "next/link";

function MainCard({
  className = "",
  item,
  category, // Add category prop
  ...props
}: {
  className?: string;
  category?: string; // Add category type
  item?: {
    id: number;
    slug: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    prepTime: string;
    spicyLevel: number;
    isVeg: boolean;
    isBestseller: boolean;
  };
}) {
  if (!item) {
    return null; // or render a fallback UI
  }

  const spiceLevels = [
    { level: 0, label: "Mild", color: "bg-green-100 text-green-800" },
    { level: 1, label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { level: 2, label: "Hot", color: "bg-orange-100 text-orange-800" },
    { level: 3, label: "Extra Hot", color: "bg-red-100 text-red-800" },
  ];

  return (
    <Link href={`/${category}/${item.slug}`}>
      <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${className}`} {...props}>
        {/* Item Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            width={200}
            height={200}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-0 left-0 flex gap-2">
            {item.isBestseller && (
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

        {/* Item Details */}
        <div className="md:p-3 p-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md md:text-lg font-bold text-gray-800">
              {item.name}
            </h3>
            <span className="text-red-600 font-bold text-sm md:text-lg">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap md:gap-4 gap-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <FiStar className="text-yellow-400 mr-1" />
              <span>{item.rating}</span>
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
          <Button className="w-full ">ADD TO CART</Button>
        </div>
      </div>
    </Link>
  );
}

export default MainCard;

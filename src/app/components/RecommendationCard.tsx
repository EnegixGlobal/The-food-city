import Image from "next/image";
import React from "react";
import { FiStar } from "react-icons/fi";
import Button from "./Button";

interface RecommendatedionCardProps {
  item: {
    description: string;
    isVeg: boolean;
    id: number;
    name: string;
    image: string;
    price: number;
    rating: number;
  };
}

function RecommendationCard({ item }: RecommendatedionCardProps) {
  return (
    <div
      key={item.id}
      className=" flex  my-2 md:px-20 overflow-hidden border-t border-gray-300 py-4 transition">
      <div className="md:p-4 p-2 flex-8">
        {item.isVeg && (
          <span className=" text-green-800 rounded-full text-xs font-medium">
            <Image
              src="/veg.svg"
              alt="Vegetarian"
              width={16}
              height={16}
              className="inline-block mr-1"
            />
          </span>
        )}
        <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
        <div className="  items-center">
          <span className="text-red-600 font-bold">
            ₹{item.price.toFixed(2)}
          </span>
          <div className="flex items-center">
            <FiStar className="text-yellow-400 mr-1" />
            <span>{item.rating}</span>
          </div>
        </div>
        <p>{item.description}</p>
      </div>
      <div>
        <Image
          src={item.image}
          alt={item.name}
          width={160}
          height={160}
          className="w-40 h-40 object-cover rounded-2xl"
        />
        <div className="flex  justify-center -mt-3">
          <Button className="relative   text-sm">Add to Cart</Button>
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;

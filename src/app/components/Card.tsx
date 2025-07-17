import Image from "next/image";
import React from "react";
import Button from "./Button";

function Card({
  className = "",
  item,
  ...props
}: {
  className?: string;
  item?: { id: number; name: string; price: string; image: string };
}) {
  if (!item) {
    return null; // or render a fallback UI
  }

  return (
    <div
      className={`w-full md:max-w-[260px]  max-w-[180px] 
                 
                  flex-shrink-0 
                  bg-white rounded-xl shadow-md overflow-hidden 
                  hover:shadow-xl transition-all duration-300 
                  ${className}`}
      {...props}>
      <div className="   overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          width={80}
          height={100}
          className="w-full md:h-[200px] h-[180px] object-cover transition-transform duration-500 hover:scale-102"
        />
      </div>
      <div className="p-3">
        <h3 className=" text-sm md:text-xl font-bold text-gray-800 mb-2 ">
          {item.name}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-red-600 font-bold text-xs md:text-sm">
            {item.price}
          </span>
          <Button className="text-xs md:text-sm">Add to Cart</Button>
        </div>
      </div>
    </div>
  );
}

export default Card;

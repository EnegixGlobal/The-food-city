import React from "react";

interface CartProps {
  className?: string;
  item?: {
    id: number;
    slug: string;
    name: string;
    price: number;
    image: string;
    rating: number;
  };
}

function CardSkeleton({ className = "" }: CartProps) {
  return (
    <div
      className={`w-full md:max-w-[260px] max-w-[180px] 
                 flex-shrink-0 
                 bg-white rounded-xl shadow-md overflow-hidden 
                 hover:shadow-xl transition-all duration-300 
                 ${className}`}
    >
      {/* Image Skeleton */}
      <div className="w-full md:h-[200px] h-[180px] bg-gray-200 animate-pulse"></div>
      
      <div className="p-3">
        {/* Title Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 rounded-full mr-1"></div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Price and Button Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton;
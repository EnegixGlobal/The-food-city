import React from "react";

// Single skeleton card component
function MainCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-md animate-pulse ${className}`}
    >
      {/* Image Skeleton */}
      <div className="relative h-48 bg-gray-200">
        {/* Bestseller badge skeleton */}
        <div className="absolute top-0 left-0">
          <div className="bg-gray-300 h-6 w-20 rounded-br-2xl"></div>
        </div>
        {/* Veg icon skeleton */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-gray-300 h-5 w-5 rounded-full"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="md:p-3 p-2">
        {/* Title and Price */}
        <div className="flex justify-between items-center mb-2">
          <div className="bg-gray-300 h-4 w-32 rounded"></div>
          <div className="bg-gray-300 h-4 w-16 rounded"></div>
        </div>

        {/* Meta Info (Rating, Time, Spice Level) */}
        <div className="flex gap-4 mb-4">
          <div className="bg-gray-300 h-3 w-16 rounded"></div>
          <div className="bg-gray-300 h-3 w-12 rounded"></div>
          <div className="bg-gray-300 h-3 w-14 rounded"></div>
        </div>

        {/* Button Skeleton */}
        <div className="bg-gray-300 h-8 w-full rounded"></div>
      </div>
    </div>
  );
}

// Component that renders two rows of skeleton cards
function MainCardSkeletonGrid({ 
  itemsPerRow = 4, 
  rows = 2, 
  className = "" 
}: { 
  itemsPerRow?: number; 
  rows?: number; 
  className?: string; 
}) {
  const totalItems = itemsPerRow * rows;

  return (
    <div className={`grid grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: totalItems }, (_, index) => (
        <MainCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Export both components
export { MainCardSkeleton, MainCardSkeletonGrid };
export default MainCardSkeletonGrid;

"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import MainCard from "../MainCard";

function Tandoor({ products }: { products: any[] }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!autoScroll) return;

    // Wait 5 seconds, then scroll by 1 item width
    const timeout = setTimeout(() => {
      if (carouselRef.current) {
        const item = carouselRef.current.querySelector("div.flex-shrink-0");
        const itemWidth = item ? (item as HTMLElement).offsetWidth + 24 : 300; // 24px = space-x-6
        const maxScroll =
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        let newPosition = carouselRef.current.scrollLeft + itemWidth;
        if (newPosition > maxScroll) newPosition = 0;
        carouselRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
        setScrollPosition(newPosition);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [scrollPosition, autoScroll]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 300;
      setAutoScroll(false);
      setTimeout(() => setAutoScroll(true), 3000);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 300;
      setAutoScroll(false);
      setTimeout(() => setAutoScroll(true), 3000);
    }
  };

  return (
    <div className="relative mt-8">
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl md:text-3xl  font-bold text-red-800 mb-4">
          Tandoor Cuisine
        </h2>
        <Link href="/tandoor">
          <span className="flex items-center justify-center gap-3 font-bold text-red-800 hover:text-red-700 hover:transform hover:scale-102 transition cursor-pointer">
            View All <FaArrowRight />
          </span>
        </Link>
      </div>
      {products.length >= 5 && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/30 w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition transform hover:scale-110">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      <div
        ref={carouselRef}
        className="flex overflow-x-auto scroll-smooth  py-2 gap-4 scrollbar-hide"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}>
        {products.length === 0 ? (
          <p className="text-center text-xl font-thin text-gray-500">
            No items available for Tandoor cuisine at the moment.
          </p>
        ) : (
          <>
            {products?.map((product: any) => (
              <MainCard
                key={product._id}
                item={product}
                isOnHome={true}
                category="indian"
              />
            ))}
          </>
        )}
      </div>

      {products.length >= 5 && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/30 w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-white/20 transition transform hover:scale-110">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Tandoor;

"use client";

import React, { useEffect, useRef, useState } from "react";
import Card from "../Card";
import { FaArrowRight } from "react-icons/fa";

function Tandoor() {
  const tandoor = [
    {
      id: 10,
      name: "Margherita Pizza",
      price: "$15.99",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 11,
      name: "Pasta Alfredo",
      price: "$13.99",
      image:
        "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 12,
      name: "Garlic Bread",
      price: "$6.99",
      image:
        "https://images.unsplash.com/photo-1608190003443-86a6ab6e567e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 13,
      name: "Tiramisu",
      price: "$8.99",
      image:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1127&q=80",
    },
  ];

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
        <span className="flex items-center justify-center gap-3 font-bold text-red-800 hover:text-red-700 hover:transform hover:scale-102 transition cursor-pointer">
          View All <FaArrowRight />
        </span>
      </div>
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition transform hover:scale-110">
        <svg
          className="w-6 h-6 text-red-600"
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

      <div
        ref={carouselRef}
        className="flex overflow-x-auto scroll-smooth  py-2 gap-4 scrollbar-hide"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}>
        {tandoor.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition transform hover:scale-110">
        <svg
          className="w-6 h-6 text-red-600"
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
    </div>
  );
}

export default Tandoor;

"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import Image from "next/image";
import Container from "./Container";

function Items() {
  const categories = {
    Indian: [
      {
        id: 1,
        name: "Paneer Tikka",
        price: "$12.99",
        image:
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
      {
        id: 2,
        name: "Butter Chicken",
        price: "$14.99",
        image:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
      {
        id: 3,
        name: "Biryani",
        price: "$13.99",
        image:
          "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1188&q=80",
      },
      {
        id: 4,
        name: "Masala Dosa",
        price: "$10.99",
        image:
          "https://images.unsplash.com/photo-1559533083-71f5095f0e1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
      {
        id: 5,
        name: "Samosa",
        price: "$5.99",
        image:
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
    ],
    Chinese: [
      {
        id: 6,
        name: "Manchurian",
        price: "$11.99",
        image:
          "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
      {
        id: 7,
        name: "Fried Rice",
        price: "$10.99",
        image:
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
      {
        id: 8,
        name: "Spring Rolls",
        price: "$8.99",
        image:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
      },
      {
        id: 9,
        name: "Hakka Noodles",
        price: "$12.99",
        image:
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
    ],
    Italian: [
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
    ],
    Tandoor: [
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
    ],
  };

  const [activeCategory, setActiveCategory] = useState("Indian");
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!autoScroll) return;

    // Wait 5 seconds, then scroll by 1 item width
    const timeout = setTimeout(() => {
      if (carouselRef.current) {
        const item = carouselRef.current.querySelector('div.flex-shrink-0');
        const itemWidth = item ? (item as HTMLElement).offsetWidth + 24 : 300; // 24px = space-x-6
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        let newPosition = carouselRef.current.scrollLeft + itemWidth;
        if (newPosition > maxScroll) newPosition = 0;
        carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
        setScrollPosition(newPosition);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [scrollPosition, autoScroll, activeCategory]);

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
    <div className="relative  bg-[#f9f9f9]">


      <Container>
        <div className="text-center ">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Menu</h2>
          <div className="flex justify-center space-x-4 mb-8">
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
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
            className="flex overflow-x-auto scroll-smooth space-x-6 py-4  scrollbar-hide"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
            >
            {categories[activeCategory as keyof typeof categories].map(
              (item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0  bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-64 aspect-square w-72 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={100}
                      height={120}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {item.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-red-600 font-bold">
                        {item.price}
                      </span>
                      <Button className="">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              )
            )}
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
      </Container>
    </div>
  );
}

export default Items;

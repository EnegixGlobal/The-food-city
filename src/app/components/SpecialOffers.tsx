"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Container from "./Container";
import Button from "./Button";
import Image from "next/image";

const SpecialOffers = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const offers = [
    {
      id: 1,
      title: "Weekend Bonanza!",
      discount: "50% OFF",
      description:
        "Get half off on all pizzas this weekend. Limited time only!",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      occasion: "Weekend Special",
    },
    {
      id: 2,
      title: "Valentine's Deal",
      discount: "Buy 1 Get 1 Free",
      description:
        "Celebrate love with our heart-shaped pizzas. Share with your special one!",
      image:
        "https://images.unsplash.com/photo-1555072956-7758afb20e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      occasion: "Valentine's Day",
    },
    {
      id: 3,
      title: "Family Feast",
      discount: "30% OFF",
      description:
        "Order 2 large pizzas and get 30% off. Perfect for family dinners!",
      image:
        "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=722&q=80",
      occasion: "Family Offer",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
  }, [setCurrentSlide, offers.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? offers.length - 1 : prev - 1));
  }, [setCurrentSlide, offers.length]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, nextSlide]);

  return (
    <div className="relative bg-gray-100 md:py-12 py-8 md:px-4 text-gray-800 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 opacity-50" />
      <div className=" mx-auto px-4 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-red-800">
          Special Offers
        </h2>
        <p className="text-center text-maroon-200 mb-4 max-w-2xl mx-auto">
          Limited-time deals you don&apos;t want to miss! Grab them before
          they&apos;re gone.
        </p>

        {/* Carousel */}
        <Container>
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-300 hover:bg-white/30 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition transform hover:scale-110 ">
            <FiChevronLeft className="text-2xl text-red-800" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-300 hover:bg-white/30 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition transform hover:scale-110">
            <FiChevronRight className="text-2xl text-red-800" />
          </button>

          {/* Carousel Slides */}
          <div className="flex md:flex-row flex-col w-full overflow-hidden rounded-xl shadow-2xl ">
            {/* Left Side - Image */}
            <div className="md:w-1/2 md:h-[550px] h-[320px] relative">
              <Image
                width={600}
                height={400}
                src={offers[currentSlide].image}
                alt={offers[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 left-0 bg-yellow-400 text-maroon-900 px-3 py-1 rounded-br-2xl font-bold text-sm">
                {offers[currentSlide].occasion}
              </div>
            </div>

            {/* Right Side - Offer Details */}
            <div className="md:w-1/2 px-5 text-center py-4 flex flex-col justify-center bg-red-900/95">
              <h3 className="text-3xl font-bold text-white mb-2">
                {offers[currentSlide].title}
              </h3>
              <p className="text-yellow-300 text-4xl font-extrabold mb-4">
                {offers[currentSlide].discount}
              </p>
              <p className="text-white mb-6">
                {offers[currentSlide].description}
              </p>
              <Button className="py-2! w-xs mx-auto">Order Now</Button>
            </div>
          </div>
        </Container>

        {/* Carousel Indicators */}
        <div className="flex justify-center  space-x-2">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                currentSlide === index ? "bg-red-800" : "bg-red-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialOffers;

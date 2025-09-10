"use client";

import React, { useState, useEffect } from "react";
import { FiClock, FiShoppingCart, FiChevronRight } from "react-icons/fi";
import { FaGift, FaFire, FaRegClock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Container from "./Container";
import Button from "./Button";

const DosaOffer = () => {
  const router = useRouter();
  const [isOfferVisible, setIsOfferVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [mounted, setMounted] = useState(false);


  // Check if current time is between 9 AM and 2:30 PM
  useEffect(() => {
    // Mark mounted to avoid SSR/CSR markup mismatch
    setMounted(true);

    const calculateTimeRemaining = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours + minutes / 60;

      // Offer is visible between 9:00 AM (9.0) and 2:30 PM (14.5)
      const isOfferActive = currentTime >= 9 && currentTime <= 14.5;
      setIsOfferVisible(isOfferActive);

      if (isOfferActive) {
        // Calculate time remaining until 2:30 PM
        const endHours = 14; // 2 PM
        const endMinutes = 30; // 30 minutes
        const totalEndMinutes = endHours * 60 + endMinutes;
        const totalCurrentMinutes = hours * 60 + minutes;

        const remainingMinutes = totalEndMinutes - totalCurrentMinutes;

        if (remainingMinutes > 0) {
          const hoursRemaining = Math.floor(remainingMinutes / 60);
          const minutesRemaining = remainingMinutes % 60;
          setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m`);
        }
      }
    };

    // Only run time-based logic on the client after mount
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle Buy Now click - redirect to search page with "dosa" query
  const handleBuyNow = () => {
    const searchQuery = encodeURIComponent("dosa");
    router.push(`/search?q=${searchQuery}`);
  };

  // Avoid rendering time-dependent UI until client has mounted to prevent
  // hydration mismatches between server and client.
  if (!mounted) return null;
  if (!isOfferVisible) return null;

  return (
    <div className="relative py-12 md:py-16 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-200 rounded-full opacity-30"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-red-200 rounded-full opacity-20"></div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('/patterns/food-pattern.svg')] opacity-[0.03]"></div>

      <Container>
        <div className="relative z-10">
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-md">
              <FaFire className="mr-2" />
              Limited Time Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Dosa{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-700">
                Delight
              </span>{" "}
              Offer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Buy 2 Dosas, Get 1 Free! Available daily from 9 AM to 2:30 PM.
            </p>
          </div>

          {/* Offer card */}
          <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white transform hover:scale-[1.01] transition-transform duration-300">
            {/* Left Side - Image */}
            <div className="md:w-2/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
              <Image
                width={600}
                height={600}
                src="/dosa.jpg"
                alt="Buy 2 Dosas Get 1 Free"
                className="w-full h-full object-cover"
              />

              {/* Offer badge */}
              <div className="absolute top-5 left-5 z-20">
                <div className="bg-white text-red-700 px-4 py-2 rounded-lg shadow-lg font-bold flex items-center">
                  <FaGift className="mr-2 text-red-600" />
                  <span>BUY 2 GET 1 FREE</span>
                </div>
              </div>
            </div>

            {/* Right Side - Offer Details */}
            <div className="md:w-3/5 p-8 bg-gradient-to-br from-red-700 to-red-900 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-orange-400 rounded-full translate-y-10 -translate-x-10"></div>
              </div>

              <div className="relative z-10 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Dosa Feast Offer
                </h3>

                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl md:text-5xl font-extrabold text-yellow-300 mr-2">
                      3 Dosas
                    </span>
                    <span className="text-xl">for the price of</span>
                    <span className="text-4xl md:text-5xl font-extrabold text-yellow-300 ml-2">
                      2
                    </span>
                  </div>
                  <p className="text-yellow-100 text-sm">
                    Enjoy our delicious dosas with this exclusive offer
                  </p>
                </div>

                <p className="mb-6 text-red-100 leading-relaxed">
                  Savor crispy, golden dosas with your favorite chutneys and
                  sambar. Buy any two dosas and get one absolutely free! Offer
                  valid daily from 9 AM to 2:30 PM.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  <div className="flex items-center">
                    <div className="bg-yellow-400 p-2 rounded-full mr-3">
                      <FiClock className="text-red-800 text-sm" />
                    </div>
                    <span className="text-sm">Available until 2:30 PM</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-yellow-400 p-2 rounded-full mr-3">
                      <FaGift className="text-red-800 text-sm" />
                    </div>
                    <span className="text-sm">Free dosa on purchase of 2</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleBuyNow}
                    className="bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <FiShoppingCart />
                    <span>Order Now</span>
                    <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Fine print */}
                <p className="text-xs text-red-200 mt-6 opacity-80">
                  *Offer valid on select dosa varieties. Cannot be combined with
                  other promotions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DosaOffer;

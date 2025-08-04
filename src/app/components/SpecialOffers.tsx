"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiTag, FiClock, FiShoppingCart } from "react-icons/fi";
import { FaFire, FaGift } from "react-icons/fa";
import Container from "./Container";
import Button from "./Button";
import Image from "next/image";
import Link from "next/link";

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  applicableItems: string[];
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
  offerImage?: string;
  applicableProducts: Array<{
    title: string;
    price: number;
    imageUrl: string;
    _id: string;
  }>;
}

const SpecialOffers = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offers, setOffers] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/coupon');
        const data = await response.json();
        
        if (data.success && data.data) {
          setOffers(data.data);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
  }, [offers.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? offers.length - 1 : prev - 1));
  }, [offers.length]);

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (offers.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [currentSlide, nextSlide, offers.length]);

  // Helper functions
  const getCurrentOffer = () => offers[currentSlide];
  
  const getDiscountText = (offer: Coupon) => {
    return offer.discountType === 'percentage' 
      ? `${offer.discountValue}% OFF` 
      : `₹${offer.discountValue} OFF`;
  };

  const getOfferTitle = (offer: Coupon) => {
    const discountText = getDiscountText(offer);
    return `${discountText} - ${offer.code}`;
  };

  const getOfferDescription = (offer: Coupon) => {
    const productNames = offer.applicableProducts.slice(0, 3).map(p => p.title).join(', ');
    const moreItems = offer.applicableProducts.length > 3 ? ` and ${offer.applicableProducts.length - 3} more items` : '';
    return `Valid on ${productNames}${moreItems}. Use code ${offer.code} at checkout!`;
  };

  const getOfferImage = (offer: Coupon) => {
    if (offer.offerImage) return offer.offerImage;
    if (offer.applicableProducts.length > 0) return offer.applicableProducts[0].imageUrl;
    return '/placeholder-food.svg';
  };

  const isOfferExpiringSoon = (offer: Coupon) => {
    const expiryDate = new Date(offer.endDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  if (isLoading) {
    return (
      <div className="relative bg-gray-100 md:py-12 py-8 md:px-4 text-gray-800 overflow-hidden">
        <div className="mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-red-800">
            Special Offers
          </h2>
          <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto text-sm">
            Loading amazing deals...
          </p>
          <Container>
            <div className="flex md:flex-row flex-col w-full overflow-hidden rounded-xl shadow-2xl animate-pulse">
              <div className="md:w-1/2 md:h-[550px] h-[320px] bg-gray-300"></div>
              <div className="md:w-1/2 px-5 py-4 bg-gray-300"></div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="relative bg-gray-100 md:py-12 py-8 md:px-4 text-gray-800 overflow-hidden">
        <div className="mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-red-800">
            Special Offers
          </h2>
          <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto text-sm">
            No special offers available right now. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  const currentOffer = getCurrentOffer();

  return (
    <div className="relative bg-gray-100 md:py-12 py-8 md:px-4 text-gray-800 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 opacity-50" />
      <div className=" mx-auto px-4 relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-red-800">
          Special Offers
        </h2>
        <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto text-sm">
          Limited-time deals you don&apos;t want to miss! Grab them before
          they&apos;re gone.
        </p>

        {/* Carousel */}
        <Container>
          {/* Navigation Arrows */}
          {offers.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition transform hover:scale-110 shadow-lg">
                <FiChevronLeft className="text-2xl text-red-800" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition transform hover:scale-110 shadow-lg">
                <FiChevronRight className="text-2xl text-red-800" />
              </button>
            </>
          )}

          {/* Carousel Slides */}
          <div className="flex md:flex-row flex-col w-full overflow-hidden rounded-xl shadow-2xl bg-white">
            {/* Left Side - Image */}
            <div className="md:w-1/2 md:h-[550px] h-[320px] relative overflow-hidden">
              <Image
                width={600}
                height={400}
                src={getOfferImage(currentOffer)}
                alt={getOfferTitle(currentOffer)}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-food.svg';
                }}
              />
              
              {/* Overlay Badges */}
              <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-red-900 px-3 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                  <FaFire className="text-red-700 text-xs" />
                  HOT DEAL
                </div>
                {isOfferExpiringSoon(currentOffer) && (
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                    <FiClock className="text-xs" />
                    EXPIRES SOON
                  </div>
                )}
              </div>

              {/* Product Images Preview */}
              {currentOffer.applicableProducts.length > 0 && (
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {currentOffer.applicableProducts.slice(0, 3).map((product, index) => (
                    <div key={product._id} className="relative">
                      <Image
                        src={product.imageUrl }
                        alt={product.title}
                        width={40}
                        height={40}
                        className="rounded-md border-2 border-white shadow-lg object-cover"
                        
                      />
                      {index === 2 && currentOffer.applicableProducts.length > 3 && (
                        <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+{currentOffer.applicableProducts.length - 3}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Offer Details */}
            <div className="md:w-1/2 px-4 py-6 flex flex-col justify-center bg-gradient-to-br from-red-900 to-red-800 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400 rounded-full translate-y-8 -translate-x-8"></div>
              </div>

              <div className="relative z-10 text-center">
                {/* Coupon Code Badge */}
                <div className="inline-flex items-center gap-1 bg-yellow-400 text-red-900 px-3 py-1 rounded-full font-bold text-xs mb-3 shadow-lg">
                  <FiTag className="text-xs" />
                  {currentOffer.code}
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                  {getOfferTitle(currentOffer)}
                </h3>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/20">
                  <p className="text-yellow-300 text-2xl md:text-3xl font-extrabold mb-1">
                    {getDiscountText(currentOffer)}
                  </p>
                  <p className="text-white/90 text-xs">
                    Valid on {currentOffer.applicableProducts.length} delicious items
                  </p>
                </div>

                <p className="text-white/90 mb-4 leading-relaxed text-sm">
                  {getOfferDescription(currentOffer)}
                </p>

                {/* Expiry Info */}
                <div className="text-white/70 text-xs mb-4 flex items-center justify-center gap-1">
                  <FiClock className="text-xs" />
                  Expires: {new Date(currentOffer.endDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link href="/offers">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-1 text-sm">
                      <FaGift className="text-sm" />
                      View All Offers
                    </Button>
                  </Link>
                  <Link href={`/search?q=${encodeURIComponent(currentOffer.applicableProducts[0]?.title || 'food')}`}>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-1 text-sm">
                      <FiShoppingCart className="text-sm" />
                      Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Carousel Indicators */}
        {offers.length > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {offers.map((offer, index) => (
              <button
                key={offer._id}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? "bg-red-800 scale-125" 
                    : "bg-red-300 hover:bg-red-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialOffers;

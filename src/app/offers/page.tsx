"use client";

import React from "react";
import { FiClock, FiTag, FiPercent, FiShoppingBag } from "react-icons/fi";
import Container from "../components/Container";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

const OffersPage = () => {
  // Sample offers data
  const offers = [
    {
      id: 1,
      title: "Weekend Special",
      description: "Get 30% off on all South Indian dishes this weekend",
      code: "WEEKEND30",
      validUntil: "2023-12-31",
      discount: "30%",
      category: "south-indian",
      image:
        "https://images.unsplash.com/photo-1635667839851-9ae595677a2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 2,
      title: "First Order Bonus",
      description: "Get ₹100 off on your first order above ₹300",
      code: "NEW100",
      validUntil: "2023-12-31",
      discount: "₹100",
      category: "all",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 3,
      title: "Combo Deal",
      description: "Buy any 2 main course dishes and get 1 dessert free",
      code: "COMBO2PLUS1",
      validUntil: "2023-12-15",
      discount: "Free Dessert",
      category: "combo",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
    },
    {
      id: 4,
      title: "Family Pack",
      description: "20% off on all family packs (min 4 items)",
      code: "FAMILY20",
      validUntil: "2023-12-25",
      discount: "20%",
      category: "family",
      image:
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 5,
      title: "Happy Hours",
      description: "15% off on all orders between 2PM-5PM",
      code: "HAPPY15",
      validUntil: "2023-12-31",
      discount: "15%",
      category: "all",
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 6,
      title: "Tandoori Special",
      description: "Buy any 3 tandoori items and get 1 free",
      code: "TANDOORI3PLUS1",
      validUntil: "2023-12-20",
      discount: "1 Free Item",
      category: "tandoor",
      image:
        "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
  ];

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Offers" },
    { id: "south-indian", name: "South Indian" },
    { id: "tandoor", name: "Tandoor Specials" },
    { id: "combo", name: "Combo Deals" },
    { id: "family", name: "Family Packs" },
  ];

  const [activeCategory, setActiveCategory] = React.useState("all");

  const filteredOffers =
    activeCategory === "all"
      ? offers
      : offers.filter((offer) => offer.category === activeCategory);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-green-700 text-white mt-10 md:py-12 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Special Offers</h1>
            <p className="md:text-xl text-md max-w-3xl mx-auto">
              Discover amazing deals and discounts on your favorite dishes.
              Limited time offers!
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <Container>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium ${
                  activeCategory === category.id
                    ? "bg-red-900 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}>
                {category.name}
              </button>
            ))}
          </div>
        </Container>

        {/* Offers Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-2">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
                <div className="relative h-48 md:h-64">
                  <Image
                    width={600}
                    height={400}
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-900 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <FiPercent className="mr-1" />
                    {offer.discount}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-4">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiClock className="mr-1" />
                      <span>
                        Valid until:{" "}
                        {new Date(offer.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiShoppingBag className="mr-1" />
                      <span className="capitalize">
                        {offer.category.replace("-", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <FiTag className="text-red-900 mr-2" />
                      <span className="font-mono font-medium">
                        {offer.code}
                      </span>
                    </div>
                    <button className="text-red-900 text-sm hover:underline">
                      Copy Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FiTag className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No offers available
              </h3>
              <p className="text-gray-500">
                There are no offers in this category at the moment.
              </p>
            </div>
          )}
        </div>


      </div>
      <Footer />
    </>
  );
};

export default OffersPage;

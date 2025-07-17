"use client";

import Button from "@/app/components/Button";
import Container from "@/app/components/Container";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import RecommendationCard from "@/app/components/RecommendationCard";
import Image from "next/image";
import React, { useState } from "react";
import { FaFire, FaLeaf } from "react-icons/fa";
import { FiStar, FiClock, FiPlus, FiMinus } from "react-icons/fi";
import { GiChickenOven, GiNoodles, GiIndiaGate } from "react-icons/gi";

interface ProductPageProps {
  params: Promise<{
    product: string;
  }>;
}

function ProductPage({ params }: ProductPageProps) {
  const [productSlug, setProductSlug] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Use useEffect to handle the async params
  React.useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setProductSlug(resolvedParams.product);
    };
    getParams();
  }, [params]);

  // Mock data - in a real app, you would fetch this based on the productSlug
  // This is just an example - you should replace with your actual data fetching logic
  const products = [
    {
      id: 144,
      slug: "masala-dosa",
      name: "Masala Dosa",
      category: "south-indian",
      price: 8.99,
      rating: 4.7,
      prepTime: "20-30 min",
      spicyLevel: 1,
      description:
        "Crispy rice crepe stuffed with spiced potato filling, served with sambar and coconut chutney.",

      image:
        "https://imgs.search.brave.com/kr6oz9u-XJvEskK3Q80v-K4hxkOG6LKmOkSt-v5KrPs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQ4/ODgyMzYzNC9waG90/by9mcmVzaC1vcmdh/bmljLXZlZ2V0YWJs/ZXMtYW5kLXNwaWNl/cy5qcGc_Yj0xJnM9/NjEyeDYxMiZ3PTAm/az0yMCZjPVo5ZFVf/TUQ5c2JYcENLcklp/OHBKcHhGZFFCU0JZ/UEdrZzFQSWRLT3A0/TGc9",
      isVeg: true,
      isBestseller: true,
      reviews: [
        {
          id: 1,
          user: "Ananya P.",
          rating: 5,
          comment: "Authentic South Indian taste! Perfectly crispy.",
        },
        {
          id: 2,
          user: "Vikram K.",
          rating: 4,
          comment: "Great flavor, could use more potato filling",
        },
      ],
    },
    {
      id: 244,
      slug: "tandoori-chicken",
      name: "Tandoori Chicken",
      category: "tandoor",
      price: 15.99,
      rating: 4.8,
      prepTime: "30-40 min",
      spicyLevel: 2,
      description:
        "Juicy chicken marinated in yogurt and spices, cooked in a traditional clay oven. Served with mint chutney and onion salad.",

      image:
        "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      isVeg: false,
      isBestseller: true,
      reviews: [
        {
          id: 1,
          user: "Rahul S.",
          rating: 5,
          comment: "Absolutely delicious! Perfectly spiced.",
        },
        {
          id: 2,
          user: "Priya M.",
          rating: 4,
          comment: "Great flavor but could be more tender",
        },
      ],
    },
  ];

  // Find the product based on the slug - only if productSlug is available
  const product = productSlug ? products.find((p) => p.slug === productSlug) || products[0] : products[0];

  // Show loading state while productSlug is being resolved
  if (!productSlug) {
    return (
      <>
        <Navbar />
        <div className="bg-gradient-to-b from-red-50 to-white min-h-screen pb-12">
          <Container>
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading product details...</p>
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  // Related products based on category
  const relatedProducts = [
    {
      id: 233,
      name: "Chicken Tikka",
      price: 13.99,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      isVeg: false,
      description: "Succulent chicken pieces marinated in spices and grilled to perfection."
    },
    {
      id: 354,
      name: "Seekh Kebab",
      price: 12.99,
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      isVeg: false,
        description: "Spiced minced meat skewers, grilled to perfection."
    },
    {
      id: 444,
      name: "Paneer Tikka",
      price: 11.99,
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1198&q=80",
      isVeg: true,
        description: "Grilled paneer cubes marinated in spices, served with mint chutney."
    },
  ];

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} ${product.name} to cart`);
  };



  const getCategoryIcon = () => {
    switch (product.category) {
      case "indian":
        return <GiIndiaGate className="text-3xl text-red-900" />;
      case "chinese":
        return <GiNoodles className="text-3xl text-red-900" />;
      case "south-indian":
        return <FaLeaf className="text-3xl text-red-900" />;
      case "tandoor":
        return <GiChickenOven className="text-3xl text-red-900" />;
      default:
        return <GiIndiaGate className="text-3xl text-red-900" />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-red-50 to-white min-h-screen pb-12">
        {/* Product Section */}

        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Product Image */}
            <div className="lg:w-1/2">
              <div className="sticky top-14">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-96 object-cover lg:h-[500px]"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl shadow-md p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {getCategoryIcon()}
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {product.category.replace("-", " ")}
                  </span>
                </div>

                {/* Product Name and Rating */}
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                    <FiStar className="text-yellow-500 mr-1" />
                    <span className="font-bold">{product.rating}</span>
                  </div>
                </div>

                {/* Price */}
                <p className="text-2xl font-bold text-red-900 mb-6">
                  ${product.price.toFixed(2)}
                </p>

                {/* Meta Info */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-1" />
                    <span>{product.prepTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaFire className="mr-1" />
                    <span>
                      {
                        ["Mild", "Medium", "Hot", "Extra Hot"][
                          product.spicyLevel
                        ]
                      }
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.isVeg
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}>
                    {product.isVeg ? "VEG" : "NON-VEG"}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="flex items-center border border-gray-300 rounded-full">
                    <button
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className="p-2 text-gray-600 hover:text-red-900">
                      <FiMinus />
                    </button>
                    <span className="px-4 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="p-2 text-gray-600 hover:text-red-900">
                      <FiPlus />
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 ml-4 py-2! ">
                    ADD TO CART - ${(product.price * quantity).toFixed(2)}
                  </Button>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Customer Reviews
                </h3>
                {product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full mr-3">
                            <FiStar className="text-yellow-500 mr-1" />
                            <span className="font-bold">{review.rating}</span>
                          </div>
                          <span className="font-medium">{review.user}</span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="">
              {relatedProducts.map((item) => (
                <RecommendationCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Footer />
    </>
  );
}

export default ProductPage;

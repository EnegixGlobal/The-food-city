import {  FaLeaf } from "react-icons/fa";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import { GiChickenOven, GiNoodles, GiIndiaGate } from "react-icons/gi";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import MainCard from "../components/MainCard";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Mock database - replace with your API calls
const menuDatabase = {
  indian: {
    title: "Indian Delicacies",
    description: "Authentic flavors from across India",
    icon: <GiIndiaGate className="text-3xl" />,
    items: [
      {
        id: 1,
        name: "Butter Chicken",
        slug: "butter-chicken",
        price: 14.99,
        rating: 4.7,
        prepTime: "25-35 min",
        spicyLevel: 2,
        image:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        isVeg: false,
        isBestseller: true,
      },
      {
        id: 1,
        name: "Butter Chicken",
        slug: "butter-chicken",
        price: 14.99,
        rating: 4.7,
        prepTime: "25-35 min",
        spicyLevel: 2,
        image:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        isVeg: true,
        isBestseller: true,
      },
      // More Indian items...
    ],
  },
  chinese: {
    title: "Chinese Wok",
    description: "Oriental flavors with perfect wok hei",
    icon: <GiNoodles className="text-3xl" />,
    items: [
      {
        id: 5,
        name: "Szechuan Noodles",
        slug: "szechuan-noodles",
        price: 11.99,
        rating: 4.4,
        prepTime: "20-30 min",
        spicyLevel: 3,
        image:
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        isVeg: false,
        isBestseller: false,
      },
      {
        id: 6,
        name: "Szechuan Noodles",
        slug: "szechuan-noodles",
        price: 11.99,
        rating: 4.4,
        prepTime: "20-30 min",
        spicyLevel: 3,
        image:
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        isVeg: false,
        isBestseller: false,
      },
      // More Chinese items...
    ],
  },
  "south-indian": {
    title: "South Indian Specials",
    description: "Traditional flavors from Southern India",
    icon: <FaLeaf className="text-3xl" />,
    items: [
      {
        id: 9,
        name: "Masala Dosa",
        slug: "masala-dosa",
        price: 8.99,
        rating: 4.6,
        prepTime: "15-25 min",
        spicyLevel: 1,
        image:
          "https://images.unsplash.com/photo-1559533083-71f5095f0e1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        isVeg: true,
        isBestseller: true,
      },
      // More South Indian items...
    ],
  },
  tandoor: {
    title: "Tandoori Grill",
    description: "Smoky flavors from the clay oven",
    icon: <GiChickenOven className="text-3xl" />,
    items: [
      {
        id: 13,
        name: "Tandoori Chicken",
        slug: "tandoori-chicken",
        price: 15.99,
        rating: 4.8,
        prepTime: "30-40 min",
        spicyLevel: 2,
        image:
          "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        isVeg: false,
        isBestseller: true,
      },
      // More Tandoor items...
    ],
  },
};


export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryKey = category
    .toLowerCase()
    .replace(" ", "-") as keyof typeof menuDatabase;
  const categoryData = menuDatabase[categoryKey] || menuDatabase.indian;

  // State would be managed differently in actual implementation
  const filters = {
    vegOnly: false,
    bestsellersOnly: false,
    maxPrice: 30,
    minRating: 0,
    spiceLevel: null as number | null,
    sortBy: "popular", // 'popular' | 'price-low' | 'price-high' | 'rating'
  };

  // Filter logic (would be client-side in real implementation)
  const filteredItems = categoryData.items.filter((item) => {
    return (
      (!filters.vegOnly || item.isVeg) &&
      (!filters.bestsellersOnly || item.isBestseller) &&
      item.price <= filters.maxPrice &&
      item.rating >= filters.minRating &&
      (filters.spiceLevel === null || item.spicyLevel === filters.spiceLevel)
    );
  });

  // Sort logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (filters.sortBy === "price-low") return a.price - b.price;
    if (filters.sortBy === "price-high") return b.price - a.price;
    if (filters.sortBy === "rating") return b.rating - a.rating;
    return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0); // Popular first
  });

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-red-50 to-white min-h-screen">
        {/* Category Hero */}
        <Container>
          <div className="relative mb-8 h-16 md:h-16  overflow-hidden">
            <div className="absolute inset-0  flex items-center">
              <div className="flex items-center gap-4">
                <div className="bg-red-800/30 md:p-4 p-3 rounded-full backdrop-blur-sm">
                  {categoryData.icon}
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-black">
                    {categoryData.title}
                  </h1>
                  <p className="md:text-md text-sm text-gray-700 md:mt-1">
                    {categoryData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-red-900">
              {sortedItems.length}{" "}
              {sortedItems.length === 1 ? "Delicious Item" : "Delicious Items"}
            </h2>

            <div className="flex flex-wrap gap-3">
              {/* Sort Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition">
                  <span>
                    Sort:{" "}
                    {
                      {
                        popular: "Popular",
                        "price-low": "Price: Low to High",
                        "price-high": "Price: High to Low",
                        rating: "Rating",
                      }[filters.sortBy]
                    }
                  </span>
                  <FiChevronDown className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div className="py-1">
                    {[
                      { value: "popular", label: "Popular" },
                      { value: "rating", label: "Rating" },
                      { value: "price-low", label: "Price: Low to High" },
                      { value: "price-high", label: "Price: High to Low" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sortBy === option.value
                            ? "bg-red-100 text-red-900"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <span className="border rounded-full h-10 w-10 flex items-center justify-center text-xl ">
                <FiFilter />
              </span>
            </div>
          </div>

          {/* Food Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-4 md:gap-6 gap-2">
            {sortedItems.map((item) => (
              <MainCard key={item.id} item={item} category={category} />
            ))}
          </div>

          {/* Empty State */}
          {sortedItems.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  No items found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters to see more options
                </p>
                <button className="bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-full font-medium transition">
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
}

"use client";

import React, { useState } from "react";
import { FiSearch, FiTrendingUp, FiClock, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import Image from "next/image";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Pizza",
    "Burger",
    "Biryani",
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularSearches = [
    { term: "Pizza", category: "Italian" },
    { term: "Butter Chicken", category: "Indian" },
    { term: "Sushi", category: "Japanese" },
    { term: "Burger", category: "American" },
    { term: "Pasta", category: "Italian" },
    { term: "Biryani", category: "Indian" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches if not already present
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
      }
      // Perform search logic here
      console.log("Searching for:", searchQuery);
    }
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    // Perform search logic here
    console.log("Searching for:", term);
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(recentSearches.filter((item) => item !== term));
  };

  console.log(searchQuery)

  return (
    <>
      <Navbar />
      <div className=" bg-gradient-to-b from-red-50 to-white ">
        <Container>
          {/* Search Header */}
          

          {/* Search Bar */}
          <div className=" max-w-4xl mx-auto mb-6 relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for your favorite food..."
                  className="w-full px-6 py-3 pr-12  border border-gray-300 focus:outline-none text-lg font-semibold"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2  text-black p-2 rounded-full transition">
                  <FiSearch size={24} />
                </button>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && !searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl z-10 overflow-hidden">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-6 py-3 flex items-center text-gray-500">
                      <FiClock className="mr-2" />
                      <span className="font-medium">Recent Searches</span>
                    </div>
                    <ul>
                      {recentSearches.map((term, index) => (
                        <li
                          key={index}
                          className="px-6 py-3 hover:bg-red-50 cursor-pointer flex justify-between items-center"
                          onClick={() => handlePopularSearch(term)}>
                          <span>{term}</span>
                          <button
                            onClick={(e) => removeRecentSearch(term, e)}
                            className="text-gray-400 hover:text-red-600 p-1">
                            <FiX size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="px-6 py-3 flex items-center text-gray-500">
                    <FiTrendingUp className="mr-2" />
                    <span className="font-medium">Popular Searches</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6">
                    {popularSearches.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md cursor-pointer transition"
                        onClick={() => handlePopularSearch(item.term)}>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-gray-800">
                            {item.term}
                          </h3>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {Math.floor(Math.random() * 100) + 50} restaurants
                          serving this
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Results (when query exists) */}
          {searchQuery && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Results for &quot;{searchQuery}&quot;
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sample search results - replace with actual data */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <Image
                        src={`https://source.unsplash.com/random/400x300/?food,${searchQuery},${item}`}
                        alt="Food item"
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-xl text-gray-800 mb-1">
                        {searchQuery} {item === 1 ? "Special" : `Combo ${item}`}
                      </h3>
                      <p className="text-red-600 font-bold mb-3">
                        ${(8 + item).toFixed(2)}
                      </p>
                      <p className="text-gray-600 text-sm mb-4">
                        Delicious {searchQuery.toLowerCase()} with special
                        ingredients and our signature sauce
                      </p>
                      <button className="w-full bg-red-900 hover:bg-red-800 text-white py-2 rounded-lg font-medium transition">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Categories (when no query) */}
          {/* {!searchQuery && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Popular Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  "Italian",
                  "Indian",
                  "Chinese",
                  "Japanese",
                  "Mexican",
                  "American",
                ].map((cuisine) => (
                  <div
                    key={cuisine}
                    className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md cursor-pointer transition group"
                    onClick={() => handlePopularSearch(cuisine)}>
                    <div className="w-16 h-16 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center text-red-900 group-hover:bg-red-200 transition">
                      <span className="text-2xl">
                        {cuisine === "Italian" && "🍕"}
                        {cuisine === "Indian" && "🍛"}
                        {cuisine === "Chinese" && "🥡"}
                        {cuisine === "Japanese" && "🍣"}
                        {cuisine === "Mexican" && "🌮"}
                        {cuisine === "American" && "🍔"}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800">{cuisine}</h3>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </Container>
      </div>
    </>
  );
};

export default Search;

"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { FiSearch, FiTrendingUp, FiClock, FiX, FiLoader } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import MainCard from "../components/MainCard";
import { MainCardSkeleton } from "../components/MainCardSkeleton";
import { useSearchParams } from "next/navigation";

interface Product {
  _id: string;
  id: number;
  title: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  imageUrl: string;
  image: string;
  rating: number;
  prepTime: string;
  spicyLevel: number;
  isVeg: boolean;
  isBestseller: boolean;
  ratingCount: number;
}

interface SearchResponse {
  success: boolean;
  message: string;
  data?: {
    products: Product[];
    currentPage: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const SearchContent = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState([
    "Biryani",
    "Dosa",
    "Hakka Noodles",
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Effect to handle URL search parameter
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setSearchQuery(urlQuery);
      setShowSuggestions(false);
      // Add to recent searches
      if (!recentSearches.includes(urlQuery)) {
        setRecentSearches([urlQuery, ...recentSearches.slice(0, 4)]);
      }
    }
  }, [searchParams, recentSearches]);

  // Debounced search function
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Search API call
  const searchProducts = async (
    query: string,
    page = 1,
    isLoadMore = false
  ) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalCount(0);
      setHasSearched(false);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`, { cache: "no-store" }
      );
      const data: SearchResponse = await response.json();

      if (data.success && data.data) {
        if (isLoadMore) {
          // Append results for load more
          setSearchResults((prev) => [...prev, ...data.data!.products]);
        } else {
          // Replace results for new search
          setSearchResults(data.data.products);
        }
        setTotalCount(data.data.totalCount);
        setCurrentPage(data.data.currentPage);
        setHasMore(data.data.hasMore || false);
      } else {
        if (!isLoadMore) {
          setSearchResults([]);
          setTotalCount(0);
        }
        if (response.status === 404) {
          setError("No products found for your search");
        } else {
          setError(data.message || "Something went wrong");
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search products. Please try again.");
      if (!isLoadMore) {
        setSearchResults([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search with 300ms delay
  const debouncedSearch = useCallback(debounce(searchProducts, 300), []);

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const popularSearches = [
    { term: "Butter Chicken", category: "Indian" },
    { term: "Biryani", category: "Indian" },
    { term: "Dosa", category: "South Indian" },
    { term: "Idli", category: "South Indian" },
    { term: "Hakka Noodles", category: "Chinese" },
    { term: "Fried Rice", category: "Chinese" },
    { term: "Tandoori Chicken", category: "Tandoor" },
    { term: "Naan", category: "Tandoor" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches if not already present
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
      }
      setShowSuggestions(false);
      // Search is already triggered by useEffect
    }
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    // Add to recent searches
    if (!recentSearches.includes(term)) {
      setRecentSearches([term, ...recentSearches.slice(0, 4)]);
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(recentSearches.filter((item) => item !== term));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length === 0);
    // Reset pagination when query changes
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      searchProducts(searchQuery, currentPage + 1, true);
    }
  };

  const formatPrice = (price: number, discountedPrice?: number) => {
    if (discountedPrice && discountedPrice < price) {
      return discountedPrice;
    }
    return price;
  };

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
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(searchQuery.length === 0)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder="Search for your favorite food..."
                  className="w-full px-6 py-3 pr-12 border border-gray-300 focus:outline-none text-lg font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black p-2 rounded-full transition disabled:opacity-50">
                  {isLoading ? (
                    <FiLoader size={24} className="animate-spin" />
                  ) : (
                    <FiSearch size={24} />
                  )}
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

          {/* Search Results */}
          {hasSearched && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-gray-800">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <FiLoader className="animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    `Results for "${searchQuery}" (${totalCount} found)`
                  ) : (
                    `No results for "${searchQuery}"`
                  )}
                </h2>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <MainCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* Search Results */}
              {!isLoading && searchResults.length > 0 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-3">
                    {searchResults.map((product) => (
                      <MainCard
                        key={product._id}
                        item={product}
                        category={product.category}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="bg-red-900 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <FiLoader className="animate-spin" />
                            Loading more...
                          </div>
                        ) : (
                          "Load More Products"
                        )}
                      </button>
                      <p className="text-gray-500 text-sm mt-2">
                        Showing {searchResults.length} of {totalCount} products
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* No Results State */}
              {!isLoading &&
                !error &&
                searchResults.length === 0 &&
                hasSearched &&
                searchQuery && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <FiSearch size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Try searching with different keywords or browse our
                      popular categories below.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {popularSearches.slice(0, 4).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handlePopularSearch(item.term)}
                          className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm hover:bg-red-200 transition">
                          {item.term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

const Search = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default Search;

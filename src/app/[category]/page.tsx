"use client";

import { FaLeaf } from "react-icons/fa";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import { GiChickenOven, GiNoodles, GiIndiaGate } from "react-icons/gi";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import MainCard from "../components/MainCard";
import { useEffect, useState } from "react";
import MainCardSkeletonGrid from "../components/MainCardSkeleton";
import { showAlert } from "../zustand/alertStore";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Mock database - replace with your API calls
const menuDatabase = {
  indian: {
    title: "Indian Delicacies",
    description: "Authentic flavors from across India",
    icon: <GiIndiaGate className="text-3xl" />,
  },
  chinese: {
    title: "Chinese Wok",
    description: "Oriental flavors with perfect wok hei",
    icon: <GiNoodles className="text-3xl" />,
  },
  "south-indian": {
    title: "South Indian Specials",
    description: "Traditional flavors from Southern India",
    icon: <FaLeaf className="text-3xl" />,
  },
  tandoor: {
    title: "Tandoori Grill",
    description: "Smoky flavors from the clay oven",
    icon: <GiChickenOven className="text-3xl" />,
  },
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const categoryKey = category
    .toLowerCase()
    .replace(" ", "-") as keyof typeof menuDatabase;
  const categoryData = menuDatabase[categoryKey] || menuDatabase.indian;
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  // Fixed page size: fetch 50 products at once as requested
  const [limit, setLimit] = useState<number>(50);

  // Filter states
  const [filters, setFilters] = useState({
    isVeg: false,
    isBestSeller: false,
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Extract category from params
  useEffect(() => {
    const getCategory = async () => {
      const resolvedParams = await params;
      setCategory(resolvedParams.category);
    };
    getCategory();
  }, [params]);

  // Build query string with filters
  const buildQueryString = () => {
    const queryParams = new URLSearchParams({
      category: category,
    });
    // pagination
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    if (filters.isVeg) queryParams.append("isVeg", "true");
    if (filters.isBestSeller) queryParams.append("isBestSeller", "true");
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.minRating) queryParams.append("minRating", filters.minRating);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    return queryParams.toString();
  };

  // fetching products according to category and filters
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!category) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // simple client-side validations
        const min = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
        const max = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;
        if (
          min !== undefined &&
          max !== undefined &&
          !Number.isNaN(min) &&
          !Number.isNaN(max) &&
          min > max
        ) {
          showAlert.warning(
            "Invalid price range",
            "Min price cannot be greater than max price."
          );
          setLoading(false);
          return;
        }

        const baseUrl = process.env.PUBLIC_URL;

        const queryString = buildQueryString();
        const res = await fetch(`${baseUrl}/api/product?${queryString}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || data?.success === false) {
          const msg =
            data?.message || `Failed to fetch products (HTTP ${res.status})`;
          showAlert.error("Could not load products", msg);
        }
        const productsData = data.data.products || [];
        const count = data.data.totalCount || 0;
        const pages = data.data.totalPages || 0;
        setProducts(productsData);
        setTotalCount(count);
        setTotalPages(pages);

        // If requested page is out of range, move to last available page
        if (pages > 0 && page > pages) {
          showAlert.info(
            "Moved to last page",
            "Adjusted to available results."
          );
          setPage(pages);
          return;
        }

        if (res.ok && (data?.data?.totalCount ?? 0) === 0) {
          showAlert.info("No items found", "Try adjusting your filters.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalCount(0);
        setTotalPages(0);
        showAlert.error(
          "Network error",
          "Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, filters, page, limit]);

  // Handle filter changes
  const handleFilterChange = (filterKey: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      isVeg: false,
      isBestSeller: false,
      minPrice: "",
      maxPrice: "",
      minRating: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPage(1);
  };

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
              {totalCount}{" "}
              {totalCount === 1 ? "Delicious Item" : "Delicious Items"}
            </h2>

            <div className="flex flex-wrap gap-3">
              {/* Sort Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition">
                  <span>
                    Sort:{" "}
                    {{
                      createdAt: "Latest",
                      price:
                        filters.sortOrder === "asc"
                          ? "Price: Low to High"
                          : "Price: High to Low",
                      rating: "Rating",
                      title: "Name",
                    }[filters.sortBy] || "Latest"}
                  </span>
                  <FiChevronDown className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute right-0  w-56 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div className="py-1">
                    {[
                      { value: "createdAt", label: "Latest", order: "desc" },
                      { value: "rating", label: "Rating", order: "desc" },
                      {
                        value: "price",
                        label: "Price: Low to High",
                        order: "asc",
                      },
                      {
                        value: "price",
                        label: "Price: High to Low",
                        order: "desc",
                      },
                      { value: "title", label: "Name", order: "asc" },
                    ].map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleFilterChange("sortBy", option.value);
                          handleFilterChange("sortOrder", option.order);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filters.sortBy === option.value &&
                          filters.sortOrder === option.order
                            ? "bg-red-100 text-red-900"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`border rounded-full h-10 w-10 flex items-center justify-center text-xl transition-colors ${
                  showFilters
                    ? "bg-red-100 border-red-300 text-red-600"
                    : "hover:bg-gray-100"
                }`}>
                <FiFilter />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Quick Filters */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Quick Filters
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isVeg}
                        onChange={(e) =>
                          handleFilterChange("isVeg", e.target.checked)
                        }
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm">Vegetarian Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isBestSeller}
                        onChange={(e) =>
                          handleFilterChange("isBestSeller", e.target.checked)
                        }
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm">Bestsellers Only</span>
                    </label>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Price Range (₹)
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Minimum Rating
                  </h4>
                  <select
                    value={filters.minRating}
                    onChange={(e) =>
                      handleFilterChange("minRating", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500">
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2.5">2.5+ Stars</option>
                  </select>
                </div>

                {/* Active Filters Summary */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Active Filters
                  </h4>
                  <div className="space-y-1">
                    {filters.isVeg && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Vegetarian
                      </span>
                    )}
                    {filters.isBestSeller && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-1">
                        Bestsellers
                      </span>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-1">
                        ₹{filters.minPrice || "0"} - ₹{filters.maxPrice || "∞"}
                      </span>
                    )}
                    {filters.minRating && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full ml-1">
                        {filters.minRating}+ ⭐
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Food Items Grid */}
          {loading ? (
            <MainCardSkeletonGrid rows={2} itemsPerRow={4} />
          ) : (
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2  sm:grid-cols-3 md:grid-cols-4 xs:grid-cols-3 md:gap-6 gap-2">
                {products?.map((product: any) => (
                  <MainCard
                    key={product._id}
                    item={product}
                    category={category}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination controls */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + (products.length ? 1 : 0)}-
                {(page - 1) * limit + products.length} of {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-2 rounded-md border text-sm ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}>
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pg = idx + 1;
                  // Only show a window around current page
                  if (
                    pg === 1 ||
                    pg === totalPages ||
                    (pg >= page - 2 && pg <= page + 2)
                  ) {
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-9 h-9 rounded-md border text-sm ${
                          pg === page
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white hover:bg-gray-50"
                        }`}>
                        {pg}
                      </button>
                    );
                  }
                  if (
                    (pg === page - 3 && pg > 1) ||
                    (pg === page + 3 && pg < totalPages)
                  ) {
                    return (
                      <span key={pg} className="px-1 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-2 rounded-md border text-sm ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}>
                  Next
                </button>
                {/* Fixed page size (50); selector removed intentionally */}
                <span className="ml-2 text-xs text-gray-500">50 / page</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  No items found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters to see more options
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-full font-medium transition">
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

import { useState, useEffect, useCallback } from 'react';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce utility
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Search API call
  const searchProducts = async (query, page = 1, limit = 12) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalCount(0);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        // If it's a new search (page 1), replace results
        // If it's pagination, append results
        if (page === 1) {
          setSearchResults(data.data.products);
        } else {
          setSearchResults(prev => [...prev, ...data.data.products]);
        }
        setTotalCount(data.data.totalCount);
      } else {
        if (page === 1) {
          setSearchResults([]);
          setTotalCount(0);
        }
        if (response.status === 404) {
          setError('No products found for your search');
        } else {
          setError(data.message || 'Something went wrong');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search products. Please try again.');
      if (page === 1) {
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

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setTotalCount(0);
    setHasSearched(false);
  };

  // Load more results (pagination)
  const loadMore = (page) => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery, page);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    totalCount,
    hasSearched,
    clearSearch,
    loadMore,
    searchProducts
  };
};

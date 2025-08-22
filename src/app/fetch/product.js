const baseUrl = process.env.PUBLIC_URL || "http://localhost:3000";

export const fetchIndianProducts = async (
  page = 1,
  limit = 20,
  filters = {}
) => {
  try {
    // Build query string with only provided filters
    const queryParams = new URLSearchParams({
      category: "indian",
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add optional filters only if they are provided
    if (filters.isVeg !== undefined) queryParams.append("isVeg", filters.isVeg);
    if (filters.isBestSeller !== undefined)
      queryParams.append("isBestSeller", filters.isBestSeller);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
    if (filters.prepTime) queryParams.append("prepTime", filters.prepTime);

    const response = await fetch(`${baseUrl}/api/product?${queryParams}`, {
      next: { revalidate: 300 }, // Disable caching for now to test
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.data.products;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Fetch products for Chinese category
export const fetchChineseProducts = async (
  page = 1,
  limit = 20,
  filters = {}
) => {
  try {
    // Build query string with only provided filters
    const queryParams = new URLSearchParams({
      category: "chinese",
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add optional filters only if they are provided
    if (filters.isVeg !== undefined) queryParams.append("isVeg", filters.isVeg);
    if (filters.isBestSeller !== undefined)
      queryParams.append("isBestSeller", filters.isBestSeller);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
    if (filters.prepTime) queryParams.append("prepTime", filters.prepTime);

    const response = await fetch(`${baseUrl}/api/product?${queryParams}`, {
      next: { revalidate: 300 }, // Disable caching for now to test
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.data.products;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// fetch products for South Indian category
export const fetchSouthIndianProducts = async (
  page = 1,
  limit = 20,
  filters = {}
) => {
  try {
    // Build query string with only provided filters
    const queryParams = new URLSearchParams({
      category: "south-indian",
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add optional filters only if they are provided
    if (filters.isVeg !== undefined) queryParams.append("isVeg", filters.isVeg);
    if (filters.isBestSeller !== undefined)
      queryParams.append("isBestSeller", filters.isBestSeller);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
    if (filters.prepTime) queryParams.append("prepTime", filters.prepTime);

    const response = await fetch(`${baseUrl}/api/product?${queryParams}`, {
      next: { revalidate: 300 }, // Disable caching for now to test
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.data.products;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// fetch products for tandoor

export const fetchTandoorProducts = async (
  page = 1,
  limit = 20,
  filters = {}
) => {
  try {
    // Build query string with only provided filters
    const queryParams = new URLSearchParams({
      category: "tandoor",
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add optional filters only if they are provided
    if (filters.isVeg !== undefined) queryParams.append("isVeg", filters.isVeg);
    if (filters.isBestSeller !== undefined)
      queryParams.append("isBestSeller", filters.isBestSeller);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
    if (filters.prepTime) queryParams.append("prepTime", filters.prepTime);

    const response = await fetch(`${baseUrl}/api/product?${queryParams}`, {
      next: { revalidate: 300 }, // Disable caching for now to test
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.data.products;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// fetch best selling products
export const fetchBestSellingProducts = async (page = 1, limit = 30) => {
  try {
    // Build query string with only provided filters
    const queryParams = new URLSearchParams({
      isBestSeller: "true",
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${baseUrl}/api/product?${queryParams}`);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.data.products;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

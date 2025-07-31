import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Product from "@/app/models/Product";

export const GET = asyncHandler(async (req) => {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50 items per page

  if (!query) return apiResponse(400, "Search query is required");

  // Validate pagination parameters
  if (page < 1) return apiResponse(400, "Page must be greater than 0");
  if (limit < 1) return apiResponse(400, "Limit must be greater than 0");

  const skip = (page - 1) * limit;

  let products = [];
  let totalCount = 0;

  // Create search filter for counting
  const searchFilter = {
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
    ],
  };

  // Try full-text search first
  try {
    products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .exec();

    // If we have text search results, count them differently
    if (products && products.length > 0) {
      totalCount = await Product.countDocuments({ $text: { $search: query } });
    }
  } catch (err) {
    console.error("Text search failed, falling back to regex");
  }

  // If no results, fallback to regex
  if (!products || products.length === 0) {
    products = await Product.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .exec();

    totalCount = await Product.countDocuments(searchFilter);
  }

  if (!products || products.length === 0) {
    return apiResponse(404, "No products found");
  }

  return apiResponse(200, "Products found", {
    products,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    hasMore: skip + products.length < totalCount,
  });
});

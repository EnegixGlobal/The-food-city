import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Product from "@/app/models/Product";

export const GET = asyncHandler(async (req) => {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query) return apiResponse(400, "Search query is required");

  const skip = (page - 1) * limit;

  let products = [];

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
  } catch (err) {
    console.error("Text search failed, falling back to regex");
  }

  // If no results, fallback to regex
  if (!products || products.length === 0) {
    products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  if (!products || products.length === 0) {
    return apiResponse(404, "No products found");
  }

  return apiResponse(200, "Products found", {
    products,
    currentPage: page,
    totalCount: await Product.countDocuments({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }),
  });
});

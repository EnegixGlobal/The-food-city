import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Product from "@/app/models/Product";

export const POST = asyncHandler(async (req) => {
  await connectDb();

  const body = await req.json();

  const {
    title,
    description,
    isVeg,
    price,
    discountedPrice,
    imageUrl,
    cloudinaryPublicId,
    category,
    isBestSeller,
    spicyLevel,
    prepTime,
    addOns,
  } = body;

  const requiredFields = {
    title,
    description,
    price,
    imageUrl,
    cloudinaryPublicId,
    category,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => !value)
    .map(([key]) => key); // Just repeat `key`, totally fine

  if (missingFields.length > 0) {
    return apiResponse(
      400,
      `Missing required field${
        missingFields.length > 1 ? "s" : ""
      }: ${missingFields.join(", ")}`
    );
  }

  // generating slug
  const slug = title.toLowerCase().replace(/ /g, "-");

  // check if product with this slug already exists
  const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    return apiResponse(400, "Product with this slug already exists");
  }

  const product = new Product({
    title,
    slug,
    description,
    isVeg,
    price,
    discountedPrice,
    imageUrl,
    cloudinaryPublicId,
    category,
    isBestSeller,
    spicyLevel,
    prepTime,
    addOns,
  });

  await product.save();

  if (!product) {
    return apiResponse(500, "Failed to create product");
  }

  return apiResponse(201, "Product created Successfully !", product);
});

// get products which has some query params
export const GET = asyncHandler(async (req) => {
  connectDb();

  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const isVeg = searchParams.get("isVeg");
  const isBestSeller = searchParams.get("isBestSeller");
  const spicyLevel = searchParams.get("spicyLevel");
  const prepTime = searchParams.get("prepTime");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const matchStage: any = {};

  if (category) {
    matchStage.category = category;
  }
  if (isVeg) {
    matchStage.isVeg = isVeg === "true";
  }
  if (isBestSeller) {
    matchStage.isBestSeller = isBestSeller === "true";
  }
  if (spicyLevel) {
    matchStage.spicyLevel = spicyLevel;
  }
  if (prepTime) {
    matchStage.prepTime = prepTime;
  }

  const sortStage: any = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const aggregation = [
    {
      $match: matchStage,
    },
    {
      $facet: {
        data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const products = await Product.aggregate(aggregation);
  if (!products || products.length === 0) {
    return apiResponse(404, "No products found");
  }
  const totalCount = products[0].totalCount[0]?.count || 0;
  const productsData = products[0].data;
  return apiResponse(200, "Products fetched successfully", {
    products: productsData,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  });
});

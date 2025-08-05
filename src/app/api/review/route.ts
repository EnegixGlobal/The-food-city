import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Product from "@/app/models/Product";
import Review from "@/app/models/Review";
import mongoose from "mongoose";

export const POST = asyncHandler(async (req) => {
  connectDb();
  const { productId, userId, rating, comment, imageUrl } = await req.json();

  // Validate required fields
  const requiredFields = { productId, userId, rating };
  const missingFields = Object.entries(requiredFields).filter(
    ([, value]) => !value
  );

  if (missingFields.length > 0) {
    return apiResponse(400, "Missing required fields", { missingFields });
  }
  if (rating < 1 || rating > 5) {
    return apiResponse(400, "Rating must be between 1 and 5");
  }

  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    return apiResponse(404, "Product not found");
  }

  // Create the review
  const review = new Review({
    productId,
    userId,
    rating,
    comment,
    imageUrl,
  });

  const savedReview = await review.save();

  // Update the product's average rating
  const reviews = await Review.find({ productId });
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, { rating: averageRating });
  product.ratingCount = reviews.length;
  await product.save();

  return apiResponse(200, "Review added successfully", { review: savedReview });
});

// get all the review of a product

export const GET = asyncHandler(async (req) => {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return apiResponse(400, "Product ID is required");
  }

  const reviews = await Review.aggregate([
    {
      $match: { productId: new mongoose.Types.ObjectId(productId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails"
    },
    {
      $project: {
        _id: 1,
        productId: 1,
        userId: {
          _id: "$userDetails._id",
          name: "$userDetails.name"
        },
        rating: 1,
        comment: 1,
        imageUrl: 1,
        createdAt: 1,
        isHelpful: 1,
        helpfullCount: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  return apiResponse(
    200,
    "All reviews of the product fetched successfully!",
    reviews
  );
});

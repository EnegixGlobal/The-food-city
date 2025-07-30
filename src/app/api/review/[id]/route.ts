import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import Product from "@/app/models/Product";
import Review from "@/app/models/Review";
import { NextRequest } from "next/server";

// get the review by id
export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Product id is required");
    }

    const review = await Review.findById(id);

    if (!review) {
      return apiResponse(404, "Review not found");
    }

    return apiResponse(200, "Review fetched successfully", review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return apiResponse(500, "Internal server error");
  }
};

// update the review
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Product id is required");
    }

    const body = await req.json();

    const review = await Review.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return apiResponse(404, "Review not found");
    }

    return apiResponse(200, "Review fetched successfully", review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return apiResponse(500, "Internal server error");
  }
};

// delete the review
export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Review id is required");
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return apiResponse(404, "Review not found");
    }

    // Optionally, you can also update the product's average rating after deletion
    const product = await Product.findById(review.productId);
    if (product) {
      // Recalculate the average rating
      const reviews = await Review.find({ productId: product._id });

      const averageRating =
        reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
      product.rating = averageRating;
      product.ratingCount = reviews.length;
      await product.save();
    }

    return apiResponse(200, "Review deleted successfully");
  } catch (error) {
    console.error("Error deleting review:", error);
    return apiResponse(500, "Internal server error");
  }
};

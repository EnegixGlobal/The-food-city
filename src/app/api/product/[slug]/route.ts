import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import Product from "@/app/models/Product";
import { deleteFromCloudinary } from "@/app/utils/deleteFromCloudinary";
import { NextRequest } from "next/server";

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) => {
  try {
    await connectDb();

    const { slug } = await context.params;

    if (!slug) {
      return apiResponse(400, "Product slug is required");
    }

    const product = await Product.aggregate([
      {
        $match: {
          slug,
        },
      },
      {
        $lookup: {
          from: "addons",
          localField: "addOns",
          foreignField: "_id",
          as: "addOns",
        },
      },
      {
        $unwind: {
          path: "$addOns",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          description: 1,
          isVeg: 1,
          price: 1,
          discountedPrice: 1,
          imageUrl: 1,
          cloudinaryPublicId: 1,
          category: 1,
          isBestSeller: 1,
          spicyLevel: 1,
          prepTime: 1,
          addOns: {
            _id: "$addOns._id",
            name: "$addOns.name",
            price: "$addOns.price",
            description: "$addOns.description",
            imageUrl: "$addOns.imageUrl",
          },
          rating: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!product) {
      return apiResponse(404, "Product not found");
    }

    return apiResponse(200, "Product fetched successfully", product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return apiResponse(500, "Internal server error");
  }
};

// update the product

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) => {
  try {
    await connectDb();

    const { slug } = await context.params;

    if (!slug) {
      return apiResponse(400, "Product slug is required");
    }

    const body = await req.json();

    if (!body) {
      return apiResponse(400, "Product data is required");
    }

    const { title } = body;
    if (title) {
      body.slug = title.toLowerCase().replace(/ /g, "-");
    }

    const product = await Product.findOneAndUpdate({ slug }, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return apiResponse(404, "Product not found");
    }

    return apiResponse(200, "Product updated successfully", product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return apiResponse(500, "Internal server error");
  }
};

export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) => {
  try {
    await connectDb();

    const { slug } = await context.params;

    if (!slug) {
      return apiResponse(400, "Product slug is required");
    }

    const product = await Product.findOneAndDelete({ slug });

    if (!product) {
      return apiResponse(404, "Product not found");
    }

    // Optionally, you can also delete the associated images from Cloudinary here
    deleteFromCloudinary(product.cloudinaryPublicId);

    return apiResponse(200, "Product Deleted Successfully", product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return apiResponse(500, "Internal server error");
  }
};



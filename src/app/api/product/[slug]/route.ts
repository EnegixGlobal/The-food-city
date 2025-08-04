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
          isCustomizable: 1,
          customizableOptions: 1,
          addOns: {
            $map: {
              input: "$addOns",
              as: "addon",
              in: {
                _id: "$$addon._id",
                title: "$$addon.title",
                price: "$$addon.price",
                description: "$$addon.description",
                imageUrl: "$$addon.imageUrl",
                rating: "$$addon.rating",
                isVeg: "$$addon.isVeg",
                ratingCount: "$$addon.ratingCount",
                isCustomizable: "$$addon.isCustomizable",
                customizableOptions: {
                  $ifNull: [
                    {
                      $map: {
                        input: "$$addon.customizableOptions",
                        as: "option",
                        in: {
                          option: "$$option.option",
                          price: "$$option.price",
                          isDefault: "$$option.isDefault",
                          isAvailable: "$$option.isAvailable",
                          _id: "$$option._id",
                        },
                      },
                    },
                    []
                  ]
                },
              },
            },
          },
          rating: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

  

    if (!product || product.length === 0) {
      return apiResponse(404, "Product not found");
    }

    // Clean up customizable options data structure for consistent frontend handling
    const cleanedProduct = product[0];
    if (
      cleanedProduct.customizableOptions &&
      Array.isArray(cleanedProduct.customizableOptions)
    ) {
      cleanedProduct.customizableOptions =
        cleanedProduct.customizableOptions.map((option: any) => {
          // Convert old structure to new structure if needed
          if (option.label !== undefined || option.value !== undefined) {
            return {
              option: option.label || option.value || option.option || "",
              price: option.price || 0,
            };
          }
          // Keep new structure as is
          return {
            option: option.option || "",
            price: option.price || 0,
          };
        });
    }

    return apiResponse(200, "Product fetched successfully", cleanedProduct);
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

    // Clean up customizable options data structure if needed
    if (body.customizableOptions && Array.isArray(body.customizableOptions)) {
      body.customizableOptions = body.customizableOptions.map((option: any) => {
        // If it has the old structure (label, value), convert to new structure (option, price)
        if (option.label !== undefined || option.value !== undefined) {
          return {
            option: option.label || option.value || option.option || "",
            price: option.price || 0,
          };
        }
        // If it already has the new structure, keep as is
        return {
          option: option.option || "",
          price: option.price || 0,
        };
      });
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
    console.error("Error updating product:", error);
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

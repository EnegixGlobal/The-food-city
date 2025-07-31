import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Coupon from "@/app/models/Coupon";

// create a coupon

export const POST = asyncHandler(async (req) => {
  connectDb();

  const body = await req.json();

  const {
    code,
    discountType,
    discountValue,
    applicableItems,
    startDate,
    endDate,
    usageLimit,
    isActive,
    offerImage,
  } = body;

  const requiredFields = {
    code,
    discountType,
    discountValue,
    applicableItems,
    startDate,
    endDate,
    usageLimit,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return apiResponse(
      400,
      `Missing required field${
        missingFields.length > 1 ? "s" : ""
      }: ${missingFields.join(", ")}`
    );
  }

  // check if this coupon code already exists
  const existing = await Coupon.findOne({ code: code.toUpperCase() });

  if (existing) {
    return apiResponse(400, "Coupon code already exists");
  }

  // creating coupon document
  const coupon = new Coupon({
    code,
    discountType,
    discountValue,
    applicableItems,
    startDate,
    endDate,
    usageLimit,
    offerImage,
    isActive: isActive || true, // default to true if not provided
  });

  const savedCoupon = await coupon.save();

  if (!savedCoupon) {
    return apiResponse(500, "Failed to create coupon");
  }

  return apiResponse(201, "Coupon created successfully", savedCoupon);
});

// get all coupons
export const GET = asyncHandler(async (_req) => {
  connectDb();

  const coupons = await Coupon.aggregate([
    {
      $match: {
        isActive: true, // Only fetch active coupons
        endDate: { $gte: new Date() }, // Ensure the coupon is still valid
      },
    },
    {
      $lookup: {
        from: "products", // Assuming the products collection is named "products"
        localField: "applicableItems",
        foreignField: "_id",
        as: "applicableProducts",
      },
    },
    {
      $project: {
        code: 1,
        discountType: 1,
        discountValue: 1,
        applicableItems: 1,
        startDate: 1,
        endDate: 1,
        usageLimit: 1,
        isActive: 1,
        offerImage: 1,
        applicableProducts: {
          $map: {
            input: "$applicableProducts",
            as: "product",
            in: {
              title: "$$product.title",
              price: "$$product.price",
              imageUrl: "$$product.imageUrl",
              _id: "$$product._id",
            }
          }
        },
      },
    },
  ]);

  if (!coupons || coupons.length === 0) {
    return apiResponse(404, "No active coupons found");
  }

  return apiResponse(200, "Coupons fetched successfully", coupons);
});

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
    isActive: isActive || true, // default to true if not provided
  });

  const savedCoupon = await coupon.save();

  if (!savedCoupon) {
    return apiResponse(500, "Failed to create coupon");
  }

  return apiResponse(201, "Coupon created successfully", savedCoupon);
});

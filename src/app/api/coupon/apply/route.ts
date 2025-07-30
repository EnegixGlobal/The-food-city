import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Coupon from "@/app/models/Coupon";

export const POST = asyncHandler(async (req) => {
  connectDb();

  const { couponCode, cartItems } = await req.json();

  if (!couponCode || !Array.isArray(cartItems) || cartItems.length === 0) {
    return apiResponse(400, "Coupon code and items are required");
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    // $expr: { $lt: ["$usageLimit", "$userCount"] },
  });

  if (!coupon) {
    return apiResponse(400, "Invalid or expired coupon");
  }

  let totalDiscount = 0;

  for (const item of cartItems) {
    const isApplicable = coupon.applicableItems.some(
      (id: { toString: () => any }) => id.toString() === item._id.toString()
    );

    if (isApplicable) {
      if (coupon.discountType === "percentage") {
        totalDiscount +=
          ((item.price * coupon.discountValue) / 100) * item.quantity;
      } else if (coupon.discountType === "fixed") {
        totalDiscount += coupon.discountValue * item.quantity;
      }
    }
  }

  // increase usage count
  coupon.userCount += 1;
  await coupon.save();

  return apiResponse(200, "Coupon Applied Successfully !", {
    discountAmount: totalDiscount,
    couponId: coupon._id,
    couponCode: coupon.code,
  });
});

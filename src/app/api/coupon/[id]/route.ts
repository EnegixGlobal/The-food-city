import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import Coupon from "@/app/models/Coupon";
import { NextRequest } from "next/server";

// fetch particular coupon by id
export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Product slug is required");
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return apiResponse(404, "Coupon not found");
    }

    return apiResponse(200, "Coupon fetched successfully", coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return apiResponse(500, "Internal server error");
  }
};

// update the coupon
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Coupon ID is required");
    }

    const body = await req.json();

    if (!body) {
      return apiResponse(400, "Coupon data is required");
    }

    const coupon = await Coupon.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return apiResponse(404, "Coupon not found");
    }

    return apiResponse(200, "Coupon updated successfully", coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return apiResponse(500, "Internal server error");
  }
};

// delete the coupon or auto delete after the date is end

export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Coupon ID is required");
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return apiResponse(404, "Coupon not found");
    }

    return apiResponse(200, "Coupon deleted successfully");
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return apiResponse(500, "Internal server error");
  }
};

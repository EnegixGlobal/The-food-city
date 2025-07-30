import connectDb from "@/app/db/connectDb";
import { apiError } from "@/app/lib/ApiError";
import { apiResponse } from "@/app/lib/apiResponse";
import AddOn from "@/app/models/AddOns";
import { deleteFromCloudinary } from "@/app/utils/deleteFromCloudinary";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;

  try {
    connectDb();
    if (!id) {
      return apiError(400, "Add-on ID is required");
    }

    const addon = await AddOn.findById(id);

    if (!addon) {
      return apiError(404, "Add-on not found");
    }

    return apiResponse(200, "Add-on fetched successfully", addon);
  } catch (_error) {
    return apiError(500, "Internal server error");
  }
};

// update the add-on
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;

  try {
    connectDb();
    if (!id) {
      return apiError(400, "Add-on ID is required");
    }

    const body = await req.json();

    const addon = await AddOn.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!addon) {
      return apiError(404, "Add-on not found");
    }

    return apiResponse(200, "Add-on Updated successfully", addon);
  } catch (_error) {
    return apiError(500, "Internal server error");
  }
};


// delete the add-on
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;

  try {
    connectDb();
    if (!id) {
      return apiError(400, "Add-on ID is required");
    }

    const addon = await AddOn.findByIdAndDelete(id);

    if (!addon) {
      return apiError(404, "Add-on not found");
    }

    // delete cloudinary image
    deleteFromCloudinary(addon?.imagePublicId);

    return apiResponse(200, "Add-on deleted successfully", addon);
  } catch (_error) {
    return apiError(500, "Internal server error");
  }
};

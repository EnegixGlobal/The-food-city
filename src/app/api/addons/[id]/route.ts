import connectDb from "@/app/db/connectDb";
import { apiError } from "@/app/lib/ApiError";
import { apiResponse } from "@/app/lib/apiResponse";
import AddOn from "@/app/models/AddOns";
import { deleteFromCloudinary } from "@/app/utils/deleteFromCloudinary";
import { NextRequest } from "next/server";

export const GET = async (
  _req: NextRequest,
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
  } catch (error) {
    console.error("Error fetching add-on:", error);
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

    // Validate customizable options if being updated
    if (body.isCustomizable && body.customizableOptions) {
      for (const option of body.customizableOptions) {
        if (!option.option || option.option.trim() === '') {
          return apiError(
            400,
            "Each customizable option must have a valid option name"
          );
        }
        if (option.price === undefined || option.price < 0) {
          return apiError(
            400,
            "Each customizable option must have a valid price (0 or greater)"
          );
        }
      }
    }

    // If setting isCustomizable to false, clear customizableOptions
    if (body.isCustomizable === false) {
      body.customizableOptions = [];
    }

    const addon = await AddOn.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!addon) {
      return apiError(404, "Add-on not found");
    }

    return apiResponse(200, "Add-on Updated successfully", addon);
  } catch (error) {
    console.error("Error updating add-on:", error);
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
  } catch (error) {
    console.error("Error deleting add-on:", error);
    return apiError(500, "Internal server error");
  }
};

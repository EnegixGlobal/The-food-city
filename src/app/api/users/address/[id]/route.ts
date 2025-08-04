import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib";
import Address from "@/app/models/Address";
import { getDataFromToken } from "@/app/utils/getDataFromToken";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const userId = getDataFromToken(req);

    if (!userId) {
      return apiResponse(401, "Unauthorized access");
    }

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Product id is required");
    }

    const address = await Address.findOne({ _id: id, user: userId });

    return apiResponse(200, "Address Fetched successfully", address);
  } catch (error) {
    console.error("Error fetching product:", error);
    return apiResponse(500, "Internal server error");
  }
};

// update the address
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
    const userId = getDataFromToken(req);

    if (!userId) {
      return apiResponse(401, "Unauthorized access");
    }

    const body = await req.json();

    if (!body || !body.fullAddress) {
      return apiResponse(400, "Full address is required");
    }

    console.log(body);

    const address = await Address.findOneAndUpdate(
      { _id: id },
      {
        fullAddress: body.fullAddress.trim(),
        pincode: body.pincode ? body.pincode.trim() : undefined,
        doorOrFlatNo: body.doorOrFlat ? body.doorOrFlat.trim() : undefined,
        landmark: body.landmark ? body.landmark.trim() : undefined,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return apiResponse(200, "Address Updated successfully", address);
  } catch (error) {
    console.error("Error Updating Address:", error);
    return apiResponse(500, "Internal server error");
  }
};

// delete the address

export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();
    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Product id is required");
    }

    const userId = getDataFromToken(req);

    if (!userId) {
      return apiResponse(401, "Unauthorized access");
    }

    const deletedAddress = await Address.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedAddress) {
      return apiResponse(
        404,
        "Address not found or you don't have permission to delete this address"
      );
    }

    return apiResponse(200, "Address deleted successfully", deletedAddress);
  } catch (error) {
    console.error("Error deleting address:", error);
    return apiResponse(500, "Internal server error");
  }
};

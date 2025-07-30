import connectDb from "@/app/db/connectDb";
import { apiError } from "@/app/lib/ApiError";
import { apiResponse } from "@/app/lib/apiResponse";
import Company from "@/app/models/Company";
import { NextRequest } from "next/server";

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

    const company = await Company.findById(id).select("-password -__v");

    if (!company) {
      return apiError(404, "Company not found");
    }

    return apiResponse(200, "Company fetched successfully", company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return apiError(500, "Internal server error");
  }
};

// update the company

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Company id is required");
    }

    const body = await req.json();

    const company = await Company.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      select: "-password -__v",
    });
    if (!company) {
      return apiError(404, "Company not found");
    }

    return apiResponse(200, "Company updated successfully", company);
  } catch (error) {
    console.error("Error updating company:", error);
    return apiError(500, "Internal server error");
  }
};

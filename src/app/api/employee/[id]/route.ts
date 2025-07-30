import connectDb from "@/app/db/connectDb";
import { apiError } from "@/app/lib/ApiError";
import { apiResponse } from "@/app/lib/apiResponse";
import Employee from "@/app/models/Employee";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;

  try {
    connectDb();
    if (!id) {
      return apiError(400, "Employee ID is required");
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return apiError(404, "Employee not found");
    }

    return apiResponse(200, "Employee fetched successfully", employee);
  } catch (error) {
    return apiError(500, "Internal server error");
  }
};

// update the employee

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;

  try {
    connectDb();
    if (!id) {
      return apiError(400, "Employee ID is required");
    }

    // getting data from the body
    const body = await req.json();

    const employee = await Employee.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return apiError(404, "Employee not found");
    }

    return apiResponse(200, "Employee updated successfully", employee);
  } catch (error) {
    return apiError(500, "Internal server error");
  }
};

// delete the employee

export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;

  try {
    connectDb();
    if (!id) {
      return apiError(400, "Employee ID is required");
    }

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return apiError(404, "Employee not found");
    }

    return apiResponse(200, "Employee deleted successfully", employee);
  } catch (error) {
    return apiError(500, "Internal server error");
  }
};

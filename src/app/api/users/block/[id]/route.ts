import connectDb from "@/app/db/connectDb";
import { apiError, apiResponse } from "@/app/lib";
import User from "@/app/models/User";
import { getCompanyIdFromToken } from "@/app/utils/getCompanyIdFromToken";
import { NextRequest } from "next/server";

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

    const companyId = getCompanyIdFromToken(req);

    if (!companyId) {
      return apiResponse(400, "UnAuthorized Access, Admin Login Required");
    }

    const user = await User.findById(id);

    if (!user) {
      return apiResponse(404, "User not found");
    }

    // Toggle the isBlocked status
    user.isBlocked = !user.isBlocked;
    await user.save();

    return apiResponse(200, "User Blocked status changed successfully.", user);
  } catch (error) {
    console.error("Error fetching company:", error);
    return apiError(500, "Internal server error");
  }
};

import connectDb from "@/app/db/connectDb";
import { apiResponse, asyncHandler } from "@/app/lib";
import User from "@/app/models/User";
import { getDataFromToken } from "@/app/utils/getDataFromToken";

export const PATCH = asyncHandler(async (req) => {
  connectDb();

  const userId = getDataFromToken(req);

  if (!userId) {
    return apiResponse(401, "Authentication failed");
  }

  const body = await req.json();

  const user = await User.findByIdAndUpdate(userId, body, {
    new: true,
    runValidators: true,
  }).select("-__v -password");

  if (!user) {
    return apiResponse(404, "User not found");
  }

  return apiResponse(200, "User updated successfully", user);

  // Handle phone update
});

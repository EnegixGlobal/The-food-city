import { apiResponse, asyncHandler } from "@/app/lib";
import Company from "@/app/models/Company";
import User from "@/app/models/User";
import { getCompanyIdFromToken } from "@/app/utils/getCompanyIdFromToken";

export const GET = asyncHandler(async (req) => {
  const companyId = getCompanyIdFromToken(req);

  console.log(companyId);

  if (!companyId) {
    return apiResponse(400, "UnAuthorized Access , Admin Login Required");
  }

  const company = await Company.findById(companyId);

  if (!company) {
    return apiResponse(404, "Company Not Found");
  }

  const users = await User.find({}).select("-password -__v");

  if (!users) {
    return apiResponse(404, "No Users Found");
  }

  return apiResponse(200, "All User Fetched Successfully", users);
});

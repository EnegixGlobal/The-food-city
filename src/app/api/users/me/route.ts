import connectDb from "@/app/db/connectDb";
import { apiError } from "@/app/lib/apiError";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import User from "@/app/models/User";
import { getDataFromToken } from "@/app/utils/getDataFromToken";

export const GET = asyncHandler(async (req)=> {
    connectDb();

    const userId = getDataFromToken(req);

    if(!userId ) {
        return apiError(401, "Unauthorized access");
    }

    // finding the user 
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
        return apiError(404, "User not found");
    }

    // return the user data
    return apiResponse(200, "User data retrieved successfully", user);

})
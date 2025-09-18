import connectDb from "@/app/db/connectDb";
import User from "@/app/models/User";
import { apiResponse } from "@/app/lib/apiResponse";
import { apiError } from "@/app/lib/ApiError";
import { asyncHandler } from "@/app/lib";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const { name, email } = await req.json();

  if (!name) return apiError(400, "Name is required!");
  if (!email) return apiError(400, "Email is required!");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) return apiError(400, "Invalid email format!");

  // Check if user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return apiError(400, "User already exists with this email!");
  }

  const user = new User({ name, email });
  const savedUser = await user.save();

  return apiResponse(201, "User Created Successfully!", savedUser);
});

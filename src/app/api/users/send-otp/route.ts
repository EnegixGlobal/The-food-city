import connectDb from "@/app/db/connectDb";
import bcryptjs from "bcryptjs";
import User from "@/app/models/User";
import { apiError } from "@/app/lib/ApiError";
import { asyncHandler } from "@/app/lib/asyncHandler";
import { apiResponse } from "@/app/lib/apiResponse";
import {
  generateOTP,
  normalizePhoneNumber,
  sendOTP,
} from "@/app/utils/sendOtp";
import Otp from "@/app/models/Otp";

export const POST = asyncHandler(async (req) => {
  const { phone } = await req.json();

  if (!phone) {
    return apiError(400, "Phone number is required");
  }

  // if phone is more than 10 digits, normalize it return error
  if (phone.length > 10) {
    return apiError(400, "Phone number should not exceed 10 digits!");
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  // Do something with phone...
  await connectDb();

  const user = await User.findOne({ phone: normalizedPhone });

  if (!user) {
    return apiError(404, "User not found");
  }

  const otp = generateOTP();

  sendOTP(normalizedPhone, otp);

  const hashedOtp = await bcryptjs.hash(otp, 10);

  const newOtp = new Otp({
    phone: normalizedPhone,
    otp: hashedOtp,
  });

  await newOtp.save();

  return apiResponse(200, "OTP sent successfully", {
    otp,
  });
});

import connectDb from "@/app/db/connectDb";
import bcryptjs from "bcryptjs";
import User from "@/app/models/User";
import { apiError } from "@/app/lib/ApiError";
import { asyncHandler } from "@/app/lib/asyncHandler";
import jwt from "jsonwebtoken";
import Otp from "@/app/models/Otp";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  const { otp, email } = await req.json();

  if (!otp) return apiError(400, "OTP is required");
  if (!email) return apiError(400, "Email is required");

  await connectDb();

  // Find the most recent OTP for this email
  const savedOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!savedOtp) {
    return apiError(404, "OTP not found or expired");
  }

  const isOtpValid = await bcryptjs.compare(otp, savedOtp.otp);
  if (!isOtpValid) {
    savedOtp.attempts += 1;
    await savedOtp.save();

    if (savedOtp.attempts >= 3) {
      await Otp.deleteOne({ _id: savedOtp._id });
      return apiError(400, "Maximum OTP attempts exceeded. Please request a new OTP");
    }

    return apiError(400, "Invalid OTP");
  }

  // find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return apiError(404, "User not found");
  }

  await Otp.deleteOne({ _id: savedOtp._id });

  // generate JWT token
  const tokenData = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return apiError(500, "JWT secret not configured");
  }

  const token = jwt.sign(tokenData, jwtSecret, { 
    expiresIn: process.env.JWT_EXPIRES_IN || "7d" 
  } as jwt.SignOptions);

  const response = NextResponse.json({
    message: "Login successful",
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    },
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 2, // 2 days
    path: "/",
  });

  return response;
});

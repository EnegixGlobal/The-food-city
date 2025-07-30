import connectDb from "@/app/db/connectDb";
import { apiError } from "@/app/lib/apiError";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Company from "@/app/models/Company";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  connectDb();
  const { email, password } = await req.json();

  // Validate required fields

  if (!email || !password) {
    return apiResponse(400, "Email and password are required");
  }

  // Check if company exists
  const company = await Company.findOne({ email });

  if (!company) {
    return apiResponse(404, "Company not found");
  }

  // compare password
  const isMatch = await bcrypt.compare(password, company.password);

  if (!isMatch) {
    return apiResponse(401, "Invalid credentials");
  }

  // usig jwt for token generation
  const tokenData = {
    id: company._id,
    name: company.name,
    phone: company.phone,
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return apiError(500, "JWT secret not configured");
  }

  const token = jwt.sign(tokenData, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);

  const response = NextResponse.json({
    message: "Login successful",
    success: true,
    data: {
      user: {
        id: company._id,
        name: company.name,
        phone: company.phone,
        email: company.email,
      },
      token,
    },
  });

  response.cookies.set("company-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 2, // 2 days
    path: "/",
  });

  return response;
});

import connectDb from "@/app/db/connectDb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/models/User";
import { apiResponse } from "@/app/lib/apiResponse";
import { apiError } from "@/app/lib/apiError";
import { normalizePhoneNumber } from "@/app/utils/sendOtp";

// Input validation schema
export async function POST(request: NextRequest) {
  const { phone, name, email } = await request.json();

  console.log("Received data:", { phone, name, email });

  if (!phone) {
    return apiError(400, "Phone number is required!");
  }

  if (!name) {
    return apiError(400, "Name is required!");
  }

  if (!email) {
    return apiError(400, "Email is required!");
  }

  // if phone is more than 10 digits, normalize it return error
  if (phone.length > 10) {
    return apiError(400, "Phone number should not exceed 10 digits!");
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validPhone = normalizePhoneNumber(phone);
  if (!isValidEmail) return apiError(400, "Invalid email format!");

  try {
    await connectDb();

    // Check if user already exists
    const existedUser = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (existedUser) {
      return apiError(400, "User already exists with this phone or email!");
    }

    const user = new User({
      phone : validPhone,
      name,
      email,
    });

    const savedUser = await user.save();

    return apiResponse(201, "User Created Successfully!", savedUser);
  } catch (error) {
    return apiError(500, "Failed to Create User");
  }
}

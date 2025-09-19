import connectDb from "@/app/db/connectDb";
import User from "@/app/models/User";
import { apiResponse } from "@/app/lib/apiResponse";
import { apiError } from "@/app/lib/ApiError";
import { asyncHandler } from "@/app/lib";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const { name, email, phone } = await req.json();

  if (!name) return apiError(400, "Name is required!");
  if (!email) return apiError(400, "Email is required!");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) return apiError(400, "Invalid email format!");

  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    return apiError(400, "Please enter a valid 10-digit phone number");
  }

  // Check if user already exists by email OR phone (if provided)
  const query: Array<Record<string, unknown>> = [{ email }];
  if (phone) query.push({ phone });
  const existedUser = await User.findOne({ $or: query });
  if (existedUser) {
    if (existedUser.email === email) {
      return apiError(409, "User already exists with this email", { conflictField: "email" });
    }
    return apiError(409, "User already exists with this phone number", { conflictField: "phone" });
  }

  try {
    const user = new User({ name, email, phone });
    const savedUser = await user.save();
    // Exclude internal fields
    const sanitized = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      createdAt: savedUser.createdAt,
    };
    return apiResponse(201, "User Created Successfully!", sanitized);
  } catch (err) {
    // Handle potential race-condition duplicate key error
    interface MongoLikeError {
      code?: number;
      keyPattern?: Record<string, unknown>;
    }
    const e = err as MongoLikeError;
    if (e && e.code === 11000) {
      const dupField = Object.keys(e.keyPattern || {})[0] || "field";
      return apiError(409, `A user already exists with this ${dupField}`, { conflictField: dupField });
    }
    throw err; // Let asyncHandler convert unexpected errors
  }
});

import { NextRequest } from "next/server";
import { apiResponse } from "@/app/lib/apiResponse";
import { getDataFromToken } from "./getDataFromToken";
import User from "@/app/models/User";
import connectDb from "@/app/db/connectDb";

export interface AuthenticatedUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface AuthResult {
  success: true;
  user: AuthenticatedUser;
}

export interface AuthError {
  success: false;
  response: Response;
}

export const authenticateUser = async (request: NextRequest): Promise<AuthResult | AuthError> => {
  try {
    await connectDb();

    // Get user ID from token
    const userId = getDataFromToken(request);
    
    // Check if token validation failed
    if (typeof userId === "object" && "success" in userId && !userId.success) {
      return {
        success: false,
        response: apiResponse(401, userId.message || "Authentication failed"),
      };
    }

    // Verify user exists in database
    const user = await User.findById(userId).select("-__v");
    if (!user) {
      return {
        success: false,
        response: apiResponse(401, "User not found. Please login again."),
      };
    }

    // Return user data
    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      response: apiResponse(401, "Invalid or expired token. Please login again."),
    };
  }
};

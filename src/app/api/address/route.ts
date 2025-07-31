import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import User from "@/app/models/User";
import { authenticateUser } from "@/app/utils/authMiddleware";

// GET /api/address - Get all addresses for the authenticated user
export const GET = asyncHandler(async (req) => {
  connectDb();

  // Authenticate user first
  const authResult = await authenticateUser(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const user = authResult.user!;

  try {
    const userData = await User.findById(user.id).select('address');
    
    if (!userData) {
      return apiResponse(404, "User not found");
    }

    return apiResponse(200, "Addresses fetched successfully", {
      addresses: userData.address || []
    });
  } catch (error) {
    return apiResponse(500, "Failed to fetch addresses");
  }
});

// POST /api/address - Add a new address
export const POST = asyncHandler(async (req) => {
  connectDb();

  // Authenticate user first
  const authResult = await authenticateUser(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const user = authResult.user!;
  const { fullAddress, pincode } = await req.json();

  // Validate required fields
  if (!fullAddress || fullAddress.trim() === '') {
    return apiResponse(400, "Full address is required");
  }

  // Validate pincode if provided
  if (pincode && !/^\d{6}$/.test(pincode)) {
    return apiResponse(400, "Please enter a valid 6-digit pincode");
  }

  try {
    const userData = await User.findById(user.id);
    
    if (!userData) {
      return apiResponse(404, "User not found");
    }

    // Initialize address array if it doesn't exist
    if (!userData.address) {
      userData.address = [];
    }

    // Create new address object
    const newAddress = {
      fullAddress: fullAddress.trim(),
      ...(pincode && { pincode: pincode.trim() })
    };

    // Add new address
    userData.address.push(newAddress);
    
    await userData.save();

    return apiResponse(201, "Address added successfully", {
      addresses: userData.address
    });
  } catch (error) {
    return apiResponse(500, "Failed to add address");
  }
});
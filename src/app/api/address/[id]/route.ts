import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import User from "@/app/models/User";
import { authenticateUser } from "@/app/utils/authMiddleware";
import { NextRequest } from "next/server";

// PUT /api/address/[id] - Update an address
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Authenticate user first
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user!;
    const { id: addressId } = await context.params;
    const { fullAddress, pincode } = await req.json();

    // Validate required fields
    if (!fullAddress || fullAddress.trim() === '') {
      return apiResponse(400, "Full address is required");
    }

    // Validate pincode if provided
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return apiResponse(400, "Please enter a valid 6-digit pincode");
    }

    if (!addressId) {
      return apiResponse(400, "Address ID is required");
    }

    const userData = await User.findById(user.id);
    
    if (!userData) {
      return apiResponse(404, "User not found");
    }

    if (!userData.address || userData.address.length === 0) {
      return apiResponse(404, "No addresses found");
    }

    // Find and update the address
    const addressIndex = userData.address.findIndex((addr: any) => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return apiResponse(404, "Address not found");
    }

    // Update the address fields
    userData.address[addressIndex].fullAddress = fullAddress.trim();
    if (pincode !== undefined) {
      userData.address[addressIndex].pincode = pincode ? pincode.trim() : undefined;
    }
    
    await userData.save();

    return apiResponse(200, "Address updated successfully", {
      addresses: userData.address
    });
  } catch (error) {
    return apiResponse(500, "Failed to update address");
  }
};

// DELETE /api/address/[id] - Delete an address
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Authenticate user first
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user!;
    const { id: addressId } = await context.params;

    if (!addressId) {
      return apiResponse(400, "Address ID is required");
    }

    const userData = await User.findById(user.id);
    
    if (!userData) {
      return apiResponse(404, "User not found");
    }

    if (!userData.address || userData.address.length === 0) {
      return apiResponse(404, "No addresses found");
    }

    // Find and remove the address
    const addressIndex = userData.address.findIndex((addr: any) => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return apiResponse(404, "Address not found");
    }

    userData.address.splice(addressIndex, 1);
    
    await userData.save();

    return apiResponse(200, "Address deleted successfully", {
      addresses: userData.address
    });
  } catch (error) {
    return apiResponse(500, "Failed to delete address");
  }
};
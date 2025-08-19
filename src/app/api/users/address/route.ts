import connectDb from "@/app/db/connectDb";
import { apiResponse, asyncHandler } from "@/app/lib";
import Address from "@/app/models/Address";
import { getDataFromToken } from "@/app/utils/getDataFromToken";

// Force dynamic rendering & disable static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = asyncHandler(async (req) => {
  connectDb();
  // Authenticate user first
  const userId = getDataFromToken(req);

  if (!userId) {
    return apiResponse(401, "Authentication failed");
  }

  const address = await Address.find({ user: userId }).lean();

  if (!address || address.length === 0) {
    return apiResponse(404, "No addresses found for this user");
  }

  return apiResponse(200, "User Address Fetched Successfully", address);
});

// create a new address and save it to user which belongs to it
export const POST = asyncHandler(async (req) => {
  connectDb();
  // Authenticate user first
  const userId = getDataFromToken(req);

  if (!userId) {
    return apiResponse(401, "Authentication failed");
  }

  const { fullAddress, pincode, doorOfFlat, landmark } = await req.json();

  // Validate required fields
  if (!fullAddress || fullAddress.trim() === "") {
    return apiResponse(400, "Full address is required");
  }

  // Validate pincode if provided
  if (pincode && !/^\d{6}$/.test(pincode)) {
    return apiResponse(400, "Please enter a valid 6-digit pincode");
  }

  try {
  const newAddress = new Address({
      user: userId,
      fullAddress: fullAddress.trim(),
      pincode: pincode,
      doorOrFlatNo: doorOfFlat ? doorOfFlat.trim() : undefined,
      landmark: landmark ? landmark.trim() : undefined,
    });

    await newAddress.save();

  return apiResponse(201, "Address created successfully", newAddress);
  } catch (error) {
    console.error("Error creating address:", error);
    return apiResponse(500, "Internal server error");
  }
});

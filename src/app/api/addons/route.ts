import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import AddOn from "@/app/models/AddOns";

export const POST = asyncHandler(async (res) => {
  const body = await res.json();

  const { title, price, description, imageUrl, isVeg, imagePublicId } = body;

  const requiredFields = {
    title,
    description,
    price,
    imageUrl,
    isVeg,
    imagePublicId,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return apiResponse(
      400,
      `Missing required field${
        missingFields.length > 1 ? "s" : ""
      }: ${missingFields.join(", ")}`
    );
  }

  const addons = new AddOn({
    title,
    price,
    description,
    imageUrl,
    isVeg,
    imagePublicId,
  });

  const savedAddon = await addons.save();

  if (!savedAddon) {
    return apiResponse(500, "Failed to create add-on");
  }

  return apiResponse(201, "Add-on created successfully", savedAddon);
});

// fetch all addons
export const GET = asyncHandler(async () => {
  const addons = await AddOn.find({}).sort({ createdAt: -1 }).exec();

  if (!addons || addons.length === 0) {
    return apiResponse(404, "No add-ons found");
  }

  return apiResponse(200, "Add-ons fetched successfully", addons);
});

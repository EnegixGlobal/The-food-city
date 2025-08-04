import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import AddOn from "@/app/models/AddOns";

export const POST = asyncHandler(async (res) => {
  const body = await res.json();

  const {
    title,
    price,
    description,
    imageUrl,
    isVeg,
    imagePublicId,
    isCustomizable,
    customizableOptions,
  } = body;

  const requiredFields = {
    title,
    imageUrl,
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

  // Validate customizable options if provided
  if (isCustomizable && customizableOptions) {
    for (const option of customizableOptions) {
      if (!option.option || option.option.trim() === "") {
        return apiResponse(
          400,
          "Each customizable option must have a valid option name"
        );
      }
      if (option.price === undefined || option.price < 0) {
        return apiResponse(
          400,
          "Each customizable option must have a valid price (0 or greater)"
        );
      }
    }
  }

  const addonData = {
    title,
    price,
    description,
    imageUrl,
    isVeg,
    imagePublicId,
    isCustomizable: isCustomizable || false,
    customizableOptions: isCustomizable ? customizableOptions || [] : [],
  };

  const addons = new AddOn(addonData);

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

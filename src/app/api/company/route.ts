import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Company from "@/app/models/Company";
import bcrypt from "bcryptjs";

export const POST = asyncHandler(async (req) => {
  connectDb();
  const { name, email, password } = await req.json();

  // Validate required fields
  const requiredFields = { name, email, password };
  const missingFields = Object.entries(requiredFields).filter(
    ([_, value]) => !value
  );

  if (missingFields.length) {
    return apiResponse(400, "Missing required fields", { missingFields });
  }

  const existingCompany = await Company.find({});
  if (existingCompany.length > 0) {
    return apiResponse(400, "Company already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  if (!hashedPassword) {
    return apiResponse(500, "Failed to hash password");
  }

  // create company
  const company = new Company({
    name,
    email,
    password: hashedPassword,
  });

  await company.save();

  // return success response
  if (!company) {
    return apiResponse(500, "Failed to create company");
  }

  return apiResponse(201, "Company created Successfully !", { company });
});

// create a new employee

import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Employee from "@/app/models/Employee";

export const POST = asyncHandler(async (req) => {
  connectDb();
  const { name, email, phone, whatsapp, address, avatar } = await req.json();

  const requiredFields = {
    name,
    phone,
    whatsapp,
    address,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return apiResponse(
      400,
      `Missing required field${
        missingFields.length > 1 ? "s" : ""
      }: ${missingFields.join(", ")}`
    );
  }

  const existingEmployee = await Employee.findOne({ $or: [{ email }, { phone }] });

  if (existingEmployee) {
    return apiResponse(400, "Employee with this email or phone number already exists");
  }

  const employee = new Employee({
    name, 
    email,
    phone, 
    whatsapp,
    address,
    avatar,
  })

  const savedEmployee = await employee.save();

  if(!savedEmployee) {
    return apiResponse(500, "Failed to create employee");
  }

  return apiResponse(201, "Employee created successfully", employee);
});

// fetching all employees
export const GET = asyncHandler(async (_req) => {
  await connectDb();

  const employees = await Employee.find({});

  if (!employees || employees.length === 0) {
    return apiResponse(404, "No employees found");
  }

  return apiResponse(200, "Employees fetched successfully", employees);
});

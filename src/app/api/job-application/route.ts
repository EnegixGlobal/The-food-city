import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import JobApplication from "@/app/models/JobApplication";

// POST - Submit job application
export const POST = asyncHandler(async (req) => {
  await connectDb();
  
  const {
    name,
    email,
    phone,
    position,
    experience,
    qualification,
    currentLocation,
    expectedSalary,
    noticePeriod,
    resumeUrl,
    coverLetter,
  } = await req.json();

  // Validate required fields
  const requiredFields = {
    name,
    email,
    phone,
    position,
    experience,
    qualification,
    currentLocation,
    expectedSalary,
    noticePeriod,
    resumeUrl,
  };

  const missingFields = Object.entries(requiredFields).filter(
    ([, value]) => !value
  );

  if (missingFields.length > 0) {
    return apiResponse(400, "Missing required fields", {
      missingFields: missingFields.map(([field]) => field),
    });
  }

  // Check if application already exists with same email and position
  const existingApplication = await JobApplication.findOne({
    email,
    position,
    status: { $in: ["Applied", "Under Review", "Shortlisted"] },
  });

  if (existingApplication) {
    return apiResponse(
      409,
      "You have already applied for this position. Please wait for our response."
    );
  }

  // Create new job application
  const jobApplication = new JobApplication({
    name,
    email,
    phone,
    position,
    experience,
    qualification,
    currentLocation,
    expectedSalary,
    noticePeriod,
    resumeUrl,
    coverLetter,
  });

  const savedApplication = await jobApplication.save();

  return apiResponse(
    200,
    "Job application submitted successfully! We will review your application and get back to you soon.",
    {
      applicationId: savedApplication._id,
      position: savedApplication.position,
      appliedAt: savedApplication.appliedAt,
    }
  );
});

// GET - Get all job applications (for admin)
export const GET = asyncHandler(async (req) => {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1") || 1;
  const limit = parseInt(searchParams.get("limit") || "10") || 10;

  // Build filter object
  const filter: any = {};
  if (position && position !== "all") {
    filter.position = position;
  }
  if (status && status !== "all") {
    filter.status = status;
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Get applications with pagination
  const applications = await JobApplication.find(filter)
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  // Debug: Log the resume URLs
  console.log("Applications with resume URLs:", applications.map(app => ({
    name: app.name,
    resumeUrl: app.resumeUrl,
    urlValid: app.resumeUrl && app.resumeUrl.startsWith('http')
  })));

  // Get total count for pagination
  const totalCount = await JobApplication.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / limit);

  return apiResponse(200, "Job applications retrieved successfully", {
    applications,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// DELETE - Delete job application (for admin)
export const DELETE = asyncHandler(async (req) => {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return apiResponse(400, "Application ID is required");
  }

  // Find and delete the application
  const deletedApplication = await JobApplication.findByIdAndDelete(id);

  if (!deletedApplication) {
    return apiResponse(404, "Job application not found");
  }

  return apiResponse(200, "Job application deleted successfully", {
    deletedApplication: {
      id: deletedApplication._id,
      name: deletedApplication.name,
      position: deletedApplication.position,
    },
  });
});

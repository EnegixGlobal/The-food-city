import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { NextRequest } from "next/server";
import JobApplication from "@/app/models/JobApplication";

// GET - Get single job application with resume validation
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDb();

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse(400, "Application ID is required");
    }

    const application = await JobApplication.findById(id);

    if (!application) {
      return apiResponse(404, "Job application not found");
    }

    // Validate resume URL
    let resumeValid = false;
    if (application.resumeUrl) {
      try {
        // Check if URL is accessible
        const response = await fetch(application.resumeUrl, { method: 'HEAD' });
        resumeValid = response.ok;
        console.log(`Resume URL check for ${application.name}: ${response.status} - ${resumeValid}`);
      } catch (error) {
        console.error(`Resume URL validation failed for ${application.name}:`, error);
        resumeValid = false;
      }
    }

    return apiResponse(200, "Job application retrieved successfully", {
      application: {
        ...application.toObject(),
        resumeUrlValid: resumeValid,
      },
    });
  } catch (error: any) {
    console.error("Error getting job application:", error);
    return apiResponse(500, error.message || "Internal Server Error");
  }
}

// PATCH - Update job application status
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDb();

    const params = await context.params;
    const { id } = params;
    const { status } = await req.json();

    if (!id) {
      return apiResponse(400, "Application ID is required");
    }

    if (!status) {
      return apiResponse(400, "Status is required");
    }

    const validStatuses = ["Applied", "Under Review", "Shortlisted", "Interviewed", "Rejected", "Hired"];
    if (!validStatuses.includes(status)) {
      return apiResponse(400, "Invalid status value");
    }

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return apiResponse(404, "Job application not found");
    }

    return apiResponse(200, "Job application status updated successfully", {
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error("Error updating job application:", error);
    return apiResponse(500, error.message || "Internal Server Error");
  }
}

// DELETE - Delete single job application
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDb();

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return apiResponse(400, "Application ID is required");
    }

    // First get the application to check for resume file
    const application = await JobApplication.findById(id);

    if (!application) {
      return apiResponse(404, "Job application not found");
    }

    // Delete the resume file if it's stored locally
    if (application.resumeUrl && application.resumeUrl.startsWith('/resumes/')) {
      try {
        const filename = application.resumeUrl.replace('/resumes/', '');
        const deleteResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/resume/delete?filename=${filename}`, {
          method: 'DELETE',
        });
        
        if (deleteResponse.ok) {
          console.log(`Resume file deleted for application ${id}: ${filename}`);
        } else {
          console.log(`Could not delete resume file for application ${id}: ${filename}`);
        }
      } catch (error) {
        console.error("Error deleting resume file:", error);
        // Continue with application deletion even if file deletion fails
      }
    }

    // Delete the application from database
    const deletedApplication = await JobApplication.findByIdAndDelete(id);

    return apiResponse(200, "Job application deleted successfully", {
      deletedApplication: {
        id: deletedApplication._id,
        name: deletedApplication.name,
        position: deletedApplication.position,
      },
    });
  } catch (error: any) {
    console.error("Error deleting job application:", error);
    return apiResponse(500, error.message || "Internal Server Error");
  }
}

import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { NextRequest } from "next/server";
import JobApplication from "@/app/models/JobApplication";

// PATCH - Fix problematic Cloudinary URLs in existing job applications
export async function PATCH(req: NextRequest) {
  try {
    await connectDb();

    // Find all applications with problematic PDF URLs
    const applicationsWithProblematicUrls = await JobApplication.find({
      resumeUrl: { 
        $regex: "/image/upload/.*\\.pdf$", 
        $options: "i" 
      }
    });

    console.log(`Found ${applicationsWithProblematicUrls.length} applications with problematic PDF URLs`);

    let fixedCount = 0;
    const fixedApplications = [];

    for (const application of applicationsWithProblematicUrls) {
      const originalUrl = application.resumeUrl;
      
      // Convert /image/upload/ to /raw/upload/ for PDF files
      if (originalUrl.includes('/image/upload/') && originalUrl.toLowerCase().endsWith('.pdf')) {
        const correctedUrl = originalUrl.replace('/image/upload/', '/raw/upload/');
        
        // Update the application
        const updatedApplication = await JobApplication.findByIdAndUpdate(
          application._id,
          { 
            resumeUrl: correctedUrl,
            updatedAt: new Date()
          },
          { new: true }
        );

        if (updatedApplication) {
          fixedCount++;
          fixedApplications.push({
            id: application._id,
            name: application.name,
            originalUrl: originalUrl,
            correctedUrl: correctedUrl
          });
        }
      }
    }

    return apiResponse(200, `Successfully fixed ${fixedCount} resume URLs`, {
      fixedCount,
      totalFound: applicationsWithProblematicUrls.length,
      fixedApplications
    });

  } catch (error: any) {
    console.error("Error fixing resume URLs:", error);
    return apiResponse(500, error.message || "Internal Server Error");
  }
}

// GET - Check for problematic URLs without fixing them
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // Find all applications with problematic PDF URLs
    const applicationsWithProblematicUrls = await JobApplication.find({
      resumeUrl: { 
        $regex: "/image/upload/.*\\.pdf$", 
        $options: "i" 
      }
    }).select('name email resumeUrl appliedAt');

    return apiResponse(200, `Found ${applicationsWithProblematicUrls.length} applications with problematic PDF URLs`, {
      count: applicationsWithProblematicUrls.length,
      applications: applicationsWithProblematicUrls.map(app => ({
        id: app._id,
        name: app.name,
        email: app.email,
        resumeUrl: app.resumeUrl,
        appliedAt: app.appliedAt,
        suggestedUrl: app.resumeUrl.replace('/image/upload/', '/raw/upload/')
      }))
    });

  } catch (error: any) {
    console.error("Error checking resume URLs:", error);
    return apiResponse(500, error.message || "Internal Server Error");
  }
}

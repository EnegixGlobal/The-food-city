import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Configure Cloudinary with validation (keep for images)
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Validate Cloudinary configuration
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.error("Cloudinary configuration missing:", {
    cloud_name: !!cloudinaryConfig.cloud_name,
    api_key: !!cloudinaryConfig.api_key,
    api_secret: !!cloudinaryConfig.api_secret
  });
}

cloudinary.config(cloudinaryConfig);

// Test endpoint to validate Cloudinary configuration
export async function GET(request: NextRequest) {
  try {
    const config = cloudinary.config();
    
    return NextResponse.json({
      success: true,
      message: "Cloudinary configuration status",
      data: {
        cloud_name: !!config.cloud_name,
        api_key: !!config.api_key,
        api_secret: !!config.api_secret,
        current_time: new Date().toISOString(),
        timestamp: Math.round(Date.now() / 1000)
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: "Configuration check failed" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Log current timestamp for debugging
    const currentTime = new Date();
    const timestamp = Math.round(Date.now() / 1000);
    console.log(`Upload request at: ${currentTime.toISOString()}, timestamp: ${timestamp}`);
    
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type - Enhanced to handle PDFs and documents properly
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Only image files (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Max 5MB allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if it's a resume (PDF, DOC, DOCX)
    const isResume = file.type === "application/pdf" || 
                     file.type === "application/msword" || 
                     file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (isResume) {
      // Handle resume upload locally
      try {
        // Create resumes directory if it doesn't exist
        const resumesDir = join(process.cwd(), "public", "resumes");
        await mkdir(resumesDir, { recursive: true });

        // Generate unique filename
        const fileExtension = file.type === "application/pdf" ? ".pdf" : 
                             file.type === "application/msword" ? ".doc" : ".docx";
        const uniqueFilename = `resume_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
        const filePath = join(resumesDir, uniqueFilename);

        // Write file to public/resumes directory
        await writeFile(filePath, buffer);

        // Return local file path
        const publicPath = `/resumes/${uniqueFilename}`;
        
        return NextResponse.json({
          success: true,
          message: "Resume uploaded successfully",
          data: {
            secure_url: publicPath,
            public_id: uniqueFilename.replace(/\.[^/.]+$/, ""), // remove extension
            resource_type: "raw",
            format: fileExtension.substring(1), // remove dot
            bytes: file.size,
            original_filename: file.name,
            uploaded_at: new Date().toISOString(),
            storage_type: "local"
          },
        });
      } catch (error) {
        console.error("Error saving resume locally:", error);
        return NextResponse.json({ 
          error: "Failed to save resume locally" 
        }, { status: 500 });
      }
    }

    // Handle image upload to Cloudinary (existing logic)
    const isImage = file.type.startsWith("image/");
    
    if (!isImage) {
      return NextResponse.json({ 
        error: "Unsupported file type for Cloudinary upload" 
      }, { status: 400 });
    }

    const uploadOptions: any = {
      folder: "enegix-uploads",
      resource_type: "image",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { format: "auto" },
      ],
      // Add current timestamp to avoid stale request issues
      timestamp: Math.round(Date.now() / 1000),
    };

    console.log(`Uploading image: ${file.name}, type: ${file.type}`);

    // Upload to Cloudinary with enhanced error handling
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions, 
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Upload successful:", result?.secure_url);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      message: "Upload successful",
      data: {
        secure_url: (result as any).secure_url,
        public_id: (result as any).public_id,
        resource_type: (result as any).resource_type,
        format: (result as any).format,
        bytes: (result as any).bytes,
        original_filename: file.name,
        uploaded_at: (result as any).created_at,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    // Check if it's a Cloudinary timestamp error
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message;
      if (errorMessage.includes('Stale request')) {
        return NextResponse.json({ 
          error: "Upload failed due to time synchronization issue. Please try again.",
          details: "Server time might be out of sync. If this persists, contact support."
        }, { status: 500 });
      }
      
      if (errorMessage.includes('Invalid')) {
        return NextResponse.json({ 
          error: "File upload configuration error. Please try again.",
          details: errorMessage
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: "Upload failed",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}

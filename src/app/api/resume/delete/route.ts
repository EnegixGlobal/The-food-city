import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";

// DELETE - Delete a local resume file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Security check - ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = join(process.cwd(), "public", "resumes", filename);
    
    try {
      await unlink(filePath);
      console.log(`Resume file deleted: ${filename}`);
      
      return NextResponse.json({
        success: true,
        message: "Resume file deleted successfully",
        filename: filename
      });
    } catch (error) {
      console.error(`Failed to delete resume file ${filename}:`, error);
      // Don't throw error if file doesn't exist - it might have been already deleted
      return NextResponse.json({
        success: true,
        message: "Resume file not found or already deleted",
        filename: filename
      });
    }
  } catch (error) {
    console.error("Error in resume deletion:", error);
    return NextResponse.json({ 
      error: "Failed to delete resume file" 
    }, { status: 500 });
  }
}

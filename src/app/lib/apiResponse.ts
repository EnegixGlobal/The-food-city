import { NextResponse } from "next/server";

// Helper function to create standardized API responses
export const apiResponse = (statusCode: number, message: string, data: unknown = null) => {
  return NextResponse.json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data
  }, { status: statusCode });
}

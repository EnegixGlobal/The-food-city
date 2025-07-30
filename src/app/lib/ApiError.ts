import { NextResponse } from "next/server";

export const apiError = (statusCode: number, message: string, error: unknown = null) => {
  return NextResponse.json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error : undefined // Optional: Hide raw error in prod
  }, { status: statusCode });
};

import { asyncHandler } from "@/app/lib/asyncHandler";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  const response = NextResponse.json({
    message: "Logged out successfully",
    success: true,
  });

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
});

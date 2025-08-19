import { NextResponse } from "next/server";

// Helper function to create standardized API responses (no-store to force fresh fetches)
const apiResponse = (
  statusCode: number,
  message: string,
  data: unknown = null,
  extraHeaders: Record<string, string> = {}
) => {
  return NextResponse.json(
    {
      success: statusCode >= 200 && statusCode < 300,
      message,
      data,
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        ...extraHeaders,
      },
    }
  );
};

export { apiResponse };

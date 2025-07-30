import { NextRequest } from "next/server";
import { apiError } from "@/app/lib/apiError";

function asyncHandler(fn: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      return await fn(req);
    } catch (error: any) {
      console.error("Caught by asyncHandler:", error);
      return apiError(500, error.message || "Internal Server Error");
    }
  };
}

export { asyncHandler };

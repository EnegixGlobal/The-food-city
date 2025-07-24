import { NextRequest, NextResponse } from 'next/server';

type AsyncHandlerFunction = (req: NextRequest, res: NextResponse) => Promise<void | Response>;

export const asyncHandler = (fn: AsyncHandlerFunction) => {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      return await fn(req, res);
    } catch (error: unknown) {
      const errorObj = error as { statusCode?: number; message?: string };
      const status = errorObj.statusCode || 500;
      const message = errorObj.message || "Internal Server Error";
      return Response.json({ success: false, message }, { status });
    }
  };
};

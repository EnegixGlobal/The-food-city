import { NextRequest } from "next/server";
import { apiError } from "@/app/lib/ApiError";

// Narrow a value to an object with optional properties
type UnknownError = Record<string, unknown> & { message?: string };

interface DuplicateKeyLike extends Record<string, unknown> {
  code: number;
  keyPattern?: Record<string, unknown>;
}
interface ValidationLike extends Record<string, unknown> {
  name: string;
  errors?: Record<string, { message?: string }>;
}
interface JwtLike extends Record<string, unknown> { name: string }
interface ConnRefusedLike extends Record<string, unknown> { code: string }

function hasProp<T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return !!obj && typeof obj === "object" && prop in obj;
}
function isDuplicateKey(e: UnknownError): e is DuplicateKeyLike {
  return hasProp(e, "code") && typeof e.code === "number" && e.code === 11000;
}
function isValidationError(e: UnknownError): e is ValidationLike {
  return hasProp(e, "name") && e.name === "ValidationError" && hasProp(e, "errors") && typeof e.errors === "object";
}
function isJwtError(e: UnknownError): e is JwtLike {
  return hasProp(e, "name") && e.name === "JsonWebTokenError";
}
function isJwtExpired(e: UnknownError): e is JwtLike {
  return hasProp(e, "name") && e.name === "TokenExpiredError";
}
function isConnRefused(e: UnknownError): e is ConnRefusedLike {
  return hasProp(e, "code") && e.code === "ECONNREFUSED";
}

function classifyError(err: unknown): { status: number; message: string } {
  const e = (err && typeof err === "object" ? err : {}) as UnknownError;

  // Mongo duplicate key
  if (isDuplicateKey(e)) {
    const keyPattern = e.keyPattern || {};
    const field = Object.keys(keyPattern)[0] || "field";
    return { status: 409, message: `A record already exists with this ${field}` };
  }

  // Mongoose validation errors
  if (isValidationError(e)) {
    const details = Object.values(e.errors || {})
      .map(v => v?.message)
      .filter((m): m is string => Boolean(m))
      .join("; ");
    return { status: 400, message: details || "Validation failed" };
  }

  // JWT errors (if any appear outside route-specific handling)
  if (isJwtError(e)) {
    return { status: 401, message: "Invalid token" };
  }
  if (isJwtExpired(e)) {
    return { status: 401, message: "Token expired" };
  }

  // Network / mailer style errors
  if (isConnRefused(e)) {
    return { status: 503, message: "Service temporarily unavailable" };
  }

  return { status: 500, message: e.message || "Internal Server Error" };
}

function asyncHandler(fn: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      return await fn(req);
    } catch (error) {
      const { status, message } = classifyError(error);
      console.error("Caught by asyncHandler:", error);
      return apiError(status, message, process.env.NODE_ENV === "development" ? error : undefined);
    }
  };
}

export { asyncHandler };

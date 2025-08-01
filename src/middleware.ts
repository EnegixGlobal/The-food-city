import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const token = request.cookies.get("token")?.value || "";
  const companyToken = request.cookies.get("company-token")?.value || "";

  // Check if user is trying to access my-account routes without token
  if (path.startsWith("/my-account") && !token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Check if admin is trying to access admin routes without company-token
  if (path.startsWith("/admin") && !companyToken) {
    return NextResponse.redirect(new URL("/admin-login", request.nextUrl));
  }

  // All other paths are public
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/my-account/:path*", "/admin/:path*"],
};

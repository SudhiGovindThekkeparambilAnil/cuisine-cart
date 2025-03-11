import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/utils/jwt";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Get JWT token from cookies

  if (!token || !verifyJwtToken(token)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

// Define which routes need authentication
export const config = {
  matcher: ["/dashboard/:path*"], // Protect dashboard routes
};

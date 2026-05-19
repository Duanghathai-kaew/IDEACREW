import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/admin-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminSession =
    request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value === "true";

  if (pathname === "/admin/login") {
    if (hasAdminSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!hasAdminSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

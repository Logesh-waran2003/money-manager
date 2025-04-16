import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthUser } from "./lib/auth";
import { isPublicRoute } from "./lib/routes";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for public routes
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Skip middleware for static files
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/api/swagger") ||
    path.startsWith("/api-docs") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // For API routes, check for authentication
  if (path.startsWith("/api")) {
    // Skip authentication for auth-related API routes
    if (path.startsWith("/api/auth/")) {
      return NextResponse.next();
    }
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // For page routes, redirect to login if not authenticated
  const user = await getAuthUser(request);
  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

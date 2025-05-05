import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthUser } from "./lib/auth";
import { isPublicRoute } from "./lib/routes";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  console.log("Middleware triggered for path:", path);

  // // If route is public, allow
  // if (isPublicRoute(path)) {
  //   return NextResponse.next();
  // }

  // // For protected routes, check authentication
  // const user = await getAuthUser(request);
  // if (!user) {
  //   // For API routes, return 401
  //   if (path.startsWith("/api/")) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //   }
  //   // For pages, redirect to login
  //   const loginUrl = new URL("/login", request.url);
  //   return NextResponse.redirect(loginUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

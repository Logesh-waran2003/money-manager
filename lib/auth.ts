import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Function to get the authenticated user from a request
export async function getAuthUser(request: NextRequest) {
  try {
    // Extract JWT from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    } else {
      const cookie = request.headers.get("cookie");
      if (cookie) {
        const match = cookie.match(/token=([^;]+)/);
        if (match) token = match[1];
      }
    }
    if (!token) return null;
    // Verify token
    const secret = process.env.JWT_SECRET || "fallback-secret";
    const payload = jwt.verify(token, secret);
    if (typeof payload === "object" && payload.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user) return null;
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Function to get the current user's session
export async function auth() {
  // This function is deprecated. Use getAuthUser with a request instead.
  throw new Error("auth() is deprecated. Use getAuthUser(request) instead.");
}

// Function to get the current user
export async function getCurrentUser(request: NextRequest) {
  // Use getAuthUser for all user fetching logic
  return getAuthUser(request);
}

// Middleware to check if the user is authenticated
type AuthMiddlewareOptions = {
  onError?: (error: Error) => void;
  redirectTo?: string;
};

export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
) {
  const user = await getAuthUser(request);
  if (user) {
    return { user };
  }
  if (options.onError) {
    options.onError(new Error("Unauthorized"));
  }
  if (options.redirectTo) {
    return { redirect: options.redirectTo };
  }
  return { error: "Unauthorized" };
}

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/register", "/forgot-password"];
    
    // Check if the current route is public
    const isPublicRoute = publicRoutes.includes(pathname);
    
    // For now, bypass auth checks for /accounts and related routes
    if (pathname.startsWith("/accounts")) {
      return;
    }
    
    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to login if not authenticated and trying to access a protected route
      router.push("/login");
    } else if (isAuthenticated && isPublicRoute) {
      // Redirect to dashboard if already authenticated and trying to access a public route
      router.push("/dashboard");
    }
  }, [isAuthenticated, pathname, router]);

  // Always render children for now to bypass auth checks
  return <>{children}</>;
}

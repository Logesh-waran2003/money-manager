"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { isPublicRoute, isAuthRoute } from "@/lib/routes";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute(pathname)) {
      router.push("/login");
    } else if (isAuthenticated && isAuthRoute(pathname)) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return null;
  }
  if (isAuthenticated && isAuthRoute(pathname)) {
    return null;
  }

  return <>{children}</>;
}

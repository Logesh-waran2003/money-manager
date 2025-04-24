"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (pathname === "/") {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, router]);

  // Optionally, render a landing page or null
  return null;
}

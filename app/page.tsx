"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard"); // Redirect to the dashboard if authenticated
    } else {
      // Optionally, show a landing page or do nothing (stay on /)
      //redirect to login
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Optionally, render a landing page or null
  return null;
}

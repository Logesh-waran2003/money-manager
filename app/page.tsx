"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // For now, always redirect to accounts page to bypass auth issues
    router.push("/accounts");
  }, [router]);

  // This page will never be shown as we redirect immediately
  return null;
}

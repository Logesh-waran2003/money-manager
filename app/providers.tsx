"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { useAccountStore } from "@/lib/stores/account-store";

function AccountsLoader({ children }: { children: React.ReactNode }) {
  const isLoading = useAccountStore((s) => s.isLoading);
  const accounts = useAccountStore((s) => s.accounts);

  React.useEffect(() => {
    useAccountStore.getState().fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  if (isLoading && accounts.length === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-screen">
        Loading accounts...
      </div>
    );
  }
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient for each session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AccountsLoader>{children}</AccountsLoader>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

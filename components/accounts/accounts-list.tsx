"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccountCard from "./account-card";
import { Button } from "@/components/ui/button";

interface Account {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
  description?: string;
}

export default function AccountsList() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts");

        if (!response.ok) {
          throw new Error(`Failed to fetch accounts: ${response.status}`);
        }

        const data = await response.json();
        setAccounts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load accounts"
        );
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium mb-2">No accounts found</h3>
        <p className="text-gray-500 mb-6">
          Create your first account to start tracking your finances.
        </p>
        <Button onClick={() => router.push("/accounts/new")}>
          Create Account
        </Button>
      </div>
    );
  }

  // Calculate total balance
  const totalBalance = accounts
    .reduce((sum, account) => sum + parseFloat(account.balance), 0)
    .toFixed(2);

  return (
    <div>
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-1">Total Balance</h3>
        <p
          className={`text-2xl font-bold ${
            parseFloat(totalBalance) < 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(parseFloat(totalBalance))}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            id={account.id}
            name={account.name}
            type={account.type}
            balance={account.balance}
            description={account.description}
          />
        ))}
      </div>
    </div>
  );
}

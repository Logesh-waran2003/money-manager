"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Account {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
  description?: string;
}

export default function AccountDetail({ id }: { id: string }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const response = await fetch(`/api/accounts/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch account: ${response.status}`);
        }

        const data = await response.json();
        setAccount(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching account:", err);
        setError(err instanceof Error ? err.message : "Failed to load account");
        setLoading(false);
      }
    }

    fetchAccount();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading account details...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error || "Account not found"}</p>
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold">{account.name}</CardTitle>
        <Link href={`/accounts/${id}/edit`}>
          <Button variant="ghost" size="sm">
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Account Type
            </p>
            <p className="text-lg font-medium capitalize">{account.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <p
              className={`text-xl font-bold ${
                parseFloat(account.balance) < 0
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {formatCurrency(account.balance)}
            </p>
          </div>
          {account.description && (
            <div className="col-span-full">
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-md">{account.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

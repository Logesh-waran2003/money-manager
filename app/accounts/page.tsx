"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccountStore } from "@/lib/stores/account-store";
import {
  Plus,
  CreditCard,
  Wallet,
  Landmark,
  Star,
  MoreHorizontal,
} from "lucide-react";
import { AccountToggle } from "@/components/AccountToggle";

export default function AccountsPage() {
  const router = useRouter();

  // Use the account store directly for accounts data
  const { accounts, isLoading, error, fetchAccounts } = useAccountStore();

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAccounts();
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    console.log("Inside useEffect Accounts:", accounts);

    fetchData();
  }, [fetchAccounts]);

  console.log("Accounts:", accounts);
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      case "debit":
        return <CreditCard className="h-5 w-5" />;
      case "cash":
        return <Wallet className="h-5 w-5" />;
      case "bank":
      default:
        return <Landmark className="h-5 w-5" />;
    }
  };

  const getTotalBalance = () => {
    return (
      accounts?.reduce((total, account) => {
        // For credit accounts, we don't add to the total balance
        if (account.type === "credit") return total;
        // Only include active accounts in the total balance
        if (account.isActive === false) return total;
        return total + account.balance;
      }, 0) || 0
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Accounts</h1>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-start md:items-center">
          <AccountToggle />
          <Button onClick={() => router.push("/accounts/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading accounts...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : !accounts || accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">You don't have any accounts yet.</p>
          <Button onClick={() => router.push("/accounts/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Account
          </Button>
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Total Balance</CardTitle>
              <CardDescription>Across all accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(getTotalBalance())}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className={`hover:shadow-md transition-shadow ${
                  account.isActive === false ? "opacity-60" : ""
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center">
                    <div
                      className={`mr-2 ${
                        account.isActive === false
                          ? "bg-gray-200"
                          : "bg-primary/10"
                      } p-2 rounded-full`}
                    >
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {account.name}
                        {account.isActive === false && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Inactive)
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {account.institution || account.type}
                      </CardDescription>
                    </div>
                  </div>
                  {account.isDefault && (
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(account.balance)}
                  </p>
                  {account.type === "credit" && account.creditLimit && (
                    <p className="text-sm text-gray-500">
                      Available:{" "}
                      {formatCurrency(account.creditLimit - account.balance)}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/accounts/${account.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/accounts/${account.id}/edit`)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

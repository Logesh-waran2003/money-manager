"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccounts } from "@/lib/stores/useAccountStore";
import { Plus, CreditCard, Wallet, Landmark, TrendingUp, Star, MoreHorizontal } from "lucide-react";

export default function AccountsPage() {
  const router = useRouter();
  const { data: accounts, isLoading, error } = useAccounts();

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
    return accounts?.reduce((total, account) => {
      // For credit accounts, we don't add to the total balance
      if (account.type === "credit") return total;
      return total + account.balance;
    }, 0) || 0;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button onClick={() => router.push("/accounts/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading accounts...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{(error as Error).message}</div>
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
              <p className="text-3xl font-bold">{formatCurrency(getTotalBalance())}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center">
                    <div className="mr-2 bg-primary/10 p-2 rounded-full">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <CardDescription>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                        {account.isDefault && (
                          <span className="ml-2 inline-flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-xs">Default</span>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(`/accounts/${account.id}`)}>
                    View Details
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

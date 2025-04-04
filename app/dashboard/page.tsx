"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

export default function DashboardPage() {
  const router = useRouter();
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();

  // Calculate total balance across all accounts
  const totalBalance = accounts?.reduce((sum, account) => {
    // For credit accounts, we don't add to the total balance
    if (account.type === "credit") return sum;
    return sum + account.balance;
  }, 0) || 0;

  // Calculate total credit card debt
  const totalCreditDebt = accounts?.reduce((sum, account) => {
    if (account.type === "credit") return sum + account.balance;
    return sum;
  }, 0) || 0;

  // Get recent transactions
  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push("/transaction")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Total Balance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(totalBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total across all non-credit accounts
            </p>
          </CardContent>
        </Card>

        {/* Credit Card Debt Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Credit Card Debt</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(totalCreditDebt)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total debt across all credit cards
            </p>
          </CardContent>
        </Card>

        {/* Accounts Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accounts</CardDescription>
            <CardTitle className="text-2xl">
              {accounts?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => router.push("/accounts")}>
              Manage Accounts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-2"
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <p className="font-medium">{transaction.description || transaction.counterparty || "Unnamed Transaction"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={
                    transaction.type === "expense" ? "text-red-500" : 
                    transaction.type === "income" ? "text-green-500" : 
                    "text-blue-500"
                  }>
                    {transaction.type === "expense" ? "-" : 
                     transaction.type === "income" ? "+" : 
                     transaction.type === "transfer" ? "↔" : "+"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No transactions yet. Create your first transaction to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

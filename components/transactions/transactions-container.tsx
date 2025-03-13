"use client";

import { useState, useEffect } from "react";
import TransactionList from "./transaction-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Transaction {
  id: number;
  accountId: number;
  amount: string;
  category?: string;
  description?: string;
  appUsed?: string;
  time: Date;
  transferId?: number | null;
  recurringSpendId?: number | null;
}

interface Account {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
}

export default function TransactionsContainer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Record<number, Account>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch accounts and transactions in parallel
        const [accountsResponse, transactionsResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/transactions"),
        ]);

        if (!accountsResponse.ok) {
          throw new Error(
            `Failed to fetch accounts: ${accountsResponse.status}`
          );
        }

        if (!transactionsResponse.ok) {
          throw new Error(
            `Failed to fetch transactions: ${transactionsResponse.status}`
          );
        }

        const accountsData: Account[] = await accountsResponse.json();
        const transactionsData: Transaction[] =
          await transactionsResponse.json();

        // Format transaction dates to ensure they're Date objects
        const formattedTransactions = transactionsData.map((transaction) => ({
          ...transaction,
          time: new Date(transaction.time),
        }));

        // Convert accounts array to a map for easy lookup
        const accountsMap = accountsData.reduce((acc, account) => {
          acc[account.id] = account;
          return acc;
        }, {} as Record<number, Account>);

        setAccounts(accountsMap);
        setTransactions(formattedTransactions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load data. Please try again."
        );
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getAccountName = (accountId: number): string => {
    return accounts[accountId]?.name || `Account #${accountId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading transactions...</p>
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

  return (
    <Card>
      <CardContent className="p-6">
        {transactions.length > 0 ? (
          <TransactionList
            transactions={transactions}
            showAccountColumn={true}
            getAccountName={getAccountName}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

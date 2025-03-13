"use client";

import { useState, useEffect } from "react";
import TransactionList from "../transactions/transaction-list";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

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

export default function AccountTransactions({
  accountId,
}: {
  accountId: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccountData() {
      try {
        // Fetch account details
        const accountResponse = await fetch(`/api/accounts/${accountId}`);
        if (!accountResponse.ok) {
          throw new Error(`Failed to fetch account: ${accountResponse.status}`);
        }

        const accountData = await accountResponse.json();

        // Fetch transactions for this account
        const transactionsResponse = await fetch(
          `/api/transactions?accountId=${accountId}`
        );
        if (!transactionsResponse.ok) {
          throw new Error(
            `Failed to fetch transactions: ${transactionsResponse.status}`
          );
        }

        const transactionsData = await transactionsResponse.json();

        // Format transaction dates to ensure they're Date objects
        const formattedTransactions = transactionsData.map(
          (transaction: Transaction) => ({
            ...transaction,
            time: new Date(transaction.time),
          })
        );

        setAccount(accountData);
        setTransactions(formattedTransactions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching account data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load account data. Please try again."
        );
        setLoading(false);
      }
    }

    fetchAccountData();
  }, [accountId]);

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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            Transactions for {account?.name}
          </h3>
          <Link href={`/transactions/new?accountId=${accountId}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>

        {transactions.length > 0 ? (
          <TransactionList
            transactions={transactions}
            accountName={account?.name}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No transactions found for this account.
            </p>
            <Link href={`/transactions/new?accountId=${accountId}`}>
              <Button variant="outline" className="mt-4">
                Create your first transaction
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

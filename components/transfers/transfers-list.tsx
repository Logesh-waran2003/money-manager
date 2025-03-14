"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";

interface Transaction {
  id: number;
  accountId: number;
  amount: string;
  description?: string;
  time: Date;
  transferId: number;
}

interface Account {
  id: number;
  name: string;
  type: string;
  balance: string;
}

interface Transfer {
  fromTransaction: Transaction;
  toTransaction: Transaction;
  fromAccount: Account;
  toAccount: Account;
  amount: string;
  date: Date;
  description?: string;
}

export default function TransfersList() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransfers() {
      try {
        // First, get all transactions with a transferId
        const transactionsResponse = await fetch("/api/transactions");
        if (!transactionsResponse.ok) {
          throw new Error(
            `Failed to fetch transactions: ${transactionsResponse.status}`
          );
        }

        const transactionsData: Transaction[] =
          await transactionsResponse.json();

        // Filter transactions with transferId
        const transferTransactions = transactionsData.filter(
          (t) => t.transferId !== null
        );

        // Get accounts data
        const accountsResponse = await fetch("/api/accounts");
        if (!accountsResponse.ok) {
          throw new Error(
            `Failed to fetch accounts: ${accountsResponse.status}`
          );
        }

        const accountsData: Account[] = await accountsResponse.json();
        const accountsMap = accountsData.reduce((acc, account) => {
          acc[account.id] = account;
          return acc;
        }, {} as Record<number, Account>);

        // Group transactions into transfers
        const processedTransferIds = new Set<number>();
        const transfersList: Transfer[] = [];

        for (const transaction of transferTransactions) {
          // Skip if we've already processed this transfer
          if (
            processedTransferIds.has(transaction.id) ||
            processedTransferIds.has(transaction.transferId!)
          ) {
            continue;
          }

          // Find the matching transaction (the other side of the transfer)
          const matchingTransaction = transferTransactions.find(
            (t) =>
              t.id === transaction.transferId || t.transferId === transaction.id
          );

          if (matchingTransaction) {
            // Determine from/to based on amount (negative is from, positive is to)
            const [fromTransaction, toTransaction] =
              parseFloat(transaction.amount) < 0
                ? [transaction, matchingTransaction]
                : [matchingTransaction, transaction];

            transfersList.push({
              fromTransaction,
              toTransaction,
              fromAccount: accountsMap[fromTransaction.accountId],
              toAccount: accountsMap[toTransaction.accountId],
              amount: toTransaction.amount, // Use the positive amount
              date: new Date(fromTransaction.time), // Use either date, they should be the same
              description:
                fromTransaction.description || toTransaction.description,
            });

            // Mark both transactions as processed
            processedTransferIds.add(fromTransaction.id);
            processedTransferIds.add(toTransaction.id);
          }
        }

        // Sort by date (newest first)
        transfersList.sort((a, b) => b.date.getTime() - a.date.getTime());

        setTransfers(transfersList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transfers:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load transfers"
        );
        setLoading(false);
      }
    }

    fetchTransfers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading transfers...</p>
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

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No transfers found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create a transfer to move money between your accounts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead></TableHead>
                <TableHead>To</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(transfer.date)}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {transfer.fromAccount.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(transfer.fromAccount.balance)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <ArrowRightIcon className="h-4 w-4" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{transfer.toAccount.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(transfer.toAccount.balance)}
                    </div>
                  </TableCell>
                  <TableCell>{transfer.description || "Transfer"}</TableCell>
                  <TableCell className="text-right font-medium text-green-500">
                    {formatCurrency(transfer.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

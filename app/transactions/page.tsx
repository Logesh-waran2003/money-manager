"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useTransactionStore } from "@/lib/stores/transaction-store";

export default function TransactionsPage() {
  const { transactions, fetchTransactions, isLoading, error } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Link href="/transaction">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : error ? (
        <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No transactions found</p>
            <Link href="/transaction">
              <Button>Add Your First Transaction</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <div className="font-medium">
                      {transaction.counterparty || transaction.description || "Unnamed Transaction"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`text-right ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 
                    transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' : ''
                  }`}>
                    <div className="font-medium">
                      {transaction.type === 'expense' ? '-' : 
                       transaction.type === 'income' ? '+' : ''}
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {transaction.type}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { useAccountStore } from "@/lib/stores/account-store";
import { ArrowLeftRight, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { TransactionCard } from "@/components/ui/transaction-card";

export default function TransfersPage() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactionStore();
  const { accounts } = useAccountStore();
  
  // Filter only transfer transactions
  const transferTransactions = transactions.filter(t => t.type === 'transfer');
  
  // Get account name by ID
  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || "Unknown Account";
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transfers</h1>
        <Button onClick={() => router.push("/transaction?type=transfer")}>
          <Plus className="mr-2 h-4 w-4" /> New Transfer
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Transfer History
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {transferTransactions.length} transfers
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transferTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {transferTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  id={transaction.id}
                  amount={transaction.amount}
                  description={`${getAccountName(transaction.accountId)} → ${getAccountName(transaction.toAccountId || '')}`}
                  date={transaction.date}
                  type="transfer"
                  category="other" as any
                  counterparty={`Transfer`}
                  accountId={transaction.accountId}
                  toAccountId={transaction.toAccountId}
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No transfers found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push("/transaction?type=transfer")}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Transfer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

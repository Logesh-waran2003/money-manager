"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { useAccountStore } from "@/lib/stores/account-store";
import { ArrowLeftRight, Plus, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { TransactionCard } from "@/components/ui/transaction-card";
import { cn } from "@/lib/utils";

export default function TransfersPage() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactionStore();
  const { accounts } = useAccountStore();
  
  // Filter only transfer transactions
  const transferTransactions = transactions
    .filter(t => t.type === 'transfer')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get account name by ID
  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || "Unknown Account";
  };

  // Get account color by ID
  const getAccountColor = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.color || "#888888";
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
                <div 
                  key={transaction.id}
                  className="p-4 hover:bg-accent/5 cursor-pointer transition-all"
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-background border border-border/50">
                        <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span 
                            className="inline-block w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getAccountColor(transaction.accountId) }}
                          ></span>
                          <span>{getAccountName(transaction.accountId)}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span 
                            className="inline-block w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getAccountColor(transaction.toAccountId || '') }}
                          ></span>
                          <span>{getAccountName(transaction.toAccountId || '')}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {transaction.description || "Transfer"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium font-mono text-blue-500">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
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

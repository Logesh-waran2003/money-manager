"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { formatCurrency } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";

export default function RecurringPaymentsPage() {
  const router = useRouter();
  const { transactions } = useTransactionStore();
  
  // Filter only recurring transactions
  const recurringTransactions = transactions.filter(t => t.type === 'recurring');
  
  // Group recurring transactions by frequency
  const groupedByFrequency = recurringTransactions.reduce((acc, transaction) => {
    const frequency = transaction.recurringFrequency || 'other';
    if (!acc[frequency]) {
      acc[frequency] = [];
    }
    acc[frequency].push(transaction);
    return acc;
  }, {} as Record<string, typeof recurringTransactions>);

  // Calculate total monthly recurring expenses
  const totalMonthlyRecurring = recurringTransactions.reduce((sum, transaction) => {
    // For non-monthly frequencies, we need to normalize to monthly equivalent
    let monthlyAmount = transaction.amount;
    
    switch (transaction.recurringFrequency) {
      case 'daily':
        monthlyAmount = transaction.amount * 30; // Approximate
        break;
      case 'weekly':
        monthlyAmount = transaction.amount * 4.33; // Approximate weeks in a month
        break;
      case 'biweekly':
        monthlyAmount = transaction.amount * 2.17; // Approximate bi-weeks in a month
        break;
      case 'quarterly':
        monthlyAmount = transaction.amount / 3; // Spread quarterly payment over 3 months
        break;
      case 'yearly':
        monthlyAmount = transaction.amount / 12; // Spread yearly payment over 12 months
        break;
    }
    
    return sum + monthlyAmount;
  }, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recurring Payments</h1>
        <Link href="/transaction?type=recurring">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Recurring Payment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Recurring Payments</CardDescription>
            <CardTitle className="text-2xl">{recurringTransactions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Active recurring payment subscriptions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Total</CardDescription>
            <CardTitle className="text-2xl text-red-500">
              {formatCurrency(totalMonthlyRecurring)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estimated monthly recurring expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Common Frequency</CardDescription>
            <CardTitle className="text-2xl capitalize">
              {Object.entries(groupedByFrequency).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || "None"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Most common payment schedule
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Recurring Payments</CardTitle>
          <CardDescription>Manage your subscriptions and recurring expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {recurringTransactions.length > 0 ? (
            <div className="space-y-4">
              {recurringTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-4 cursor-pointer hover:bg-muted/50 p-2 rounded-md"
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.recurringName || transaction.description || "Unnamed Payment"}</p>
                      <Badge variant="outline" className="capitalize">
                        {transaction.recurringFrequency || "monthly"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.counterparty || "No recipient specified"}
                    </p>
                  </div>
                  <div className="text-red-500 font-medium">
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No recurring payments yet</p>
              <Link href="/transaction?type=recurring">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Recurring Payment
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

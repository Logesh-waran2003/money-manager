"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { PlusCircle, ArrowUpRight, ArrowDownRight, Check, Calendar } from "lucide-react";
import Link from "next/link";
import { useTransactionStore } from "@/lib/stores/transaction-store";

export default function CreditsPage() {
  const { toast } = useToast();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTransactions();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load credit transactions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchTransactions, toast]);

  // Filter credit transactions
  const creditTransactions = transactions.filter(
    (transaction) => transaction.type === "credit"
  );

  // Separate borrowed and lent transactions
  const borrowedTransactions = creditTransactions.filter(
    (transaction) => transaction.creditType === "borrowed"
  );

  const lentTransactions = creditTransactions.filter(
    (transaction) => transaction.creditType === "lent"
  );

  // Calculate totals
  const totalBorrowed = borrowedTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const totalLent = lentTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const markAsPaid = async (id: string) => {
    // This would be implemented to update the transaction status
    toast({
      title: "Not Implemented",
      description: "Marking as paid will be implemented in the next phase",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Credits & Debts</h1>
        <Link href="/transaction?type=credit">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Credit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Money You Borrowed</CardTitle>
            <CardDescription>Total amount you need to pay back</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalBorrowed.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {borrowedTransactions.length} active {borrowedTransactions.length === 1 ? "debt" : "debts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Money You Lent</CardTitle>
            <CardDescription>Total amount others owe you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalLent.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {lentTransactions.length} active {lentTransactions.length === 1 ? "loan" : "loans"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="borrowed" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="borrowed">Money You Borrowed</TabsTrigger>
          <TabsTrigger value="lent">Money You Lent</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : borrowedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't borrowed any money yet.
            </div>
          ) : (
            <div className="space-y-4">
              {borrowedTransactions.map((transaction) => (
                <Card key={transaction.id} className="overflow-hidden">
                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                        <span className="font-medium">
                          Borrowed from {transaction.counterparty}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(new Date(transaction.date), "PPP")}
                      </div>
                      {transaction.description && (
                        <p className="text-sm mt-2">{transaction.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${transaction.amount.toFixed(2)}</div>
                      {transaction.dueDate && (
                        <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {format(new Date(transaction.dueDate), "PP")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted p-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => markAsPaid(transaction.id)}>
                      <Check className="mr-1 h-3 w-3" /> Mark as Paid
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lent">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : lentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't lent any money yet.
            </div>
          ) : (
            <div className="space-y-4">
              {lentTransactions.map((transaction) => (
                <Card key={transaction.id} className="overflow-hidden">
                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          Lent to {transaction.counterparty}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(new Date(transaction.date), "PPP")}
                      </div>
                      {transaction.description && (
                        <p className="text-sm mt-2">{transaction.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${transaction.amount.toFixed(2)}</div>
                      {transaction.dueDate && (
                        <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {format(new Date(transaction.dueDate), "PP")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted p-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => markAsPaid(transaction.id)}>
                      <Check className="mr-1 h-3 w-3" /> Mark as Repaid
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

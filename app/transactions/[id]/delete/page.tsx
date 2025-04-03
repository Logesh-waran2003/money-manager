"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { useAccountStore } from "@/lib/stores/account-store";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";

export default function DeleteTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { transactions, deleteTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
  
  // Find the transaction to delete
  const transaction = transactions.find(t => t.id === transactionId);
  
  // Find related account
  const account = transaction ? accounts.find(a => a.id === transaction.accountId) : null;
  
  // Redirect if transaction not found
  useEffect(() => {
    if (!transaction) {
      router.push("/transactions");
    }
  }, [transaction, router]);

  // Handle transaction deletion
  async function handleDelete() {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/transactions/${transactionId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete transaction');
      
      // Delete the transaction
      deleteTransaction(transactionId);
      
      // Redirect to transactions page
      router.push("/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction. Please try again.");
      setIsLoading(false);
    }
  }

  if (!transaction || !account) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Transaction not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Delete Transaction</CardTitle>
          <CardDescription>
            Are you sure you want to delete this transaction?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="font-medium">{transaction.description || 'Transaction'}</div>
              <div className="text-sm text-muted-foreground">{formatDate(transaction.date)}</div>
              <div className="text-lg font-mono mt-1 flex justify-between">
                <span>Amount:</span>
                <span className={transaction.type === 'income' ? 'text-success' : transaction.type === 'expense' ? 'text-destructive' : ''}>
                  {transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount, account.currency)}
                </span>
              </div>
              <div className="text-sm flex justify-between mt-2">
                <span className="text-muted-foreground">Account:</span>
                <span>{account.name}</span>
              </div>
            </div>
            
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. The transaction will be permanently deleted.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Transaction"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAccountStore } from "@/lib/stores/account-store";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

export default function DeleteAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accounts, deleteAccount } = useAccountStore();
  const { transactions } = useTransactionStore();
  
  // Find the account to delete
  const account = accounts.find(acc => acc.id === accountId);
  
  // Check if account has transactions
  const accountTransactions = transactions.filter(
    t => t.accountId === accountId || t.toAccountId === accountId
  );
  const hasTransactions = accountTransactions.length > 0;
  
  // Redirect if account not found
  useEffect(() => {
    if (!account) {
      router.push("/accounts");
    }
  }, [account, router]);

  // Handle account deletion
  async function handleDelete() {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/accounts/${accountId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete account');
      
      // Delete the account
      deleteAccount(accountId);
      
      // Redirect to accounts page
      router.push("/accounts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account. Please try again.");
      setIsLoading(false);
    }
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Account not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Are you sure you want to delete this account?
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
              <div className="font-medium">{account.name}</div>
              <div className="text-sm text-muted-foreground capitalize">{account.type} Account</div>
              <div className="text-lg font-mono mt-1">{formatCurrency(account.balance, account.currency)}</div>
            </div>
            
            {hasTransactions && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-800">
                  This account has {accountTransactions.length} transaction{accountTransactions.length !== 1 ? 's' : ''}. 
                  Deleting this account will also delete all associated transactions.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. The account will be permanently deleted.
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
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

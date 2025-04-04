"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAccountStore } from "@/lib/stores/account-store";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { AlertCircle, AlertTriangle, Archive } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

export default function DeactivateAccountPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  console.log("Deactivate account page loaded with ID:", params.id);
  const accountId = params.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { accounts, fetchAccounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  
  // Ensure accounts are loaded
  useEffect(() => {
    console.log("Checking if accounts need to be loaded...");
    const loadAccounts = async () => {
      console.log("Loading accounts...");
      await fetchAccounts();
      console.log("Accounts loaded, count:", accounts.length);
    };
    
    if (accounts.length === 0) {
      console.log("No accounts in store, fetching...");
      loadAccounts();
    }
  }, [accounts.length, fetchAccounts]);
  
  // Find the account to deactivate
  const account = accounts.find(acc => acc.id === accountId && acc.isActive !== false);
  console.log("Accounts in store:", accounts.length);
  console.log("Looking for account ID:", accountId);
  console.log("Found account:", account ? "yes" : "no");
  
  // Check if account has transactions
  const accountTransactions = transactions.filter(
    t => t.accountId === accountId || t.toAccountId === accountId
  );
  const hasTransactions = accountTransactions.length > 0;
  
  // Redirect if account not found after a delay
  useEffect(() => {
    // Add a small delay to ensure the store is properly loaded
    const timer = setTimeout(() => {
      const foundAccount = accounts.find(acc => acc.id === accountId && acc.isActive !== false);
      console.log("After delay, account found:", foundAccount ? foundAccount.id : "not found");
      
      if (!foundAccount) {
        console.log("Account not found after delay, showing error");
        setError("Account not found or already inactive. Please try again or go back to accounts.");
      }
    }, 1000); // Increased timeout to give more time for accounts to load
    
    return () => clearTimeout(timer);
  }, [accounts, accountId]);

  // Handle account deactivation
  async function handleDeactivate() {
    setIsLoading(true);
    setError(null);
    console.log("Deactivating account:", accountId);

    try {
      // Prepare account data with isActive set to false
      const accountData = {
        isActive: false,
        updatedAt: new Date().toISOString()
      };

      // Make API call to update the account in database
      try {
        console.log("Making API call to deactivate account...");
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(errorData.error || 'Failed to deactivate account');
        }
        
        console.log("Account deactivated in database successfully");
        
        // Use the deleteAccount method which now handles marking as inactive
        useAccountStore.getState().deleteAccount(accountId);
        
        // Show success message
        setSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/accounts');
        }, 1500);
      } catch (error) {
        console.error("Error deactivating account:", error);
        throw error;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while deactivating the account');
    } finally {
      setIsLoading(false);
    }
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Account not found or already inactive</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Deactivate Account</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="mr-2 h-5 w-5 text-yellow-500" />
            Deactivate {account.name}
          </CardTitle>
          <CardDescription>
            This will hide the account from your active accounts list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <Alert className="mb-4 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Account deactivated successfully. Redirecting...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="mb-4">
                You are about to deactivate your <strong>{account.name}</strong> account with a balance of <strong>{formatCurrency(account.balance)}</strong>.
              </p>
              
              {hasTransactions && (
                <Alert className="mb-4 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-500">
                    This account has {accountTransactions.length} transactions. Deactivating will not delete these transactions.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="mb-4">
                Deactivating an account will:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Hide it from your active accounts list</li>
                <li>Preserve all transaction history</li>
                <li>Allow you to view it again by toggling "Show inactive accounts"</li>
              </ul>
              <p>
                This action can be reversed later by contacting support.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading || success}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeactivate}
            disabled={isLoading || success}
          >
            {isLoading ? "Deactivating..." : "Deactivate Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

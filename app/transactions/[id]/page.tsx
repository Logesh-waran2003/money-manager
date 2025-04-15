"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { useAccountStore } from "@/lib/stores/account-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import { AlertCircle, ArrowLeft, Edit, Trash2, Calendar, CreditCard, Tag, User, FileText, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, formatDateTime } from "@/lib/utils/date";

export default function TransactionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;
  
  const { transactions } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  
  // Find the transaction
  const transaction = transactions.find(t => t.id === transactionId);
  
  // Find related accounts and category
  const account = transaction ? accounts.find(a => a.id === transaction.accountId) : null;
  const toAccount = transaction?.toAccountId ? accounts.find(a => a.id === transaction.toAccountId) : null;
  const category = transaction?.categoryId ? categories.find(c => c.id === transaction.categoryId) : null;
  
  // Redirect if transaction not found
  useEffect(() => {
    if (!transaction) {
      router.push("/transactions");
    }
  }, [transaction, router]);

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

  // Get transaction type display name
  const getTransactionTypeDisplay = () => {
    switch (transaction.type) {
      case 'income': return 'Income';
      case 'expense': return 'Expense';
      case 'transfer': return 'Transfer';
      case 'credit': return 'Credit';
      case 'recurring': return 'Recurring';
      default: return transaction.type;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Transaction Details</h1>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{transaction.description || 'Transaction'}</CardTitle>
              <CardDescription>
                {getTransactionTypeDisplay()} • {formatDate(transaction.date)}
              </CardDescription>
            </div>
            <div className={`text-2xl font-bold font-mono ${transaction.type === 'income' ? 'text-success' : transaction.type === 'expense' ? 'text-destructive' : ''}`}>
              {transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount, account.currency)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2">{formatDate(transaction.date)}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Account:</span>
                <span className="ml-2">{account.name}</span>
              </div>
              
              {transaction.type === 'transfer' && toAccount && (
                <div className="flex items-center text-sm">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">To Account:</span>
                  <span className="ml-2">{toAccount.name}</span>
                </div>
              )}
              
              {category && (
                <div className="flex items-center text-sm">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2">{category.name}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {transaction.counterparty && (
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {transaction.type === 'income' ? 'Payer:' : 
                     transaction.type === 'expense' ? 'Payee:' : 
                     transaction.type === 'credit' ? 'Person/Institution:' : 
                     'Counterparty:'}
                  </span>
                  <span className="ml-2">{transaction.counterparty}</span>
                </div>
              )}
              
              {transaction.appUsed && (
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">App Used:</span>
                  <span className="ml-2">{transaction.appUsed}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{formatDateTime(transaction.createdAt)}</span>
              </div>
              
              {transaction.createdAt !== transaction.updatedAt && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="ml-2">{formatDateTime(transaction.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
          
          {transaction.notes && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{transaction.notes}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/transactions/${transactionId}/edit`)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => router.push(`/transactions/${transactionId}/delete`)}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

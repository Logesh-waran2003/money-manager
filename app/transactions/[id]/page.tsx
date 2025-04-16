"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { useAccountStore } from "@/lib/stores/account-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  User,
  FileText,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, formatDateTime } from "@/lib/utils/date";

export default function TransactionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const { transactions } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();

  console.log("Transaction detail page loaded with ID:", transactionId);
  console.log("Available transactions:", transactions);

  // Find the transaction
  const transaction = transactions.find((t) => t.id === transactionId);
  console.log("Found transaction:", transaction);

  // If the transaction is not found and the ID looks like a temp ID, try to find the real transaction that replaced it
  const isTempId = transactionId.startsWith("temp-");
  let realTransaction = transaction;
  // if (!transaction && isTempId) {
  //   // Try to find a transaction with the same createdAt or description (optimistic match)
  //   realTransaction =
  //     transactions.find(
  //       (t) =>
  //         t.description &&
  //         t.description === params.description &&
  //         !t.id.startsWith("temp-")
  //     ) ||
  //     transactions.find(
  //       (t) =>
  //         t.createdAt &&
  //         t.createdAt === params.createdAt &&
  //         !t.id.startsWith("temp-")
  //     );
  //   if (realTransaction) {
  //     // Replace the URL with the real transaction ID (shallow routing)
  //     router.replace(`/transactions/${realTransaction.id}`);
  //   }
  // }

  // Use the real transaction for rendering
  const tx = realTransaction;

  // Find related accounts and category
  console.log("Accounts:", accounts);
  const account = tx ? accounts.find((a) => a.id === tx.accountId) : null;
  const toAccount = tx?.toAccountId
    ? accounts.find((a) => a.id === tx.toAccountId)
    : null;
  const category = tx?.categoryId
    ? categories.find((c) => c.id === tx.categoryId)
    : null;

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false after a delay to ensure data is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <p>Loading transaction...</p>
        </div>
      </div>
    );
  }

  // Show error if transaction not found
  console.log("Transaction not found:", transactionId);
  console.log("Transaction: ", tx);
  console.log("account: ", account);

  if (!tx || !account) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Transaction not found (ID: {transactionId})
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/transactions")}>
          Return to Transactions
        </Button>
      </div>
    );
  }

  // Get transaction type display name
  const getTransactionTypeDisplay = () => {
    switch (tx.type) {
      case "income":
        return "Income";
      case "expense":
        return "Expense";
      case "transfer":
        return "Transfer";
      case "credit":
        return "Credit";
      case "recurring":
        return "Recurring";
      default:
        return tx.type;
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
              <CardTitle className="text-xl">
                {tx.description || "Transaction"}
              </CardTitle>
              <CardDescription>
                {getTransactionTypeDisplay()} • {formatDate(tx.date)}
              </CardDescription>
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                tx.type === "income"
                  ? "text-success"
                  : tx.type === "expense"
                  ? "text-destructive"
                  : ""
              }`}
            >
              {tx.type === "expense" ? "-" : ""}
              {formatCurrency(tx.amount, account.currency)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Transaction Details
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2">{formatDate(tx.date)}</span>
                </div>

                <div className="flex items-center text-sm">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Account:</span>
                  <span className="ml-2">{account.name}</span>
                </div>

                {tx.type === "transfer" && toAccount && (
                  <div className="flex items-center text-sm">
                    <ArrowLeft className="h-4 w-4 mr-2 text-muted-foreground" />
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

                {tx.counterparty && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {tx.type === "income"
                        ? "Payer:"
                        : tx.type === "expense"
                        ? "Payee:"
                        : tx.type === "credit"
                        ? "Person/Institution:"
                        : "Counterparty:"}
                    </span>
                    <span className="ml-2">{tx.counterparty}</span>
                  </div>
                )}

                {tx.appUsed && (
                  <div className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">App Used:</span>
                    <span className="ml-2">{tx.appUsed}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                System Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{formatDateTime(tx.createdAt)}</span>
                </div>

                {tx.createdAt !== tx.updatedAt && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="ml-2">{formatDateTime(tx.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {tx.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Notes
              </h3>
              <p className="text-sm whitespace-pre-wrap">{tx.notes}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/transaction/edit/${tx.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

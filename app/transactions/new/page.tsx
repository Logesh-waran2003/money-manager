import { Metadata } from "next";
import { Suspense } from "react";
import TransactionForm from "@/components/transactions/transaction-form";

export const metadata: Metadata = {
  title: "New Transaction | Money Manager",
  description: "Create a new transaction",
};

export default function NewTransactionPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Transaction</h1>
        <p className="text-muted-foreground">
          Enter the details of your transaction
        </p>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<div>Loading form...</div>}>
          <TransactionForm />
        </Suspense>
      </div>
    </div>
  );
}

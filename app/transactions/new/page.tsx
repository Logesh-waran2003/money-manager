import { Metadata } from "next";
import Link from "next/link";
import TransactionForm from "@/components/transactions/transaction-form";

export const metadata: Metadata = {
  title: "New Transaction | Money Manager",
  description: "Create a new financial transaction",
};

export default function NewTransactionPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/transactions" className="text-blue-600 hover:underline">
          ← Back to Transactions
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create New Transaction</h1>

      <div className="max-w-2xl">
        <TransactionForm />
      </div>
    </div>
  );
}

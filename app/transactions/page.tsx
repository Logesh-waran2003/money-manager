import Link from "next/link";
import { Metadata } from "next";
import TransactionsContainer from "../../components/transactions/transactions-container";

export const metadata: Metadata = {
  title: "Transactions | Money Manager",
  description: "View and manage your financial transactions",
};

export default function TransactionsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Link
          href="/transactions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Transaction
        </Link>
      </div>

      <TransactionsContainer />
    </div>
  );
}

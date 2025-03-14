import Link from "next/link";
import { Metadata } from "next";
import TransfersList from "@/components/transfers/transfers-list";

export const metadata: Metadata = {
  title: "Transfers | Money Manager",
  description: "View and manage your account transfers",
};

export default function TransfersPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transfers</h1>
        <Link
          href="/transfers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Transfer
        </Link>
      </div>

      <TransfersList />
    </div>
  );
}

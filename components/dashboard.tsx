"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type Account = {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
};

type Transaction = {
  id: number;
  accountId: number;
  amount: string;
  category?: string;
  description?: string;
  time: Date;
};

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total balance
  const totalBalance = accounts.reduce(
    (sum, account) => sum + parseFloat(account.balance),
    0
  );

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch accounts
        const accountsRes = await fetch("/api/accounts");
        if (!accountsRes.ok) throw new Error("Failed to fetch accounts");
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);

        // Fetch recent transactions
        const transactionsRes = await fetch("/api/transactions?limit=5");
        if (!transactionsRes.ok)
          throw new Error("Failed to fetch transactions");
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="w-full text-center">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="p-6 bg-blue-50 rounded-lg">
          <p className="text-lg mb-2">Total Balance</p>
          <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Accounts</h2>
          <Link href="/accounts/new" className="text-blue-500 hover:underline">
            + Add Account
          </Link>
        </div>

        {accounts.length === 0 ? (
          <p>No accounts found. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">{account.name}</p>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      account.type === "credit"
                        ? "bg-orange-100"
                        : "bg-green-100"
                    }`}
                  >
                    {account.type}
                  </span>
                </div>
                <p className="text-xl mt-2">
                  {formatCurrency(parseFloat(account.balance))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
          <a href="/transactions/new" className="text-blue-500 hover:underline">
            + Add Transaction
          </a>
        </div>

        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-4 py-3">
                      {new Date(transaction.time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.description || "-"}
                    </td>
                    <td className="px-4 py-3">{transaction.category || "-"}</td>
                    <td
                      className={`px-4 py-3 text-right ${
                        parseFloat(transaction.amount) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(parseFloat(transaction.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

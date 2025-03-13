"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type Account = {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
};

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  if (loading)
    return <div className="text-center py-8">Loading accounts...</div>;
  if (error) return <div className="text-red-500 py-8">Error: {error}</div>;
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">
          No accounts found. Create your first account to get started.
        </p>
        <Link
          href="/accounts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Account
        </Link>
      </div>
    );
  }

  // Calculate total balance
  const totalBalance = accounts.reduce(
    (sum, account) => sum + parseFloat(account.balance),
    0
  );

  // Calculate debit and credit totals
  const debitTotal = accounts
    .filter((account) => account.type === "debit")
    .reduce((sum, account) => sum + parseFloat(account.balance), 0);

  const creditTotal = accounts
    .filter((account) => account.type === "credit")
    .reduce((sum, account) => sum + parseFloat(account.balance), 0);

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Balance</h3>
          <p className="text-2xl font-semibold">
            {formatCurrency(totalBalance)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Debit Accounts</h3>
          <p className="text-2xl font-semibold text-green-600">
            {formatCurrency(debitTotal)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Credit Accounts</h3>
          <p className="text-2xl font-semibold text-orange-600">
            {formatCurrency(creditTotal)}
          </p>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/accounts/${account.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {account.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      account.type === "debit"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {account.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                  {formatCurrency(parseFloat(account.balance))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/accounts/${account.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View
                  </Link>
                  <Link
                    href={`/accounts/${account.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Account = {
  id: number;
  name: string;
  type: "debit" | "credit";
};

type TransactionFormProps = {
  id?: string;
  initialData?: {
    accountId: number;
    amount: string;
    category?: string;
    description?: string;
    appUsed?: string;
    time: string;
  };
};

export default function TransactionForm({
  id,
  initialData,
}: TransactionFormProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    accountId: initialData?.accountId || 0,
    amount: initialData?.amount || "",
    category: initialData?.category || "",
    description: initialData?.description || "",
    appUsed: initialData?.appUsed || "",
    time: initialData?.time || new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    // Fetch accounts for the dropdown
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        setAccounts(data);

        // Set default accountId if accounts are loaded and no initialData
        if (data.length > 0 && !initialData) {
          setFormData((prev) => ({ ...prev, accountId: data[0].id }));
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setError("Failed to load accounts. Please try again.");
      }
    }

    fetchAccounts();
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "accountId" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = id ? `/api/transactions/${id}` : "/api/transactions";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save transaction");
      }

      router.push("/transactions");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isPositive = parseFloat(formData.amount) >= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      )}

      <div className="grid gap-4">
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium mb-1">
            Account
          </label>
          <select
            id="accountId"
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {accounts.length === 0 ? (
              <option value="">No accounts available</option>
            ) : (
              accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.type})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Amount (Income +, Expense -)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-blue-500 ${
              isPositive ? "focus:ring-green-500" : "focus:ring-red-500"
            }`}
            step="0.01"
            required
          />
          <p className="text-sm mt-1 text-gray-500">
            {isPositive ? "Income transaction" : "Expense transaction"}
          </p>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Food, Utilities, Salary, etc."
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Transaction details..."
          />
        </div>

        <div>
          <label htmlFor="appUsed" className="block text-sm font-medium mb-1">
            Payment App/Method
          </label>
          <input
            type="text"
            id="appUsed"
            name="appUsed"
            value={formData.appUsed}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cash, GPay, PhonePe, etc."
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : id
            ? "Update Transaction"
            : "Add Transaction"}
        </button>
      </div>
    </form>
  );
}

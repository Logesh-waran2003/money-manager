"use client";

import React, { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface AccountSelectorProps {
  selectedAccount: string;
  onChange: (value: string) => void;
  label?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ selectedAccount, onChange, label = "Account" }) => {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "checking", name: "Checking Account", type: "bank", balance: 1000 },
    { id: "savings", name: "Savings Account", type: "bank", balance: 5000 },
    { id: "credit-card", name: "Credit Card", type: "credit", balance: 0 },
    { id: "investment", name: "Investment Account", type: "investment", balance: 10000 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/accounts');
        if (!response.ok) {
          throw new Error('Failed to fetch accounts');
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setAccounts(data);
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load accounts');
        // Keep using the default accounts
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={selectedAccount} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="border-input bg-background transition-colors">
          <SelectValue placeholder={isLoading ? "Loading accounts..." : "Select account"} />
        </SelectTrigger>
        <SelectContent>
          {error && (
            <div className="px-2 py-1 text-sm text-red-500">{error}</div>
          )}
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name} {account.balance !== undefined && `($${account.balance.toFixed(2)})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
export default AccountSelector;

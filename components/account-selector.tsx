"use client";

import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AccountSelectorProps {
  selectedAccount: string;
  onChange: (value: string) => void;
  label?: string;
}

const accounts = [
  { id: "checking", name: "Checking Account" },
  { id: "savings", name: "Savings Account" },
  { id: "credit-card", name: "Credit Card" },
  { id: "investment", name: "Investment Account" },
];

const AccountSelector: React.FC<AccountSelectorProps> = ({ selectedAccount, onChange, label = "Account" }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={selectedAccount} onValueChange={onChange}>
        <SelectTrigger className="border-input bg-background transition-colors">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountSelector;

"use client";

import React from "react";
import { TransactionCard } from "@/components/ui/transaction-card";
import { formatCurrency } from "@/lib/utils/currency";
import { useRouter } from "next/navigation";

// Function to determine the sign of the amount based on transaction type
export interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "expense" | string;
  creditType?: "lent" | "borrowed" | string;
  description?: string;
  date?: string;
  category?: { name?: string };
  counterparty?: string;
  account?: { name?: string };
  accountId?: string;
  toAccountId?: string;
}

export const getAmountWithSign = (transaction: Transaction): number => {
  const { type, creditType, amount } = transaction;

  // For credit transactions
  if (type === "credit") {
    // Lent money should be negative (money going out)
    if (creditType === "lent") {
      return -Math.abs(amount);
    }
    // Borrowed money should be positive (money coming in)
    else if (creditType === "borrowed") {
      return Math.abs(amount);
    }
  }

  // For other transaction types, use the existing logic
  if (type === "expense") {
    return -Math.abs(amount);
  }

  return amount;
};

export interface TransactionListProps {
  transactions: any[];
  showAccount?: boolean;
  currentAccountId?: string;
  onTransactionClick?: (transaction: any) => void;
}

export function TransactionList({
  transactions,
  showAccount = true,
  currentAccountId,
  onTransactionClick,
}: TransactionListProps) {
  const router = useRouter();

  interface HandleTransactionClick {
    (transaction: Transaction): void;
  }

  const handleTransactionClick: HandleTransactionClick = (transaction) => {
    if (onTransactionClick) {
      onTransactionClick(transaction.id);
    } else {
      router.push(`/transactions/${transaction.id}`);
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => {
        const isTemp = transaction.id.startsWith("temp-");
        return (
          <div
            key={transaction.id}
            className={isTemp ? "opacity-60 pointer-events-none" : ""}
          >
            <TransactionCard
              id={transaction.id}
              amount={transaction.amount}
              description={transaction.description || ""}
              date={transaction.date}
              type={transaction.type}
              category={transaction.category?.name || "other"}
              counterparty={transaction.counterparty || ""}
              accountName={showAccount ? transaction.account?.name : undefined}
              accountId={transaction.accountId}
              toAccountId={transaction.toAccountId}
              onClick={
                isTemp ? undefined : () => handleTransactionClick(transaction)
              }
              showInAccount={!!currentAccountId}
            />
            {isTemp && (
              <div className="text-xs text-muted-foreground ml-4">
                Saving...
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

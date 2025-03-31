"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { CreditCard, Wallet, Building, ArrowUpRight, ArrowDownRight } from "lucide-react";

export type AccountType = "debit" | "credit" | "bank" | "cash" | "investment";

interface AccountCardProps {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  lastTransaction?: {
    amount: number;
    isIncome: boolean;
    date: string;
  };
  onClick?: () => void;
  className?: string;
}

export function AccountCard({
  id,
  name,
  balance,
  type,
  lastTransaction,
  onClick,
  className,
}: AccountCardProps) {
  // Determine icon based on account type
  const getIcon = () => {
    switch (type) {
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      case "bank":
        return <Building className="h-5 w-5" />;
      case "cash":
        return <Wallet className="h-5 w-5" />;
      case "investment":
        return <ArrowUpRight className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  // Determine card style based on account type
  const getCardStyle = () => {
    switch (type) {
      case "credit":
        return "border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background/80";
      case "bank":
        return "border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background/80";
      case "cash":
        return "border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background/80";
      case "investment":
        return "border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-background/80";
      default:
        return "border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
        getCardStyle(),
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
            {getIcon()}
          </div>
          <h3 className="font-medium text-sm">{name}</h3>
        </div>
        <div className="text-xs opacity-70 capitalize">{type}</div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-3">
        <div className="text-2xl font-semibold font-mono">
          {formatCurrency(balance)}
        </div>
      </CardContent>
      {lastTransaction && (
        <CardFooter className="p-3 pt-0 text-xs border-t border-border/40 flex justify-between items-center">
          <div className="flex items-center gap-1">
            {lastTransaction.isIncome ? (
              <ArrowUpRight className="h-3 w-3 text-success" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-error" />
            )}
            <span>Last transaction</span>
          </div>
          <div className="font-mono">
            {formatCurrency(lastTransaction.amount)}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

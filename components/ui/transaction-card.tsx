"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatTransactionDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight, 
  CreditCard, 
  Repeat,
  Tag,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Briefcase,
  Gift,
  Plane,
  HeartPulse,
  Laptop,
  Dumbbell,
  Sparkles
} from "lucide-react";

export type TransactionType = "income" | "expense" | "transfer" | "credit" | "recurring";
export type TransactionCategory = 
  | "food" 
  | "shopping" 
  | "housing" 
  | "transportation" 
  | "entertainment" 
  | "health" 
  | "personal" 
  | "education" 
  | "gifts" 
  | "travel" 
  | "income" 
  | "other";

interface TransactionCardProps {
  id: string;
  amount: number;
  description: string;
  date: string | Date;
  type: TransactionType;
  category: TransactionCategory;
  counterparty: string;
  accountName?: string;
  accountId?: string;
  toAccountId?: string;
  onClick?: () => void;
  className?: string;
  showInAccount?: boolean;
}

export function TransactionCard({
  id,
  amount,
  description,
  date,
  type,
  category,
  counterparty,
  accountName,
  accountId,
  toAccountId,
  onClick,
  className,
  showInAccount = false,
}: TransactionCardProps) {
  // Get category icon
  const getCategoryIcon = () => {
    switch (category) {
      case "food":
        return <Utensils className="h-4 w-4" />;
      case "shopping":
        return <ShoppingCart className="h-4 w-4" />;
      case "housing":
        return <Home className="h-4 w-4" />;
      case "transportation":
        return <Car className="h-4 w-4" />;
      case "entertainment":
        return <Sparkles className="h-4 w-4" />;
      case "health":
        return <HeartPulse className="h-4 w-4" />;
      case "personal":
        return <Dumbbell className="h-4 w-4" />;
      case "education":
        return <Laptop className="h-4 w-4" />;
      case "gifts":
        return <Gift className="h-4 w-4" />;
      case "travel":
        return <Plane className="h-4 w-4" />;
      case "income":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  // Get transaction type icon
  const getTypeIcon = () => {
    switch (type) {
      case "income":
        return <ArrowUpRight className="h-4 w-4 text-success" />;
      case "expense":
        return <ArrowDownRight className="h-4 w-4 text-error" />;
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4 text-info" />;
      case "credit":
        return <CreditCard className="h-4 w-4 text-credit" />;
      case "recurring":
        return <Repeat className="h-4 w-4 text-recurring" />;
      default:
        return <ArrowDownRight className="h-4 w-4 text-error" />;
    }
  };

  // Format the date
  const formattedDate = formatTransactionDate(date);

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:bg-accent/5 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-background border border-border/50">
            {getCategoryIcon()}
          </div>
          <div>
            <div className="font-medium text-sm">{counterparty}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {getTypeIcon()}
              <span>{description}</span>
              {accountName && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{accountName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            "font-medium font-mono",
            type === "income" ? "text-success" : 
            type === "expense" ? "text-error" : 
            type === "transfer" && showInAccount ? (
              // For transfers in account view
              accountId === toAccountId ? "text-success" : "text-error"
            ) : ""
          )}>
            {type === "income" ? "+" : 
             type === "expense" ? "-" : 
             type === "transfer" && showInAccount ? (
               // For transfers in account view
               accountId === toAccountId ? "+" : "-"
             ) : ""}
            {formatCurrency(amount)}
          </div>
          <div className="text-xs text-muted-foreground">{formattedDate}</div>
        </div>
      </CardContent>
    </Card>
  );
}

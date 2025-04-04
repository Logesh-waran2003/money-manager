import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  CreditCard,
  ChevronRight
} from "lucide-react";
import { Transaction } from "@/lib/stores/useTransactionStore";
import { useAccounts } from "@/lib/stores/useAccountStore";
import { useCategories } from "@/lib/stores/useCategoryStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TransactionListProps {
  transactions: Transaction[];
  showAccount?: boolean;
  limit?: number;
  currentAccountId?: string; // Add this prop to identify the current account
}

export function TransactionList({ 
  transactions, 
  showAccount = true,
  limit,
  currentAccountId
}: TransactionListProps) {
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  
  // Sort transactions by date (newest first)
  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  // Apply limit if specified
  const displayTransactions = limit 
    ? sortedTransactions.slice(0, limit) 
    : sortedTransactions;

  const getAccountName = (accountId: string) => {
    const account = accounts?.find(a => a.id === accountId);
    return account?.name || "Unknown Account";
  };

  const getCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return "";
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || "";
  };

  const getCategoryColor = (categoryId: string | undefined) => {
    if (!categoryId) return "#888888";
    const category = categories?.find(c => c.id === categoryId);
    return category?.color || "#888888";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case "income":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "expense":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case "credit":
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  if (displayTransactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayTransactions.map((transaction) => (
        <div 
          key={transaction.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
          onClick={() => router.push(`/transactions/${transaction.id}`)}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getTransactionIcon(transaction)}
            </div>
            <div>
              <div className="font-medium">
                {transaction.description || 
                  (transaction.type === "transfer" 
                    ? `Transfer to ${getAccountName(transaction.toAccountId || "")}` 
                    : getCategoryName(transaction.categoryId)
                  )
                }
              </div>
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <span>{format(new Date(transaction.date), "MMM d, yyyy")}</span>
                {transaction.categoryId && (
                  <>
                    <span>•</span>
                    <span 
                      className="inline-flex items-center"
                      style={{ color: getCategoryColor(transaction.categoryId) }}
                    >
                      {getCategoryName(transaction.categoryId)}
                    </span>
                  </>
                )}
                {showAccount && (
                  <>
                    <span>•</span>
                    <span>{getAccountName(transaction.accountId)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`text-right font-medium ${
              // For regular transactions
              transaction.type === "expense" || 
              (transaction.type === "credit" && transaction.creditType === "borrowed")
                ? "text-red-500" 
                : transaction.type === "income"
                  ? "text-green-500"
                  : transaction.type === "transfer"
                    ? (currentAccountId 
                        ? (transaction.accountId === currentAccountId ? "text-red-500" : "text-green-500") 
                        : "text-blue-500")
                    : "text-green-500"
            }`}>
              {transaction.type === "expense" || 
               (transaction.type === "credit" && transaction.creditType === "borrowed") ||
               (transaction.type === "transfer" && currentAccountId && transaction.accountId === currentAccountId)
                ? "-" 
                : transaction.type === "income" || 
                  (transaction.type === "transfer" && currentAccountId && transaction.toAccountId === currentAccountId)
                  ? "+" 
                  : transaction.type === "transfer" && !currentAccountId
                    ? "" // No sign for transfers in the main transactions list
                    : "+"
              }{formatCurrency(transaction.amount)}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ))}
      
      {limit && transactions.length > limit && (
        <div className="text-center pt-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push("/transactions")}
          >
            View all transactions
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransactionCard } from "@/components/ui/transaction-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { useAccountStore } from "@/lib/stores/account-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import { PlusCircle, Search, Filter, ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateRange } from "@/lib/utils/date";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const router = useRouter();
  const { filteredTransactions, isLoading, setFilters, filters } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Apply filters
  const handleApplyFilters = () => {
    setFilters({
      searchQuery,
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      accountId: selectedAccountId,
      categoryId: selectedCategoryId,
      type: selectedType as any,
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setDateRange(undefined);
    setSelectedAccountId(undefined);
    setSelectedCategoryId(undefined);
    setSelectedType(undefined);
    setFilters({});
  };

  // Handle transaction click
  const handleTransactionClick = (id: string) => {
    router.push(`/transactions/${id}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Link href="/transaction">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Account</label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Income</div>
            <div className="text-2xl font-bold font-mono text-success mt-1">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold font-mono text-error mt-1">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Net</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${totalIncome - totalExpenses >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Transactions
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredTransactions.length} transactions
              {dateRange && ` • ${formatDateRange(dateRange.from, dateRange.to)}`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <div className="mt-2 text-sm text-muted-foreground">Loading transactions...</div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  id={transaction.id}
                  amount={transaction.amount}
                  description={transaction.description || ""}
                  date={transaction.date}
                  type={transaction.type as any}
                  category={transaction.categoryId ? "other" as any : "other" as any} // This would come from the category
                  counterparty={transaction.counterparty || ""}
                  accountName={accounts.find(a => a.id === transaction.accountId)?.name}
                  onClick={() => handleTransactionClick(transaction.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium">No transactions found</h3>
              <p className="text-muted-foreground mt-1">
                {Object.keys(filters).length > 0 
                  ? "Try adjusting your filters to see more results." 
                  : "You haven't added any transactions yet."}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/transaction">Add Transaction</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TransactionList } from "@/components/transaction-list";
import { useAccountStore } from "@/lib/stores/account-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import { formatCurrency } from "@/lib/utils/currency";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, fetchTransactions, isLoading, error, setFilters, filters } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  
  // Local filter state
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>(filters.accountId || "all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(filters.categoryId || "all");
  const [selectedType, setSelectedType] = useState<string>(filters.type || "all");
  
  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  // Get filtered transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Search query filter
    if (filters.searchQuery && !transaction.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !transaction.counterparty?.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }
    
    // Account filter
    if (filters.accountId && transaction.accountId !== filters.accountId) {
      return false;
    }
    
    // Category filter
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
      return false;
    }
    
    // Type filter
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setDateRange(undefined);
    setSelectedAccountId("all");
    setSelectedCategoryId("all");
    setSelectedType("all");
    setFilters({});
  };

  // State for filter visibility
  const [showFilters, setShowFilters] = useState(false);

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setFilters({
      searchQuery,
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      accountId: selectedAccountId !== "all" ? selectedAccountId : undefined,
      categoryId: selectedCategoryId !== "all" ? selectedCategoryId : undefined,
      type: selectedType !== "all" ? selectedType : undefined,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleFilters}>
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Link href="/transaction">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <DateRangePicker
                className="w-full"
                placeholder="Select date range"
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Account</label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Net</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <div className="mt-2 text-sm text-muted-foreground">Loading transactions...</div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <TransactionList 
              transactions={filteredTransactions} 
              onTransactionClick={handleTransactionClick}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No transactions found</p>
              <Link href="/transaction">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Transaction
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

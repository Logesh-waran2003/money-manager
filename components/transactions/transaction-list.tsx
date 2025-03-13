"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";

// Define the transaction type based on the schema
interface Transaction {
  id: number;
  accountId: number;
  amount: string;
  category?: string;
  description?: string;
  appUsed?: string;
  time: Date;
  transferId?: number | null;
  recurringSpendId?: number | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  showAccountColumn?: boolean;
  accountName?: string;
  getAccountName?: (accountId: number) => string;
}

export default function TransactionList({
  transactions,
  showAccountColumn = false,
  accountName,
  getAccountName,
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Get unique categories for filter dropdown
  const categories = [
    ...new Set(transactions.map((t) => t.category).filter(Boolean)),
  ];

  // Filter transactions based on search query and category filter
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchQuery ||
      transaction.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.appUsed?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter.length === 0 ||
      (transaction.category && categoryFilter.includes(transaction.category));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filter by Category</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={categoryFilter.includes(category!)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCategoryFilter([...categoryFilter, category!]);
                  } else {
                    setCategoryFilter(
                      categoryFilter.filter((c) => c !== category)
                    );
                  }
                }}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {showAccountColumn && <TableHead>Account</TableHead>}
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>App Used</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.time)}</TableCell>
                  {showAccountColumn && (
                    <TableCell>
                      {getAccountName
                        ? getAccountName(transaction.accountId)
                        : accountName || "-"}
                    </TableCell>
                  )}
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell>{transaction.category || "-"}</TableCell>
                  <TableCell>{transaction.appUsed || "-"}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      parseFloat(transaction.amount) < 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showAccountColumn ? 6 : 5}
                  className="h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

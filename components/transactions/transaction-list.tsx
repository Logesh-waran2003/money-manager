"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MoreHorizontal,
  PencilIcon,
  Trash2Icon,
  FilterIcon,
  ChevronDownIcon,
} from "lucide-react";

// Define the transaction type based on the schema
interface Transaction {
  id: number;
  accountId: number;
  amount: string;
  categoryId?: number;
  categoryName?: string; // Changed from category to categoryName
  description?: string;
  paymentAppId?: number;
  paymentAppName?: string; // Changed from appUsed to paymentAppName
  time: Date;
  transferId?: number | null;
  recurringSpendId?: number | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  showAccountColumn?: boolean;
  accountName?: string;
  getAccountName?: (accountId: number) => string;
  onDelete?: (transaction: Transaction) => Promise<void>;
}

export default function TransactionList({
  transactions,
  showAccountColumn = false,
  accountName,
  getAccountName,
  onDelete,
}: TransactionListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Get unique categories for filter dropdown
  const categories = [
    ...new Set(transactions.map((t) => t.categoryName).filter(Boolean)),
  ];

  // Filter transactions based on search query and category filter
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchQuery ||
      transaction.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.categoryName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.paymentAppName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter.length === 0 ||
      (transaction.categoryName &&
        categoryFilter.includes(transaction.categoryName));

    return matchesSearch && matchesCategory;
  });

  function handleEditTransaction(transaction: Transaction) {
    router.push(`/transactions/${transaction.id}/edit`);
  }

  async function handleDeleteTransaction(transaction: Transaction) {
    if (onDelete) {
      await onDelete(transaction);
    } else {
      try {
        const response = await fetch(`/api/transactions/${transaction.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete transaction");
        }

        // Refresh the page to show updated data
        router.refresh();
      } catch (err) {
        console.error("Error deleting transaction:", err);
        // You could add toast notifications here
        alert("Failed to delete transaction");
      }
    }
  }

  // Determine if a transaction is a transfer (has transferId)
  const isTransfer = (transaction: Transaction) => {
    return (
      transaction.transferId !== null && transaction.transferId !== undefined
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter by Category
              <ChevronDownIcon className="h-4 w-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categories.length > 0 ? (
              <>
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
                {categoryFilter.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setCategoryFilter([])}
                      className="justify-center text-blue-600"
                    >
                      Clear Filters
                    </DropdownMenuItem>
                  </>
                )}
              </>
            ) : (
              <DropdownMenuItem disabled>No categories found</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {showAccountColumn && <TableHead>Account</TableHead>}
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>App Used</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
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
                    <TableCell>
                      {transaction.categoryName ||
                        (isTransfer(transaction) ? "Transfer" : "-")}
                    </TableCell>
                    <TableCell>{transaction.paymentAppName || "-"}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        parseFloat(transaction.amount) < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditTransaction(transaction)}
                            disabled={isTransfer(transaction)}
                          >
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteTransaction(transaction)}
                            disabled={isTransfer(transaction)}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={showAccountColumn ? 7 : 6}
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

      {filteredTransactions.length > 0 && (
        <div className="text-sm text-muted-foreground text-right">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </div>
      )}
    </div>
  );
}

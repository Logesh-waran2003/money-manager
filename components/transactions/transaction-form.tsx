"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define transaction form schema
const transactionFormSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Amount must be a number",
  }),
  category: z.string().optional(),
  description: z.string().optional(),
  appUsed: z.string().optional(),
  time: z.date(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface Account {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
  description?: string;
}

export default function TransactionForm({
  initialValues,
  transactionId,
}: {
  initialValues?: Omit<TransactionFormValues, "accountId"> & {
    accountId: number;
  };
  transactionId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultAccountId = searchParams?.get("accountId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const isEditing = !!transactionId;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: initialValues
      ? {
          ...initialValues,
          accountId: initialValues.accountId.toString(),
          time: new Date(initialValues.time),
        }
      : {
          accountId: defaultAccountId || "",
          amount: "",
          category: "",
          description: "",
          appUsed: "",
          time: new Date(),
        },
  });

  // Fetch accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load accounts. Please try again.");
      } finally {
        setIsLoadingAccounts(false);
      }
    }

    fetchAccounts();
  }, []);

  async function onSubmit(data: TransactionFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/transactions/${transactionId}`
        : "/api/transactions";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          accountId: parseInt(data.accountId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save transaction");
      }

      // Navigate back to appropriate page
      if (defaultAccountId && !isEditing) {
        router.push(`/accounts/${defaultAccountId}`);
      } else {
        router.push("/transactions");
      }
      router.refresh();
    } catch (err) {
      console.error("Error submitting transaction form:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTransaction() {
    if (!transactionId) return;

    setIsDeletingTransaction(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete transaction");
      }

      router.push("/transactions");
      router.refresh();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete transaction"
      );
      setIsDeletingTransaction(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingAccounts}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount (negative for expense)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Food, Travel, Salary"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add details about this transaction"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appUsed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>App Used (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Amazon, Swiggy"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date & Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-between">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTransaction}
              disabled={isDeletingTransaction}
            >
              {isDeletingTransaction && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Transaction
            </Button>
          )}

          <div className="flex gap-4 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update" : "Create"} Transaction
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

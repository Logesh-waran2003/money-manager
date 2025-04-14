"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { useCreditStore } from "@/lib/stores/credit-store";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import AccountSelector from "@/components/account-selector";
import CategorySelector from "@/components/category-selector";
import TransactionFormFields from "@/components/transaction-form-fields";
import PaymentTypeSelector from "@/components/payment-type-selector";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "@/lib/stores/transaction-store";

export default function TransactionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { addTransaction } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(false);

  // Check URL parameters for transaction type
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null
  );

  useEffect(() => {
    // Get URL parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);

      // Set transfer mode if specified in URL
      if (params.get("type") === "transfer") {
        setIsTransfer(true);
        setTransactionType("transfer");
      }
    }
  }, []);

  // Core transaction details
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [direction, setDirection] = useState("sent");
  const [counterparty, setCounterparty] = useState("");
  const [appUsed, setAppUsed] = useState("");
  const [category, setCategory] = useState("");

  // Transaction type toggles
  const [isCredit, setIsCredit] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isTransfer, setIsTransfer] = useState(false);

  // Transaction type and specific fields
  const [transactionType, setTransactionType] = useState("regular");
  const [recurringName, setRecurringName] = useState("");
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [creditType, setCreditType] = useState("lent");
  const [creditDueDate, setCreditDueDate] = useState<Date | undefined>(
    new Date()
  );
  const [destinationAccount, setDestinationAccount] = useState("");

  // Credit repayment fields
  const [isRepayment, setIsRepayment] = useState(false);
  const [selectedCreditId, setSelectedCreditId] = useState("");
  const [isFullSettlement, setIsFullSettlement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form based on transaction type
    if (!selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please select an account",
        variant: "destructive",
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      });
      return;
    }

    if (transactionType === "recurring" && !recurringName) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the recurring payment",
        variant: "destructive",
      });
      return;
    }

    if (
      transactionType === "transfer" &&
      (!selectedAccount || !destinationAccount)
    ) {
      toast({
        title: "Missing Information",
        description: "Please select both source and destination accounts",
        variant: "destructive",
      });
      return;
    }

    if (isCredit && isRepayment && !selectedCreditId) {
      toast({
        title: "Missing Information",
        description: "Please select an existing credit transaction",
        variant: "destructive",
      });
      return;
    }

    if (
      transactionType === "transfer" &&
      selectedAccount === destinationAccount
    ) {
      toast({
        title: "Invalid Transfer",
        description: "Source and destination accounts cannot be the same",
        variant: "destructive",
      });
      return;
    }

    if (
      (transactionType === "regular" || transactionType === "credit") &&
      !counterparty
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please enter a " +
          (transactionType === "credit"
            ? creditType === "lent"
              ? "recipient"
              : "lender"
            : "counterparty"),
        variant: "destructive",
      });
      return;
    }

    if (
      (transactionType === "income" || transactionType === "expense") &&
      !category
    ) {
      toast({
        title: "Missing Information",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }
    
    // Validate repayment amount doesn't exceed balance
    if (isCredit && isRepayment && selectedCreditId) {
      try {
        const isValid = useCreditStore.getState().validateRepaymentAmount(
          selectedCreditId,
          parseFloat(amount)
        );
        
        if (!isValid && !isFullSettlement) {
          toast({
            title: "Invalid Repayment Amount",
            description: "Repayment amount exceeds the remaining balance. If this is intended to fully settle the debt, please mark it as a full settlement.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error validating repayment amount:", error);
      }
    }

    // Determine the actual transaction type for the API
    let apiTransactionType = transactionType;
    if (transactionType === "regular") {
      apiTransactionType = direction === "received" ? "income" : "expense";
    }

    // Create transaction object for API
    const transactionData = {
      accountId: selectedAccount,
      amount: parseFloat(amount),
      description,
      date: date?.toISOString() || new Date().toISOString(),
      type: apiTransactionType,
      categoryId: category || undefined,
      counterparty,
      appUsed,
      toAccountId: isTransfer ? destinationAccount : undefined,
      creditType: isCredit ? creditType : undefined,
      dueDate: isCredit ? creditDueDate?.toISOString() : undefined,
      recurring: isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      recurringName: isRecurring ? recurringName : undefined,
      // Add repayment fields if applicable
      creditId: isCredit && isRepayment ? selectedCreditId : undefined,
      isRepayment: isCredit ? isRepayment : undefined,
      isFullSettlement: isCredit && isRepayment ? isFullSettlement : undefined,
    };

    try {
      setIsLoading(true);

      // Handle credit repayments differently
      if (isCredit && isRepayment && selectedCreditId) {
        // Use the credit store to add a repayment
        await useCreditStore.getState().addRepayment({
          creditId: selectedCreditId,
          accountId: selectedAccount,
          amount: parseFloat(amount),
          date: date?.toISOString() || new Date().toISOString(),
          description,
          isFullSettlement,
          categoryId: category || undefined,
        });
      } else {
        // Use the transaction store for regular transactions
        await addTransaction({
          id: `temp-${Date.now()}`,
          ...transactionData,
          type: transactionData.type as
            | "income"
            | "expense"
            | "transfer"
            | "credit",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Prepare appropriate message based on transaction type
      let message = "";
      if (transactionType === "regular") {
        message = `${
          direction === "received" ? "Received" : "Sent"
        } $${amount} ${
          direction === "received" ? "from" : "to"
        } ${counterparty}`;
      } else if (transactionType === "credit") {
        message = `${creditType === "lent" ? "Lent" : "Borrowed"} $${amount} ${
          creditType === "lent" ? "to" : "from"
        } ${counterparty}`;

        if (isRepayment) {
          message = `Recorded repayment of $${amount} for credit with ${counterparty}`;
          if (isFullSettlement) {
            message += " (fully settled)";
          }
        }
      } else if (transactionType === "recurring") {
        message = `Added recurring payment "${recurringName}" of $${amount} (${recurringFrequency})`;
      } else if (transactionType === "transfer") {
        message = `Transferred $${amount} between accounts`;
      }

      toast({
        title: "Transaction Saved",
        description: message,
      });

      // Navigate back to transactions page
      router.push("/transactions");
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="flex items-center mb-6 gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">New Transaction</h1>
      </div>

      <Card className="p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isTransfer ? (
            <AccountSelector
              selectedAccount={selectedAccount}
              onChange={setSelectedAccount}
              label="Account"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AccountSelector
                selectedAccount={selectedAccount}
                onChange={setSelectedAccount}
                label="From Account"
              />
              <AccountSelector
                selectedAccount={destinationAccount}
                onChange={setDestinationAccount}
                label="To Account"
              />
            </div>
          )}

          <TransactionFormFields
            direction={direction}
            setDirection={setDirection}
            counterparty={counterparty}
            setCounterparty={setCounterparty}
            appUsed={appUsed}
            setAppUsed={setAppUsed}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            creditType={creditType}
            setCreditType={setCreditType}
            recurringName={recurringName}
            setRecurringName={setRecurringName}
            isCredit={isCredit}
            setIsCredit={setIsCredit}
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            isTransfer={isTransfer}
            setIsTransfer={setIsTransfer}
            isRepayment={isRepayment}
            setIsRepayment={setIsRepayment}
            selectedCreditId={selectedCreditId}
            setSelectedCreditId={setSelectedCreditId}
          />

          {/* Transaction amount and date - common for all transaction types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Category selector for non-transfer transactions */}
          {!isTransfer && !isCredit && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <CategorySelector
                selectedCategory={category}
                onChange={setCategory}
                type={direction === "received" ? "income" : "expense"}
              />
            </div>
          )}

          {/* Transaction type specific additional fields */}
          {isRecurring && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <PaymentTypeSelector
                value={recurringFrequency}
                onChange={setRecurringFrequency}
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "yearly", label: "Yearly" },
                ]}
              />
            </div>
          )}

          {isCredit && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {creditDueDate ? (
                      format(creditDueDate, "PPP")
                    ) : (
                      <span>Pick a due date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={creditDueDate}
                    onSelect={setCreditDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Full Settlement Checkbox */}
          {isCredit && isRepayment && selectedCreditId && (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="settlement"
                checked={isFullSettlement}
                onCheckedChange={(checked) => {
                  setIsFullSettlement(checked === true);
                }}
              />
              <Label htmlFor="settlement" className="cursor-pointer">
                Mark as fully settled
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter transaction details..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

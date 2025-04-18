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
import RecurringPaymentSelector from "@/components/recurring-payment-selector";
import { cn } from "@/lib/utils";
import { calculateNextDueDate, getFrequencyOptions } from "@/lib/utils/recurring-payment-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "@/lib/stores/transaction-store";

export default function TransactionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { addTransaction } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(false);

  // State for recurring payment selection
  const [selectedRecurringPaymentId, setSelectedRecurringPaymentId] = useState("");
  // Check URL parameters for transaction type
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null
  );

  // Get URL parameters and prefetch credits
  useEffect(() => {
    // Get URL parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
    
    // Prefetch credits for both lent and borrowed types
    const fetchCredits = async () => {
      try {
        await useCreditStore.getState().fetchCredits();
      } catch (error) {
        console.error("Error prefetching credits:", error);
      }
    };
    
    fetchCredits();
  }, []);
  
  // Apply URL parameters to form fields
  useEffect(() => {
    if (searchParams) {
      // Set transaction type
      const type = searchParams.get("type");
      if (type === "credit") {
        setIsCredit(true);
        setTransactionType("credit");
      } else if (type === "transfer") {
        setIsTransfer(true);
        setTransactionType("transfer");
      } else if (type === "recurring") {
        setIsRecurring(true);
        setTransactionType("recurring");
        
        // Set recurring payment ID if provided
        const recurringPaymentId = searchParams.get("recurringPaymentId");
        if (recurringPaymentId) {
          setSelectedRecurringPaymentId(recurringPaymentId);
        }
      }
      
      // Set credit type
      const creditTypeParam = searchParams.get("creditType");
      if (creditTypeParam === "lent" || creditTypeParam === "borrowed") {
        setCreditType(creditTypeParam);
      }
      
      // Set repayment flag
      const isRepaymentParam = searchParams.get("isRepayment");
      if (isRepaymentParam === "true") {
        setIsRepayment(true);
      }
      
      // Set credit ID for repayment
      const creditId = searchParams.get("creditId");
      if (creditId) {
        setSelectedCreditId(creditId);
      }
      
      // Set counterparty
      const counterpartyParam = searchParams.get("counterparty");
      if (counterpartyParam) {
        setCounterparty(counterpartyParam);
      }
      
      // Set amount
      const amountParam = searchParams.get("amount");
      if (amountParam) {
        setAmount(amountParam);
      }
      
      // Set description
      const descriptionParam = searchParams.get("description");
      if (descriptionParam) {
        setDescription(descriptionParam);
      }
      
      // Set date
      const dateParam = searchParams.get("date");
      if (dateParam) {
        setDate(new Date(dateParam));
      }
      
      // Set account ID
      const accountId = searchParams.get("accountId");
      // Set category ID
      const categoryId = searchParams.get("categoryId");
      if (categoryId) {
        setCategory(categoryId);
      }      if (accountId) {
        setSelectedAccount(accountId);
      }
    }
  }, [searchParams]);

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
  const [customIntervalDays, setCustomIntervalDays] = useState<number | undefined>(undefined);
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
        // Get the credits from the store
        const credits = useCreditStore.getState().credits;
        const selectedCredit = credits.find(c => c.id === selectedCreditId);
        
        // Only validate if we found the credit
        if (selectedCredit && !isFullSettlement && parseFloat(amount) > selectedCredit.currentBalance) {
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
    } else if (transactionType === "recurring") {
      // For recurring payments, we need to specify if it's an income or expense
      apiTransactionType = "recurring";
    }
    
    // For all transaction types, ensure direction is set
    // This makes the direction field consistent across all transaction types
    const transactionDirection = direction || 
      (apiTransactionType === "income" ? "received" : 
       apiTransactionType === "expense" ? "sent" : 
       apiTransactionType === "credit" ? (creditType === "lent" ? "sent" : "received") : 
       "sent"); // Default to sent for transfers

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
      recurringPaymentId: isRecurring && selectedRecurringPaymentId ? selectedRecurringPaymentId : undefined,
      customIntervalDays: isRecurring && recurringFrequency === 'custom' ? customIntervalDays : undefined,
      direction: transactionDirection, // Use the consistent direction value
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
        try {
          const savedTransaction = await addTransaction({
            id: `temp-${Date.now()}`,
            ...transactionData,
            type: transactionData.type as
              | "income"
              | "expense"
              | "transfer"
              | "credit"
              | "recurring",
            creditType: isCredit ? creditType : undefined,
            dueDate: isCredit ? creditDueDate?.toISOString() : undefined,
            isRepayment: isCredit ? isRepayment : undefined,
            creditId: isCredit && isRepayment ? selectedCreditId : undefined,
            isFullSettlement: isCredit && isRepayment ? isFullSettlement : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          
          console.log("Transaction saved successfully:", savedTransaction);
          
          // Navigate directly to the transaction detail page using the server-generated ID
          if (savedTransaction && savedTransaction.id) {
            // Add a small delay to ensure the store is updated
            toast({
              title: "Transaction Saved",
              description: message,
            });
            
            console.log("Navigating to transaction detail:", savedTransaction.id);
            
            // Use window.location for a full page refresh to ensure clean state
            window.location.href = `/transactions/${savedTransaction.id}`;
            return; // Exit early since we're redirecting
          }
        } catch (error) {
          console.error("Error saving transaction:", error);
          throw error; // Re-throw to be caught by the outer try-catch
        }
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
        message = `Added transaction for recurring payment "${recurringName}" of $${amount}`;
        
      // Update the next due date for the recurring payment if one was selected
      if (isRecurring && selectedRecurringPaymentId) {
        try {
          // Call the API to update the next due date
          const response = await fetch(`/api/recurring-payments/mark-complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recurringPaymentId: selectedRecurringPaymentId,
              transactionDate: date?.toISOString() || new Date().toISOString(),
            }),
          });
          
          if (!response.ok) {
            console.error("Failed to update recurring payment next due date");
          } else {
            message += " and updated next due date";
          }
        } catch (error) {
          console.error("Error updating next due date:", error);
        }
      }
      } else if (transactionType === "transfer") {
        message = `Transferred $${amount} between accounts`;
      }

      // We're already showing the toast and navigating in the code above
      // Only fall back to the transactions list page if we didn't redirect earlier
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
            selectedRecurringPaymentId={selectedRecurringPaymentId}
            setSelectedRecurringPaymentId={setSelectedRecurringPaymentId}
            onRecurringPaymentSelect={(payment) => {
              // Auto-fill form fields based on selected recurring payment
              if (payment) {
                setAmount((payment.defaultAmount || payment.amount || 0).toString());
                setRecurringFrequency(payment.frequency?.toLowerCase() || 'monthly');
                setCustomIntervalDays(payment.customIntervalDays || undefined);
                if (payment.accountId) setSelectedAccount(payment.accountId);
                if (payment.categoryId) setCategory(payment.categoryId);
                if (payment.description) setDescription(payment.description);
              }
            }}
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
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Recurring Payment Name</label>
                <Input
                  value={recurringName}
                  onChange={(e) => setRecurringName(e.target.value)}
                  placeholder="e.g., Netflix Subscription"
                  required={isRecurring}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <PaymentTypeSelector
                  value={recurringFrequency}
                  onChange={setRecurringFrequency}
                  options={getFrequencyOptions()}
                />
              </div>

              {recurringFrequency === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Interval (Days)</label>
                  <Input
                    type="number"
                    value={customIntervalDays || ''}
                    onChange={(e) => setCustomIntervalDays(parseInt(e.target.value) || undefined)}
                    placeholder="Enter number of days"
                    min="1"
                    required={recurringFrequency === 'custom'}
                  />
                </div>
              )}
            </>
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

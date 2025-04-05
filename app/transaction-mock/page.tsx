"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import AccountSelector from "@/components/account-selector";
import CategorySelector from "@/components/category-selector";
import TransactionFormFields from "@/components/transaction-form-fields";
import PaymentTypeSelector from "@/components/payment-type-selector";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card as CardUI, CardContent } from "@/components/ui/card";

// Mock data for existing credit transactions
const mockCreditTransactions = [
  {
    id: "credit-1",
    counterparty: "John",
    type: "lent",
    originalAmount: 500,
    currentBalance: 300,
    date: new Date(2025, 3, 1), // April 1, 2025
    description: "Lent for car repair"
  },
  {
    id: "credit-2",
    counterparty: "Sarah",
    type: "lent",
    originalAmount: 50,
    currentBalance: 50,
    date: new Date(2025, 2, 28), // March 28, 2025
    description: "Lunch money"
  },
  {
    id: "credit-3",
    counterparty: "Mike",
    type: "borrowed",
    originalAmount: 200,
    currentBalance: 100,
    date: new Date(2025, 2, 15), // March 15, 2025
    description: "Borrowed for concert tickets"
  }
];

export default function TransactionFormMock() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check URL parameters for transaction type
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  
  useEffect(() => {
    // Get URL parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
      
      // Set transfer mode if specified in URL
      if (params.get('type') === 'transfer') {
        setIsTransfer(true);
        setTransactionType('transfer');
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
  const [creditDueDate, setCreditDueDate] = useState<Date | undefined>(new Date());
  const [destinationAccount, setDestinationAccount] = useState("");
  
  // New fields for credit repayment
  const [isRepayment, setIsRepayment] = useState(false);
  const [selectedCreditId, setSelectedCreditId] = useState("");
  const [isFullSettlement, setIsFullSettlement] = useState(false);
  
  // Get selected transaction details
  const selectedTransaction = mockCreditTransactions.find(
    transaction => transaction.id === selectedCreditId
  );
  
  // Filter transactions based on credit type
  const filteredTransactions = mockCreditTransactions.filter(
    transaction => transaction.type === creditType
  );

  // Determine the actual transaction type for the API
  let apiTransactionType = transactionType;
  if (transactionType === "regular") {
    apiTransactionType = direction === "received" ? "income" : "expense";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on transaction type
    if (!selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please select an account",
        variant: "destructive"
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (transactionType === "recurring" && !recurringName) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the recurring payment",
        variant: "destructive"
      });
      return;
    }

    if (transactionType === "transfer" && (!selectedAccount || !destinationAccount)) {
      toast({
        title: "Missing Information",
        description: "Please select both source and destination accounts",
        variant: "destructive"
      });
      return;
    }
    
    if (transactionType === "transfer" && selectedAccount === destinationAccount) {
      toast({
        title: "Invalid Transfer",
        description: "Source and destination accounts cannot be the same",
        variant: "destructive"
      });
      return;
    }

    if ((transactionType === "regular" || transactionType === "credit") && !counterparty) {
      toast({
        title: "Missing Information",
        description: "Please enter a " + (transactionType === "credit" ? 
          (creditType === "lent" ? "recipient" : "lender") : 
          "counterparty"),
        variant: "destructive"
      });
      return;
    }

    if ((transactionType === "income" || transactionType === "expense") && !category) {
      toast({
        title: "Missing Information",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }
    
    // Validate credit repayment
    if (isCredit && isRepayment && !selectedCreditId) {
      toast({
        title: "Missing Information",
        description: "Please select an existing credit transaction",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create transaction object based on form data
      const transaction = {
        id: `temp-${Date.now()}`,
        accountId: selectedAccount,
        amount: parseFloat(amount),
        description,
        date: date || new Date(),
        type: isTransfer ? "transfer" : isCredit ? "credit" : isRecurring ? "recurring" : "regular",
        counterparty,
        appUsed,
        categoryId: category,
        recurring: isRecurring,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add type-specific fields
      if (isTransfer) {
        Object.assign(transaction, {
          toAccountId: destinationAccount,
        });
      } else if (isCredit) {
        Object.assign(transaction, {
          creditType,
          dueDate: creditDueDate?.toISOString(),
        });
        
        // Add repayment specific fields
        if (isRepayment) {
          Object.assign(transaction, {
            creditId: selectedCreditId,
            isFullSettlement,
          });
        }
      } else if (isRecurring) {
        Object.assign(transaction, {
          recurringName,
          recurringFrequency,
        });
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message
      if (isCredit && isRepayment) {
        const repaymentAmount = parseFloat(amount);
        const remainingBalance = selectedTransaction ? 
          selectedTransaction.currentBalance - repaymentAmount : 0;
        
        toast({
          title: "Success",
          description: `Repayment of $${amount} recorded. ${
            isFullSettlement ? 
              "Transaction fully settled." : 
              `Remaining balance: $${remainingBalance.toFixed(2)}`
          }`,
        });
      } else {
        toast({
          title: "Transaction Created",
          description: "Your transaction has been recorded successfully",
        });
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Transaction</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Account Selector */}
          <div className="space-y-2">
            <Label>Account</Label>
            <AccountSelector
              value={selectedAccount}
              onChange={setSelectedAccount}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-7"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  
                  // Auto-check full settlement if amount equals current balance
                  if (selectedTransaction && isRepayment && parseFloat(e.target.value) >= selectedTransaction.currentBalance) {
                    setIsFullSettlement(true);
                  } else if (isRepayment) {
                    setIsFullSettlement(false);
                  }
                }}
                min="0"
                step="0.01"
                required
              />
            </div>
            {isCredit && isRepayment && selectedTransaction && (
              <p className="text-xs text-muted-foreground">
                {parseFloat(amount) > selectedTransaction.currentBalance 
                  ? "Amount exceeds current balance. Excess will be recorded as overpayment."
                  : `Remaining after this payment: $${(selectedTransaction.currentBalance - (parseFloat(amount) || 0)).toFixed(2)}`
                }
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this transaction for?"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <CategorySelector value={category} onChange={setCategory} />
          </div>

          {/* Transaction Type Fields */}
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
          />

          {/* Credit Repayment Fields - Only show when credit is selected */}
          {isCredit && (
            <div className="space-y-4 border rounded-md p-4 bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isRepayment" 
                  checked={isRepayment}
                  onCheckedChange={(checked) => {
                    setIsRepayment(checked === true);
                    if (checked === false) {
                      setSelectedCreditId("");
                      setIsFullSettlement(false);
                    }
                  }}
                />
                <Label htmlFor="isRepayment" className="cursor-pointer">
                  This is a repayment for an existing credit
                </Label>
              </div>
              
              {/* Existing Transaction Selection (only for repayments) */}
              {isRepayment && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction">Select Existing Credit</Label>
                    <Select 
                      value={selectedCreditId} 
                      onValueChange={setSelectedCreditId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a transaction" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTransactions.length === 0 ? (
                          <SelectItem value="none" disabled>No transactions found</SelectItem>
                        ) : (
                          filteredTransactions.map(transaction => (
                            <SelectItem key={transaction.id} value={transaction.id}>
                              {transaction.counterparty} - ${transaction.originalAmount.toFixed(2)} 
                              ({format(transaction.date, "MMM d, yyyy")}) - 
                              ${transaction.currentBalance.toFixed(2)} remaining
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Transaction Details */}
                  {selectedTransaction && (
                    <CardUI className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Original Amount:</span>
                            <span>${selectedTransaction.originalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Current Balance:</span>
                            <span>${selectedTransaction.currentBalance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Date:</span>
                            <span>{format(selectedTransaction.date, "MMM d, yyyy")}</span>
                          </div>
                          {selectedTransaction.description && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Description:</span>
                              <span>{selectedTransaction.description}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CardUI>
                  )}
                  
                  {/* Full Settlement Checkbox */}
                  {selectedTransaction && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="settlement" 
                        checked={isFullSettlement}
                        onCheckedChange={(checked) => {
                          setIsFullSettlement(checked === true);
                          if (checked && selectedTransaction) {
                            setAmount(selectedTransaction.currentBalance.toString());
                          }
                        }}
                      />
                      <Label htmlFor="settlement" className="cursor-pointer">
                        Mark as fully settled
                      </Label>
                    </div>
                  )}
                </div>
              )}
              
              {/* Due Date (only for new credit transactions) */}
              {!isRepayment && (
                <div className="space-y-2">
                  <Label>Due Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !creditDueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {creditDueDate ? format(creditDueDate, "PPP") : "Select a due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={creditDueDate}
                        onSelect={setCreditDueDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          )}

          {/* Transfer Fields */}
          {isTransfer && (
            <div className="space-y-2">
              <Label>To Account</Label>
              <AccountSelector
                value={destinationAccount}
                onChange={setDestinationAccount}
                excludeId={selectedAccount}
                placeholder="Select destination account"
              />
            </div>
          )}

          {/* Recurring Fields */}
          {isRecurring && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recurringName">Recurring Payment Name</Label>
                <Input
                  id="recurringName"
                  value={recurringName}
                  onChange={(e) => setRecurringName(e.target.value)}
                  placeholder="e.g. Netflix Subscription"
                  required={isRecurring}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurringFrequency">Frequency</Label>
                <Select
                  value={recurringFrequency}
                  onValueChange={setRecurringFrequency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Transaction"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

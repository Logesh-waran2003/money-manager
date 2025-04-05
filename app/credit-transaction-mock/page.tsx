"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Mock data for accounts
const mockAccounts = [
  { id: "account-1", name: "Checking Account", type: "bank" },
  { id: "account-2", name: "Cash Wallet", type: "cash" },
  { id: "account-3", name: "Credit Card", type: "credit" }
];

export default function CreditTransactionMockPage() {
  const { toast } = useToast();
  
  // Form state
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [accountId, setAccountId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [counterparty, setCounterparty] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [isFullSettlement, setIsFullSettlement] = useState<boolean>(false);
  
  // Transaction type state
  const [transactionType, setTransactionType] = useState<"regular" | "credit" | "transfer">("credit");
  const [creditType, setCreditType] = useState<"lent" | "borrowed">("lent");
  const [isRepayment, setIsRepayment] = useState<boolean>(false);
  const [selectedCreditId, setSelectedCreditId] = useState<string>("");
  
  // Get selected transaction details
  const selectedTransaction = mockCreditTransactions.find(
    transaction => transaction.id === selectedCreditId
  );
  
  // Filter transactions based on credit type
  const filteredTransactions = mockCreditTransactions.filter(
    transaction => transaction.type === (creditType === "lent" ? "lent" : "borrowed")
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRepayment) {
      // Validate new credit transaction
      if (!amount || !counterparty || !accountId) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `New ${creditType} transaction created for $${amount}`,
      });
    } else {
      // Validate repayment transaction
      if (!selectedCreditId || !amount || !accountId) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
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
        <CardHeader>
          <CardTitle>Credit Transaction</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type Tabs */}
            <Tabs defaultValue="credit" className="w-full" onValueChange={(value) => setTransactionType(value as any)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="regular">Regular</TabsTrigger>
                <TabsTrigger value="credit">Credit</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Credit Type Selection */}
            <div className="space-y-2">
              <Label>Credit Type</Label>
              <div className="flex flex-col space-y-4">
                <RadioGroup 
                  value={creditType} 
                  onValueChange={(value) => {
                    setCreditType(value as "lent" | "borrowed");
                    setSelectedCreditId("");
                  }}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lent" id="lent" />
                    <Label htmlFor="lent" className="cursor-pointer">I Lent Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="borrowed" id="borrowed" />
                    <Label htmlFor="borrowed" className="cursor-pointer">I Borrowed Money</Label>
                  </div>
                </RadioGroup>
                
                <div className="flex items-center space-x-2 pt-2">
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
              </div>
            </div>
            
            {/* Existing Transaction Selection (only for repayments) */}
            {isRepayment && (
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
            )}
            
            {/* Transaction Details */}
            {selectedTransaction && isRepayment && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      {creditType === "lent" ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <span className="font-medium">
                            Lent to {selectedTransaction.counterparty}
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                          <span className="font-medium">
                            Borrowed from {selectedTransaction.counterparty}
                          </span>
                        </>
                      )}
                    </div>
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
              </Card>
            )}
            
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                {isRepayment ? "Repayment Amount" : "Amount"}
              </Label>
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
              {isRepayment && selectedTransaction && (
                <p className="text-xs text-muted-foreground">
                  {parseFloat(amount) > selectedTransaction.currentBalance 
                    ? "Amount exceeds current balance. Excess will be recorded as overpayment."
                    : `Remaining after this payment: $${(selectedTransaction.currentBalance - (parseFloat(amount) || 0)).toFixed(2)}`
                  }
                </p>
              )}
            </div>
            
            {/* Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {mockAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Counterparty (only for new transactions) */}
            {!isRepayment && (
              <div className="space-y-2">
                <Label htmlFor="counterparty">
                  {creditType === "lent" ? "Lent To" : "Borrowed From"}
                </Label>
                <Input
                  id="counterparty"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
            )}
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description"
              />
            </div>
            
            {/* Due Date (only for new transactions) */}
            {!isRepayment && (
              <div className="space-y-2">
                <Label>Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select a due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional details..."
              />
            </div>
            
            {/* Full Settlement Checkbox (only for repayments) */}
            {isRepayment && selectedTransaction && (
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
            
            {/* Submit Button */}
            <Button type="submit" className="w-full">
              {isRepayment 
                ? "Record Repayment" 
                : `Create ${creditType === "lent" ? "Lending" : "Borrowing"} Transaction`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

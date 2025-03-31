"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Home, ArrowLeft, CheckCircle2 } from "lucide-react";
import AccountSelector from "@/components/account-selector";
import TransactionFormFields from "@/components/transaction-form-fields";
import PaymentTypeSelector from "@/components/payment-type-selector";
import CategorySelector from "@/components/category-selector";
import { FormSection } from "@/components/form-section";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { CardGlow, GradientHeading, AnimatedButton, PageTransition } from "@/components/ui-enhancements";

export default function TransactionForm() {
  const { toast } = useToast();
  const { theme } = useTheme();
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on transaction type
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

    console.log({
      transactionType,
      selectedAccount,
      destinationAccount,
      amount,
      description,
      date,
      direction,
      appUsed,
      counterparty,
      recurringName,
      recurringFrequency,
      creditType,
      creditDueDate,
      category,
    });

    // Prepare appropriate message based on transaction type
    let message = "";
    if (transactionType === "regular") {
      message = `${direction === "received" ? "Received" : "Sent"} $${amount} ${
        direction === "received" ? "from" : "to"
      } ${counterparty}`;
    } else if (transactionType === "credit") {
      message = `${creditType === "lent" ? "Lent" : "Borrowed"} $${amount} ${
        creditType === "lent" ? "to" : "from"
      } ${counterparty}`;
    } else if (transactionType === "recurring") {
      message = `Added recurring payment "${recurringName}" of $${amount} (${recurringFrequency})`;
    } else if (transactionType === "transfer") {
      message = `Transferred $${amount} from ${selectedAccount} to ${destinationAccount}`;
    }

    toast({
      title: "Transaction Saved",
      description: message,
    });

    // Reset form (optional)
    setAmount("");
    setDescription("");
    setCounterparty("");
    setAppUsed("");
    setRecurringName("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center py-6 px-4">
        <div className="container max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <GradientHeading className="text-2xl">New Transaction</GradientHeading>
            </div>
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <CardGlow>
            <Card className="p-5 md:p-6 shadow-lg border-opacity-50 bg-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/30"></div>
              <form onSubmit={handleSubmit} className="space-y-4">
          {!isTransfer ? (
            <FormSection title="Account Details">
              <AccountSelector 
                selectedAccount={selectedAccount}
                onChange={setSelectedAccount}
                label="Account"
              />
            </FormSection>
          ) : (
            <FormSection title="Transfer Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </FormSection>
          )}

          <FormSection title="Transaction Details">
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
          </FormSection>

          {/* Transaction amount and date - common for all transaction types */}
          <FormSection title="Amount & Date">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
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
                        "w-full justify-start text-left font-normal bg-background/50 border-border/50",
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
          </FormSection>

          {/* Transaction type specific additional fields */}
          {isRecurring && (
            <FormSection title="Recurring Details">
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
            </FormSection>
          )}
          
          {isCredit && (
            <FormSection title="Credit Details">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-background/50 border-border/50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {creditDueDate ? (
                        format(creditDueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
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
            </FormSection>
          )}

          <FormSection title="Additional Information">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter transaction details..."
                className="resize-none bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                rows={2}
              />
            </div>

            <CategorySelector
              selectedCategory={category}
              onChange={setCategory}
            />
          </FormSection>

          <AnimatedButton type="submit" className="w-full mt-5 py-3 text-base font-medium">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save Transaction
          </AnimatedButton>
        </form>
      </Card>
    </CardGlow>
    </div>
  </div>
  </PageTransition>
  );
}

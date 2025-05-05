"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import PaymentTypeSelector from "./payment-type-selector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CreditCard, Repeat, DollarSign, ArrowRightLeft } from "lucide-react";
import CreditTransactionSelector from "@/components/credit-transaction-selector";
import RecurringPaymentSelector from "@/components/recurring-payment-selector";
import { CreditType, useCreditStore } from "@/lib/stores/credit-store";

// Payment apps list
const paymentApps = [
  { value: "paypal", label: "PayPal" },
  { value: "venmo", label: "Venmo" },
  { value: "cashapp", label: "Cash App" },
  { value: "zelle", label: "Zelle" },
  { value: "applepay", label: "Apple Pay" },
  { value: "googlepay", label: "Google Pay" },
  { value: "other", label: "Other" },
];

interface TransactionFormFieldsProps {
  direction: string;
  setDirection: (value: string) => void;
  counterparty: string;
  setCounterparty: (value: string) => void;
  appUsed: string;
  setAppUsed: (value: string) => void;
  transactionType: string;
  setTransactionType: (value: string) => void;
  creditType: CreditType;
  setCreditType: (value: string) => void;
  recurringName: string;
  setRecurringName: (value: string) => void;
  isCredit: boolean;
  setIsCredit: (value: boolean) => void;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  isTransfer?: boolean;
  setIsTransfer?: (value: boolean) => void;
  isRepayment?: boolean;
  setIsRepayment?: (value: boolean) => void;
  selectedCreditId?: string;
  setSelectedCreditId?: (value: string) => void;
  selectedRecurringPaymentId?: string;
  setSelectedRecurringPaymentId?: (value: string) => void;
  onRecurringPaymentSelect?: (payment: any) => void;
}

const TransactionFormFields: React.FC<TransactionFormFieldsProps> = ({
  direction,
  setDirection,
  counterparty,
  setCounterparty,
  appUsed,
  setAppUsed,
  transactionType,
  setTransactionType,
  creditType,
  setCreditType,
  recurringName,
  setRecurringName,
  isCredit,
  setIsCredit,
  isRecurring,
  setIsRecurring,
  isTransfer = false,
  setIsTransfer = () => {},
  isRepayment = false,
  setIsRepayment = () => {},
  selectedCreditId = "",
  setSelectedCreditId = () => {},
  selectedRecurringPaymentId = "",
  setSelectedRecurringPaymentId = () => {},
  onRecurringPaymentSelect = () => {},
}) => {
  // Prefetch credits when component mounts - only once
  useEffect(() => {
    // Prefetch credits for both lent and borrowed types
    const fetchCredits = async () => {
      try {
        await useCreditStore.getState().fetchCredits();
      } catch (error) {
        console.error("Error prefetching credits:", error);
      }
    };

    fetchCredits();
  }, []); // Empty dependency array ensures this runs only once

  // Handle transaction type selection based on toggles
  const handleCreditToggle = (checked: boolean) => {
    setIsCredit(checked);
    if (checked) {
      setTransactionType("credit");
      setIsRecurring(false);
      setIsTransfer(false);
    } else if (!isRecurring && !isTransfer) {
      setTransactionType("regular");
    }
  };

  const handleRecurringToggle = (checked: boolean) => {
    setIsRecurring(checked);
    if (checked) {
      setTransactionType("recurring");
      setIsCredit(false);
      setIsTransfer(false);
    } else if (!isCredit && !isTransfer) {
      setTransactionType("regular");
    }
  };

  const handleTransferToggle = (checked: boolean) => {
    setIsTransfer(checked);
    if (checked) {
      setTransactionType("transfer");
      setIsCredit(false);
      setIsRecurring(false);
    } else if (!isCredit && !isRecurring) {
      setTransactionType("regular");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Transaction Type</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 bg-background/50 p-2 rounded-md border border-border/50">
              <Switch
                id="credit-toggle"
                checked={isCredit}
                onCheckedChange={handleCreditToggle}
              />
              <Label
                htmlFor="credit-toggle"
                className="flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Credit/Loan</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 bg-background/50 p-2 rounded-md border border-border/50">
              <Switch
                id="recurring-toggle"
                checked={isRecurring}
                onCheckedChange={handleRecurringToggle}
              />
              <Label
                htmlFor="recurring-toggle"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Repeat className="h-4 w-4 text-primary" />
                <span>Recurring</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 bg-background/50 p-2 rounded-md border border-border/50">
              <Switch
                id="transfer-toggle"
                checked={isTransfer}
                onCheckedChange={handleTransferToggle}
              />
              <Label
                htmlFor="transfer-toggle"
                className="flex items-center gap-2 cursor-pointer"
              >
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                <span>Transfer</span>
              </Label>
            </div>
          </div>
        </div>

        {/* Recurring Payment Selector - Only show when recurring is selected */}
        {isRecurring && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Existing Recurring Payment
            </label>
            <RecurringPaymentSelector
              value={selectedRecurringPaymentId}
              onChange={setSelectedRecurringPaymentId}
              onRecurringPaymentSelect={(payment) => {
                // Auto-fill form fields based on selected recurring payment
                if (payment) {
                  setRecurringName(payment.name);
                  if (payment.counterparty)
                    setCounterparty(payment.counterparty);
                  // Pass complete payment object to parent component for additional field updates
                  const fullPayment = {
                    ...payment,
                    defaultAmount: payment.defaultAmount || payment.amount || 0,
                    frequency: payment.frequency?.toLowerCase() || "monthly",
                  };
                  onRecurringPaymentSelect(fullPayment);
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select an existing recurring payment or create a new one
            </p>
          </div>
        )}

        {!isTransfer && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isCredit
                ? creditType === "lent"
                  ? "Lent To"
                  : "Borrowed From"
                : direction === "sent"
                ? "Sent To"
                : "Received From"}
            </label>
            <Input
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder={
                isCredit
                  ? creditType === "lent"
                    ? "Enter recipient name..."
                    : "Enter lender name..."
                  : direction === "sent"
                  ? "Enter recipient..."
                  : "Enter sender..."
              }
              className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              required={!isTransfer}
            />
          </div>
        )}

        {isCredit && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Credit Type</label>
            <ToggleGroup
              type="single"
              value={creditType}
              onValueChange={setCreditType}
              className="justify-start"
            >
              <ToggleGroupItem
                value="lent"
                aria-label="Lent money"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                I Lent Money
              </ToggleGroupItem>
              <ToggleGroupItem
                value="borrowed"
                aria-label="Borrowed money"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                I Borrowed Money
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-muted-foreground mt-1">
              {creditType === "lent"
                ? "Select this if you lent money to someone and they need to pay you back."
                : "Select this if you borrowed money from someone and you need to pay them back."}
            </p>

            <div className="flex items-center space-x-2 mt-3">
              <Switch
                id="repayment-toggle"
                checked={isRepayment}
                onCheckedChange={(checked) => {
                  setIsRepayment(checked);
                  if (!checked) {
                    setSelectedCreditId("");
                  }
                }}
              />
              <Label htmlFor="repayment-toggle" className="cursor-pointer">
                This is a repayment for an existing credit
              </Label>
            </div>

            {isRepayment && (
              <div className="mt-3 space-y-2 p-3 border border-border/50 rounded-md bg-background/50">
                <label className="text-sm font-medium">
                  Select Existing Credit
                </label>
                <CreditTransactionSelector
                  value={selectedCreditId}
                  onChange={setSelectedCreditId}
                  creditType={creditType}
                  onBalanceChange={(balance) => {
                    // Optionally auto-set amount to current balance
                    // setAmount(balance.toString());
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select the original credit transaction that this payment is
                  for.
                </p>
              </div>
            )}
          </div>
        )}

        {!isCredit && !isTransfer && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Direction</label>
            <ToggleGroup
              type="single"
              value={direction}
              onValueChange={setDirection}
              className="justify-start"
            >
              <ToggleGroupItem
                value="sent"
                aria-label="Money sent"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Sent <DollarSign className="ml-1 h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="received"
                aria-label="Money received"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Received <DollarSign className="ml-1 h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {isRecurring && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Recurring Payment Name
            </label>
            <Input
              value={recurringName}
              onChange={(e) => setRecurringName(e.target.value)}
              placeholder="Netflix, Rent, Salary, etc."
              className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              required={isRecurring}
            />
          </div>
        )}

        {!isTransfer && (
          <div className="space-y-2">
            <label className="text-sm font-medium">App Used</label>
            <PaymentTypeSelector
              value={appUsed}
              onChange={setAppUsed}
              options={paymentApps}
              placeholder="Select payment app"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionFormFields;

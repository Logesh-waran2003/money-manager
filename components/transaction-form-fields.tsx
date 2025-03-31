"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import PaymentTypeSelector from "./payment-type-selector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CreditCard, Repeat, DollarSign, ArrowRightLeft } from "lucide-react";

// Payment apps list
const paymentApps = [
  { value: "paypal", label: "PayPal" },
  { value: "venmo", label: "Venmo" },
  { value: "cashapp", label: "Cash App" },
  { value: "zelle", label: "Zelle" },
  { value: "applepay", label: "Apple Pay" },
  { value: "googlepay", label: "Google Pay" },
  { value: "other", label: "Other" }
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
  creditType: string;
  setCreditType: (value: string) => void;
  recurringName: string;
  setRecurringName: (value: string) => void;
  isCredit: boolean;
  setIsCredit: (value: boolean) => void;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  isTransfer?: boolean;
  setIsTransfer?: (value: boolean) => void;
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
  setIsTransfer = () => {}
}) => {
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
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="text-sm font-medium mb-1">Transaction Type</div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Label htmlFor="credit-toggle" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-4 w-4" /> 
                <span>Credit/Loan</span>
              </Label>
              <Switch 
                id="credit-toggle" 
                checked={isCredit} 
                onCheckedChange={handleCreditToggle}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="recurring-toggle" className="flex items-center gap-2 cursor-pointer">
                <Repeat className="h-4 w-4" /> 
                <span>Recurring</span>
              </Label>
              <Switch 
                id="recurring-toggle" 
                checked={isRecurring} 
                onCheckedChange={handleRecurringToggle}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="transfer-toggle" className="flex items-center gap-2 cursor-pointer">
                <ArrowRightLeft className="h-4 w-4" /> 
                <span>Transfer</span>
              </Label>
              <Switch 
                id="transfer-toggle" 
                checked={isTransfer} 
                onCheckedChange={handleTransferToggle}
              />
            </div>
          </div>
        </div>

        {!isTransfer && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isCredit ? 
                (creditType === "lent" ? "Lent To" : "Borrowed From") : 
                (direction === "sent" ? "Sent To" : "Received From")
              }
            </label>
            <Input
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder={
                isCredit ? 
                  (creditType === "lent" ? "Enter recipient name..." : "Enter lender name...") : 
                  (direction === "sent" ? "Enter recipient..." : "Enter sender...")
              }
              required={!isTransfer}
            />
          </div>
        )}

        {isCredit && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Credit Type</label>
            <ToggleGroup type="single" value={creditType} onValueChange={setCreditType} className="justify-start">
              <ToggleGroupItem value="lent" aria-label="Lent money">
                I Lent Money
              </ToggleGroupItem>
              <ToggleGroupItem value="borrowed" aria-label="Borrowed money">
                I Borrowed Money
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {!isCredit && !isTransfer && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Direction</label>
            <ToggleGroup type="single" value={direction} onValueChange={setDirection} className="justify-start">
              <ToggleGroupItem value="sent" aria-label="Money sent">
                Sent <DollarSign className="ml-1 h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="received" aria-label="Money received">
                Received <DollarSign className="ml-1 h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {isRecurring && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recurring Payment Name</label>
            <Input
              value={recurringName}
              onChange={(e) => setRecurringName(e.target.value)}
              placeholder="Netflix, Rent, Salary, etc."
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

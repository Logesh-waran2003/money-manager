"use client";

import React, { useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { useRecurringPaymentStore } from "@/lib/stores/recurring-payment-store";

interface RecurringPaymentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onPaymentSelected?: (payment: any) => void;
  onRecurringPaymentSelect?: (payment: any) => void;
}

const RecurringPaymentSelector: React.FC<RecurringPaymentSelectorProps> = ({ 
  value, 
  onChange,
  onPaymentSelected,
  onRecurringPaymentSelect
}) => {
  const { recurringPayments, fetchRecurringPayments, isLoading } = useRecurringPaymentStore();
  
  // Fetch recurring payments when component mounts
  useEffect(() => {
    fetchRecurringPayments();
  }, [fetchRecurringPayments]);
  
  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
    
    if (selectedValue) {
      const selectedPayment = recurringPayments.find(p => p.id === selectedValue);
      if (selectedPayment) {
        // Support both callback prop names for backward compatibility
        if (onPaymentSelected) {
          onPaymentSelected(selectedPayment);
        }
        if (onRecurringPaymentSelect) {
          onRecurringPaymentSelect(selectedPayment);
        }
      }
    }
  };
  
  return (
    <Select value={value} onValueChange={handleChange} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder="Select a recurring payment" />
      </SelectTrigger>
      <SelectContent>
        {recurringPayments.filter(p => p.isActive).map((payment) => (
          <SelectItem key={payment.id} value={payment.id}>
            <div className="flex flex-col">
              <span>{payment.name}</span>
              <span className="text-xs text-muted-foreground">
                ${payment.defaultAmount ? payment.defaultAmount.toFixed(2) : (payment.amount ? payment.amount.toFixed(2) : '0.00')} • Due: {format(new Date(payment.nextDueDate), "MMM d, yyyy")}
              </span>
            </div>
          </SelectItem>
        ))}
        {recurringPayments.length === 0 && !isLoading && (
          <div className="p-2 text-sm text-muted-foreground">
            No recurring payments found
          </div>
        )}
        {isLoading && (
          <div className="p-2 text-sm text-muted-foreground">
            Loading...
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default RecurringPaymentSelector;

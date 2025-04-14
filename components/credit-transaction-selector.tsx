"use client";

import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCreditTransactions } from '@/hooks/use-credit-transactions';
import { CreditType } from '@/lib/stores/credit-store';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreditTransactionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  creditType: CreditType;
  onBalanceChange?: (balance: number) => void;
}

export default function CreditTransactionSelector({
  value,
  onChange,
  creditType,
  onBalanceChange
}: CreditTransactionSelectorProps) {
  const { credits, isLoading, error } = useCreditTransactions(creditType);
  
  // Filter out fully settled credits
  const activeCredits = credits.filter(credit => !credit.isSettled);
  
  // When a credit is selected, notify parent of the current balance
  useEffect(() => {
    if (value && onBalanceChange) {
      const selectedCredit = credits.find(credit => credit.id === value);
      if (selectedCredit) {
        onBalanceChange(selectedCredit.currentBalance);
      }
    }
  }, [value, credits, onBalanceChange]);
  
  // Get the selected credit details
  const selectedCredit = credits.find(credit => credit.id === value);
  
  // Validate repayment amount doesn't exceed balance
  const validateRepaymentAmount = (amount: number) => {
    if (!selectedCredit) return true;
    return amount <= selectedCredit.currentBalance;
  };
  
  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a transaction" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="text-destructive p-2">Failed to load transactions</div>
          ) : activeCredits.length === 0 ? (
            <SelectItem value="none" disabled>No active credits found</SelectItem>
          ) : (
            activeCredits.map(credit => (
              <SelectItem key={credit.id} value={credit.id}>
                {credit.counterparty} - ${credit.amount.toFixed(2)} 
                ({format(new Date(credit.date), "MMM d, yyyy")}) - 
                ${credit.currentBalance.toFixed(2)} remaining
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {/* Show selected credit details */}
      {selectedCredit && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Original Amount:</span>
              <span>${selectedCredit.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Current Balance:</span>
              <span className="font-semibold">${selectedCredit.currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Date:</span>
              <span>{format(new Date(selectedCredit.date), "MMM d, yyyy")}</span>
            </div>
            {selectedCredit.dueDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Due Date:</span>
                <div className="flex items-center gap-2">
                  <span>{format(new Date(selectedCredit.dueDate), "MMM d, yyyy")}</span>
                  {selectedCredit.isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  )}
                  {selectedCredit.daysUntilDue !== null && selectedCredit.daysUntilDue > 0 && selectedCredit.daysUntilDue <= 7 && (
                    <Badge variant="outline" className="text-xs">
                      Due soon
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {selectedCredit.description && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Description:</span>
                <span className="text-right">{selectedCredit.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Repaid So Far:</span>
              <span>${selectedCredit.totalRepaid.toFixed(2)}</span>
            </div>
            
            {/* Show repayment history if any */}
            {selectedCredit.repayments && selectedCredit.repayments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="text-sm font-medium">Repayment History:</span>
                <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                  {selectedCredit.repayments.map((repayment, index) => (
                    <div key={index} className="text-xs flex justify-between">
                      <span>{format(new Date(repayment.date), "MMM d, yyyy")}</span>
                      <span>${repayment.amount.toFixed(2)}</span>
                      {repayment.isFullSettlement && (
                        <Badge variant="secondary" className="text-xs">Final</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Warning for overdue credits */}
            {selectedCredit.isOverdue && (
              <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>This credit is {Math.abs(selectedCredit.daysUntilDue || 0)} days overdue</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

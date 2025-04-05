import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCreditTransactions } from '@/hooks/use-credit-transactions';
import { CreditType } from '@/lib/stores/credit-store';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

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
              <span>${selectedCredit.currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Date:</span>
              <span>{format(new Date(selectedCredit.date), "MMM d, yyyy")}</span>
            </div>
            {selectedCredit.dueDate && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Due Date:</span>
                <span>{format(new Date(selectedCredit.dueDate), "MMM d, yyyy")}</span>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

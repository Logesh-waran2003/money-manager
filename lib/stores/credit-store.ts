import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define credit transaction types
export type CreditType = 'lent' | 'borrowed';

// Define credit transaction interface
export interface CreditTransaction {
  id: string;
  amount: number;
  currentBalance: number;
  description: string;
  date: string;
  counterparty: string;
  creditType: CreditType;
  dueDate?: string;
  isSettled: boolean;
  totalRepaid: number;
  repayments: CreditRepayment[];
  daysUntilDue?: number | null;
  isOverdue?: boolean;
}

// Define credit repayment interface
export interface CreditRepayment {
  id: string;
  amount: number;
  date: string;
  isFullSettlement: boolean;
  accountName?: string;
}

// Define credit store state
interface CreditState {
  credits: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCredits: (type?: CreditType) => Promise<void>;
  addRepayment: (repaymentData: {
    creditId: string;
    accountId: string;
    amount: number;
    date: string;
    description?: string;
    isFullSettlement: boolean;
    categoryId?: string;
  }) => Promise<void>;
  validateRepaymentAmount: (creditId: string, amount: number) => boolean;
}

// Create credit store
export const useCreditStore = create<CreditState>()(
  devtools(
    (set, get) => ({
      credits: [],
      isLoading: false,
      error: null,
      
      // Fetch all credit transactions
      fetchCredits: async (type?: CreditType) => {
        set({ isLoading: true, error: null });
        try {
          const url = type ? `/api/credits?type=${type}` : '/api/credits';
          const response = await fetch(url);
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch credits');
          }
          
          const credits = await response.json();
          set({ credits, isLoading: false });
        } catch (error) {
          console.error('Error fetching credits:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch credits', 
            isLoading: false 
          });
        }
      },
      
      // Add a repayment to a credit transaction
      addRepayment: async (repaymentData) => {
        set({ isLoading: true, error: null });
        try {
          // Validate repayment amount
          const isValid = get().validateRepaymentAmount(
            repaymentData.creditId, 
            repaymentData.amount
          );
          
          if (!isValid && !repaymentData.isFullSettlement) {
            throw new Error('Repayment amount exceeds remaining balance');
          }
          
          const response = await fetch('/api/credits/repay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(repaymentData),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to record repayment');
          }
          
          const { repayment, originalCredit } = await response.json();
          
          // Update the credits list with the updated credit transaction
          set((state) => ({
            credits: state.credits.map((credit) => 
              credit.id === originalCredit.id ? originalCredit : credit
            ),
            isLoading: false,
          }));
          
          return repayment;
        } catch (error) {
          console.error('Error recording repayment:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to record repayment', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Validate that repayment amount doesn't exceed remaining balance
      validateRepaymentAmount: (creditId: string, amount: number) => {
        const credit = get().credits.find(c => c.id === creditId);
        if (!credit) return false;
        return amount <= credit.currentBalance;
      },
    }),
    { name: 'credit-store' }
  )
);

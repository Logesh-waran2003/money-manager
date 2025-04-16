import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'credit' | 'recurring';

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  amount: number;
  date: string;
  description?: string;
  counterparty?: string;
  type: TransactionType;
  appUsed?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Credit specific fields
  creditType?: 'lent' | 'borrowed';
  dueDate?: string;
  isRepayment?: boolean;
  isFullSettlement?: boolean;
  creditId?: string;
  // Direction field for transaction flow
  direction?: string;
}

interface TransactionFilters {
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
}

interface TransactionStore {
  transactions: Transaction[];
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  filteredTransactions: Transaction[];
  
  // Actions
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (filters: TransactionFilters) => void;
}

// Sample transaction data for development
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    accountId: 'account1',
    amount: 1200,
    date: '2025-04-01',
    description: 'Salary',
    counterparty: 'Employer Inc.',
    type: 'income',
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: '2',
    accountId: 'account1',
    amount: 85.75,
    date: '2025-04-02',
    description: 'Grocery shopping',
    counterparty: 'Whole Foods',
    type: 'expense',
    categoryId: 'category1',
    createdAt: '2025-04-02T14:30:00Z',
    updatedAt: '2025-04-02T14:30:00Z',
  },
  {
    id: '3',
    accountId: 'account1',
    toAccountId: 'account2',
    amount: 500,
    date: '2025-04-03',
    description: 'Transfer to savings',
    type: 'transfer',
    createdAt: '2025-04-03T09:15:00Z',
    updatedAt: '2025-04-03T09:15:00Z',
  },
  {
    id: '4',
    accountId: 'account2',
    amount: 42.99,
    date: '2025-04-03',
    description: 'Monthly subscription',
    counterparty: 'Netflix',
    type: 'expense',
    categoryId: 'category2',
    createdAt: '2025-04-03T18:20:00Z',
    updatedAt: '2025-04-03T18:20:00Z',
  },
  {
    id: '5',
    accountId: 'account3',
    amount: 120,
    date: '2025-04-04',
    description: 'Freelance work',
    counterparty: 'Client XYZ',
    type: 'income',
    createdAt: '2025-04-04T11:45:00Z',
    updatedAt: '2025-04-04T11:45:00Z',
  }
];

export const useTransactionStore = create<TransactionStore>()(
  devtools(
    persist(
      (set, get) => ({
        transactions: sampleTransactions,
        filters: {},
        isLoading: false,
        error: null,

        get filteredTransactions() {
          const { transactions, filters } = get();
          
          return transactions.filter(transaction => {
            // Search query filter
            if (filters.searchQuery && !transaction.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
                !transaction.counterparty?.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
              return false;
            }
            
            // Date range filter
            if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
              return false;
            }
            if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
              return false;
            }
            
            // Account filter
            if (filters.accountId && transaction.accountId !== filters.accountId) {
              return false;
            }
            
            // Category filter
            if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
              return false;
            }
            
            // Type filter
            if (filters.type && transaction.type !== filters.type) {
              return false;
            }
            
            return true;
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },

        fetchTransactions: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/transactions');
            
            if (!response.ok) {
              throw new Error('Failed to fetch transactions');
            }
            
            const data = await response.json();
            set({ transactions: data, isLoading: false });
          } catch (error) {
            console.error('Error fetching transactions:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch transactions', 
              isLoading: false 
            });
          }
        },

        addTransaction: async (transaction) => {
          try {
            // First add to local store optimistically
            set((state) => ({
              transactions: [...state.transactions, transaction],
            }));
            
            let response;
            
            // Route credit transactions to the credits API
            if (transaction.type === 'credit' && !transaction.isRepayment) {
              console.log('Sending credit transaction to /api/credits');
              response = await fetch('/api/credits', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
              });
            } else if (transaction.type === 'credit' && transaction.isRepayment) {
              console.log('Sending credit repayment to /api/credits/repay');
              response = await fetch('/api/credits/repay', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
              });
            } else {
              // Regular transactions go to the transactions API
              console.log('Sending regular transaction to /api/transactions');
              response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
              });
            }
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to save transaction');
            }
            
            // Get the saved transaction with server-generated ID
            const savedTransaction = await response.json();
            
            // For credit transactions, the response includes both credit and transaction
            const actualTransaction = savedTransaction.transaction || savedTransaction;
            
            // Replace the optimistic transaction with the saved one
            set((state) => ({
              transactions: state.transactions.map((t) => 
                t.id === transaction.id ? actualTransaction : t
              ),
            }));
            
            return actualTransaction;
          } catch (error) {
            console.error('Error saving transaction:', error);
            // If there was an error, remove the optimistic transaction
            set((state) => ({
              transactions: state.transactions.filter((t) => t.id !== transaction.id),
              error: error instanceof Error ? error.message : 'Failed to save transaction',
            }));
            throw error; // Re-throw the error so the form can handle it
          }
        },

        updateTransaction: (id, data) => {
          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === id ? { ...transaction, ...data } : transaction
            ),
          }));
        },

        deleteTransaction: (id) => {
          set((state) => ({
            transactions: state.transactions.filter((transaction) => transaction.id !== id),
          }));
        },

        setFilters: (filters) => {
          set({ filters });
        },
      }),
      {
        name: 'transaction-store',
      }
    )
  )
);

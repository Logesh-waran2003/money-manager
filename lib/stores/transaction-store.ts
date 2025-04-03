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
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (filters: TransactionFilters) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  devtools(
    persist(
      (set, get) => ({
        transactions: [],
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
            // In a real app, this would be an API call
            // const response = await fetch('/api/transactions');
            // const data = await response.json();
            // set({ transactions: data, isLoading: false });
            
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Keep the existing transactions
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch transactions', 
              isLoading: false 
            });
          }
        },

        addTransaction: (transaction) => {
          set((state) => ({
            transactions: [...state.transactions, transaction],
          }));
        },

        updateTransaction: (id, data) => {
          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === id
                ? { ...transaction, ...data, updatedAt: new Date().toISOString() }
                : transaction
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

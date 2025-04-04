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
  addTransaction: (transaction: Transaction) => Promise<Transaction>;
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
            
            // Then try to save to the API
            const response = await fetch('/api/transactions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(transaction),
            });
            
            if (!response.ok) {
              throw new Error('Failed to save transaction');
            }
            
            // Get the saved transaction with server-generated ID
            const savedTransaction = await response.json();
            
            // Replace the optimistic transaction with the saved one
            set((state) => ({
              transactions: state.transactions.map((t) => 
                t.id === transaction.id ? savedTransaction : t
              ),
            }));
            
            return savedTransaction;
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

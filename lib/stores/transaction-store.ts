import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'credit' | 'recurring';

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  description?: string;
  date: string;
  type: TransactionType;
  categoryId?: string;
  counterparty?: string;
  appUsed?: string;
  notes?: string;
  
  // For transfers
  toAccountId?: string;
  
  // For recurring transactions
  recurringPaymentId?: string;
  
  // For credit transactions
  creditId?: string;
  
  createdAt: string;
  updatedAt: string;
}

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType | TransactionType[];
  accountId?: string;
  categoryId?: string;
  searchQuery?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface TransactionState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  selectedTransactionId: string | null;
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  selectTransaction: (id: string | null) => void;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionStore = create<TransactionState>()(
  devtools(
    persist(
      (set, get) => ({
        transactions: [],
        filteredTransactions: [],
        selectedTransactionId: null,
        filters: {},
        isLoading: false,
        error: null,
        
        setTransactions: (transactions) => 
          set({ 
            transactions,
            filteredTransactions: transactions 
          }),
        
        addTransaction: (transaction) => 
          set((state) => {
            const newTransactions = [...state.transactions, transaction];
            return { 
              transactions: newTransactions,
              filteredTransactions: get().applyFilters(),
            };
          }),
        
        updateTransaction: (id, data) => 
          set((state) => {
            const newTransactions = state.transactions.map((transaction) => 
              transaction.id === id ? { ...transaction, ...data } : transaction
            );
            return {
              transactions: newTransactions,
              filteredTransactions: get().applyFilters(),
            };
          }),
        
        deleteTransaction: (id) => 
          set((state) => {
            const newTransactions = state.transactions.filter((transaction) => transaction.id !== id);
            return {
              transactions: newTransactions,
              filteredTransactions: get().applyFilters(),
              selectedTransactionId: state.selectedTransactionId === id ? null : state.selectedTransactionId
            };
          }),
        
        selectTransaction: (id) => set({ selectedTransactionId: id }),
        
        setFilters: (filters) => 
          set((state) => ({
            filters: { ...state.filters, ...filters },
            filteredTransactions: get().applyFilters(),
          })),
        
        clearFilters: () => 
          set((state) => ({
            filters: {},
            filteredTransactions: state.transactions,
          })),
        
        applyFilters: () => {
          const { transactions, filters } = get();
          
          let filtered = [...transactions];
          
          // Apply date filters
          if (filters.startDate) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate!));
          }
          
          if (filters.endDate) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate!));
          }
          
          // Apply type filter
          if (filters.type) {
            if (Array.isArray(filters.type)) {
              filtered = filtered.filter(t => filters.type!.includes(t.type));
            } else {
              filtered = filtered.filter(t => t.type === filters.type);
            }
          }
          
          // Apply account filter
          if (filters.accountId) {
            filtered = filtered.filter(t => 
              t.accountId === filters.accountId || t.toAccountId === filters.accountId
            );
          }
          
          // Apply category filter
          if (filters.categoryId) {
            filtered = filtered.filter(t => t.categoryId === filters.categoryId);
          }
          
          // Apply amount filters
          if (filters.minAmount !== undefined) {
            filtered = filtered.filter(t => t.amount >= filters.minAmount!);
          }
          
          if (filters.maxAmount !== undefined) {
            filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
          }
          
          // Apply search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
              t.description?.toLowerCase().includes(query) || 
              t.counterparty?.toLowerCase().includes(query) ||
              t.notes?.toLowerCase().includes(query)
            );
          }
          
          // Sort by date (newest first)
          filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          set({ filteredTransactions: filtered });
          return filtered;
        },
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error })
      }),
      {
        name: 'transaction-store',
        partialize: (state) => ({ 
          transactions: state.transactions,
          selectedTransactionId: state.selectedTransactionId,
          filters: state.filters
        }),
      }
    )
  )
);

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type AccountType = 'debit' | 'credit' | 'bank' | 'cash' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isDefault: boolean;
  accountNumber?: string;
  institution?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountState {
  accounts: Account[];
  selectedAccountId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  selectAccount: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAccountStore = create<AccountState>()(
  devtools(
    persist(
      (set) => ({
        accounts: [],
        selectedAccountId: null,
        isLoading: false,
        error: null,
        
        setAccounts: (accounts) => set({ accounts }),
        
        addAccount: (account) => 
          set((state) => ({ 
            accounts: [...state.accounts, account],
            // If this is the first account, select it
            selectedAccountId: state.accounts.length === 0 ? account.id : state.selectedAccountId
          })),
        
        updateAccount: (id, data) => 
          set((state) => ({
            accounts: state.accounts.map((account) => 
              account.id === id ? { ...account, ...data } : account
            )
          })),
        
        deleteAccount: (id) => 
          set((state) => ({
            accounts: state.accounts.filter((account) => account.id !== id),
            // If the deleted account was selected, select the first account or null
            selectedAccountId: state.selectedAccountId === id 
              ? state.accounts.length > 1 
                ? state.accounts.find(a => a.id !== id)?.id ?? null 
                : null 
              : state.selectedAccountId
          })),
        
        selectAccount: (id) => set({ selectedAccountId: id }),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error })
      }),
      {
        name: 'account-store',
        // Only persist these fields
        partialize: (state) => ({ 
          accounts: state.accounts,
          selectedAccountId: state.selectedAccountId
        }),
      }
    )
  )
);

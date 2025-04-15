import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type AccountType = 'bank' | 'credit' | 'cash' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  accountNumber?: string;
  institution?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountStore {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
}

export const useAccountStore = create<AccountStore>()(
  devtools(
    persist(
      (set, get) => ({
        accounts: [],
        isLoading: false,
        error: null,

        fetchAccounts: async () => {
          set({ isLoading: true, error: null });
          try {
            // Make API call to fetch accounts
            const token = localStorage.getItem('token') || '';
            const response = await fetch('/api/accounts', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to fetch accounts');
            }
            
            const data = await response.json();
            set({ accounts: data, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch accounts', 
              isLoading: false 
            });
          }
        },

        addAccount: (account) => {
          set((state) => ({
            accounts: [...state.accounts, account],
          }));
        },

        updateAccount: (id, data) => {
          set((state) => ({
            accounts: state.accounts.map((account) =>
              account.id === id
                ? { ...account, ...data, updatedAt: new Date().toISOString() }
                : account
            ),
          }));
        },

        deleteAccount: (id) => {
          set((state) => ({
            accounts: state.accounts.filter((account) => account.id !== id),
          }));
        },

        setDefaultAccount: (id) => {
          set((state) => ({
            accounts: state.accounts.map((account) => ({
              ...account,
              isDefault: account.id === id,
              updatedAt: account.id === id ? new Date().toISOString() : account.updatedAt,
            })),
          }));
        },
      }),
      {
        name: 'account-store',
      }
    )
  )
);

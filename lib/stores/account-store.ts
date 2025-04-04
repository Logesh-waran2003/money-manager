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
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountStore {
  accounts: Account[];
  allAccounts: Account[]; // Store all accounts separately
  showInactive: boolean; // Track the toggle state in the store
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  toggleInactiveAccounts: () => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
}

// Sample account data for development
const sampleAccounts: Account[] = [
  {
    id: 'account1',
    name: 'Checking Account',
    type: 'bank',
    balance: 2500,
    currency: 'USD',
    institution: 'Bank of America',
    isDefault: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'account2',
    name: 'Savings Account',
    type: 'bank',
    balance: 10000,
    currency: 'USD',
    institution: 'Bank of America',
    isDefault: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'account3',
    name: 'Credit Card',
    type: 'credit',
    balance: 450,
    currency: 'USD',
    institution: 'Chase',
    isDefault: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }
];

// Create the store
export const useAccountStore = create<AccountStore>()(
  devtools(
    persist(
      (set, get) => ({
        accounts: sampleAccounts,
        allAccounts: sampleAccounts,
        showInactive: false,
        isLoading: false,
        error: null,

        fetchAccounts: async () => {
          set({ isLoading: true, error: null });
          try {
            // Make API call to fetch all accounts including inactive
            const token = localStorage.getItem('token') || '';
            const response = await fetch('/api/accounts?includeInactive=true', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to fetch accounts');
            }
            
            const data = await response.json();
            
            // Store all accounts
            set({ 
              allAccounts: data,
              // Filter accounts based on current toggle state
              accounts: get().showInactive ? data : data.filter((account: Account) => account.isActive !== false),
              isLoading: false 
            });
          } catch (error) {
            console.error("Error in fetchAccounts:", error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch accounts', 
              isLoading: false 
            });
          }
        },

        toggleInactiveAccounts: () => {
          const currentState = get().showInactive;
          const newState = !currentState;
          
          console.log("Toggling inactive accounts:", { currentState, newState });
          
          // Update the toggle state
          set((state) => {
            const filteredAccounts = newState 
              ? state.allAccounts 
              : state.allAccounts.filter(account => account.isActive !== false);
              
            console.log("Filtered accounts count:", filteredAccounts.length);
            
            return {
              showInactive: newState,
              accounts: filteredAccounts
            };
          });
        },

        addAccount: (account) => {
          set((state) => {
            const updatedAllAccounts = [...state.allAccounts, account];
            return {
              allAccounts: updatedAllAccounts,
              accounts: state.showInactive 
                ? updatedAllAccounts 
                : updatedAllAccounts.filter(acc => acc.isActive !== false),
            };
          });
        },

        updateAccount: (id, data) => {
          set((state) => {
            const updatedAllAccounts = state.allAccounts.map((account) =>
              account.id === id
                ? { ...account, ...data, updatedAt: new Date().toISOString() }
                : account
            );
            
            return {
              allAccounts: updatedAllAccounts,
              accounts: state.showInactive 
                ? updatedAllAccounts 
                : updatedAllAccounts.filter(acc => acc.isActive !== false),
            };
          });
        },

        deleteAccount: (id) => {
          set((state) => {
            // Mark the account as inactive instead of removing it
            const updatedAllAccounts = state.allAccounts.map(account => 
              account.id === id 
                ? { ...account, isActive: false, updatedAt: new Date().toISOString() } 
                : account
            );
            
            return {
              allAccounts: updatedAllAccounts,
              accounts: state.showInactive 
                ? updatedAllAccounts 
                : updatedAllAccounts.filter(acc => acc.isActive !== false),
            };
          });
        },

        setDefaultAccount: (id) => {
          set((state) => {
            const updatedAllAccounts = state.allAccounts.map((account) => ({
              ...account,
              isDefault: account.id === id,
              updatedAt: account.id === id ? new Date().toISOString() : account.updatedAt,
            }));
            
            return {
              allAccounts: updatedAllAccounts,
              accounts: state.showInactive 
                ? updatedAllAccounts 
                : updatedAllAccounts.filter(acc => acc.isActive !== false),
            };
          });
        },
      }),
      {
        name: 'account-store',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        partialize: (state) => ({
          showInactive: state.showInactive,
        }),
      }
    )
  )
);

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type AccountType = "bank" | "credit" | "cash" | "investment";

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
  creditLimit?: number;
  dueDate?: string;
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

// Create the store
export const useAccountStore = create<AccountStore>()(
  devtools(
    persist(
      (set, get) => ({
        accounts: [], // Start with empty, not sampleAccounts
        allAccounts: [],
        showInactive: false,
        isLoading: false,
        error: null,

        fetchAccounts: async () => {
          set({ isLoading: true, error: null });
          try {
            // Import dynamically to avoid circular dependency
            const { useAuthStore } = await import("@/lib/stores/useAuthStore");
            // Get token from auth store instead of directly from localStorage
            const { token } = useAuthStore.getState();
            
            console.log("Fetching accounts with token:", token ? "Token exists" : "No token");
            
            if (!token) {
              console.log("No authentication token available");
              set({ 
                isLoading: false,
                error: "Authentication required"
              });
              return;
            }
            
            const response = await fetch("/api/accounts?includeInactive=true", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to fetch accounts");
            }

            const data = await response.json();

            // Store all accounts
            set({
              allAccounts: data,
              // Filter accounts based on current toggle state
              accounts: get().showInactive
                ? data
                : data.filter((account: Account) => account.isActive !== false),
              isLoading: false,
            });
          } catch (error) {
            console.error("Error in fetchAccounts:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch accounts",
              isLoading: false,
            });
          }
        },

        toggleInactiveAccounts: () => {
          const currentState = get().showInactive;
          const newState = !currentState;

          console.log("Toggling inactive accounts:", {
            currentState,
            newState,
          });

          // Update the toggle state
          set((state) => {
            const filteredAccounts = newState
              ? state.allAccounts
              : state.allAccounts.filter(
                  (account) => account.isActive !== false
                );

            console.log("Filtered accounts count:", filteredAccounts.length);

            return {
              showInactive: newState,
              accounts: filteredAccounts,
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
                : updatedAllAccounts.filter((acc) => acc.isActive !== false),
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
                : updatedAllAccounts.filter((acc) => acc.isActive !== false),
            };
          });
        },

        deleteAccount: (id) => {
          set((state) => {
            // Mark the account as inactive instead of removing it
            const updatedAllAccounts = state.allAccounts.map((account) =>
              account.id === id
                ? {
                    ...account,
                    isActive: false,
                    updatedAt: new Date().toISOString(),
                  }
                : account
            );

            return {
              allAccounts: updatedAllAccounts,
              accounts: state.showInactive
                ? updatedAllAccounts
                : updatedAllAccounts.filter((acc) => acc.isActive !== false),
            };
          });
        },

        setDefaultAccount: (id) => {
          set((state) => {
            const updatedAllAccounts = state.allAccounts.map((account) => ({
              ...account,
              isDefault: account.id === id,
              updatedAt:
                account.id === id
                  ? new Date().toISOString()
                  : account.updatedAt,
            }));

            return {
              allAccounts: updatedAllAccounts,
              accounts: state.showInactive
                ? updatedAllAccounts
                : updatedAllAccounts.filter((acc) => acc.isActive !== false),
            };
          });
        },
      }),
      {
        name: "account-store",
        storage: {
          getItem: (name) => {
            const str =
              typeof window !== "undefined"
                ? window.localStorage.getItem(name)
                : null;
            if (str) return JSON.parse(str);
            return null;
          },
          setItem: (name, value) => {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(name, JSON.stringify(value));
            }
          },
          removeItem: (name) => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(name);
            }
          },
        },
        // Only persist showInactive, not accounts data
        partialize: (state) => ({
          accounts: [],
          allAccounts: [],
          showInactive: state.showInactive,
          isLoading: false,
          error: null,
          fetchAccounts: async () => {},
          toggleInactiveAccounts: () => {},
          addAccount: () => {},
          updateAccount: () => {},
          deleteAccount: () => {},
          setDefaultAccount: () => {},
        }),
      }
    )
  )
);

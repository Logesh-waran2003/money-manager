# TanStack Query Integration Guide

## Overview

This document outlines how to integrate TanStack Query (formerly React Query) with our Zustand stores to manage server state in the Money Manager application. TanStack Query will handle data fetching, caching, and synchronization with the server, while Zustand will continue to manage local UI state.

## Benefits of TanStack Query

- Automatic caching and background refetching
- Loading and error states management
- Pagination and infinite scrolling support
- Optimistic updates for better UX
- Automatic retry on failure
- Deduplicated requests

## Installation

```bash
npm install @tanstack/react-query
# or
pnpm add @tanstack/react-query
```

## Setup

### 1. Create Query Client Provider

Create a new file at `/lib/query-client.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

### 2. Add Provider to Layout

Update your root layout to include the QueryProvider:

```tsx
// app/layout.tsx
import { QueryProvider } from '@/lib/query-client';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

## API Service Layer

Create a service layer to handle API calls:

### 1. Create API Services

Create a new directory `/lib/services` with files for each entity:

**Account Service (`/lib/services/account-service.ts`):**

```typescript
import { Account } from '@/lib/stores/account-store';

export const accountService = {
  getAccounts: async (): Promise<Account[]> => {
    const response = await fetch('/api/accounts');
    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }
    return response.json();
  },

  getAccount: async (id: string): Promise<Account> => {
    const response = await fetch(`/api/accounts/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch account');
    }
    return response.json();
  },

  createAccount: async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> => {
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    if (!response.ok) {
      throw new Error('Failed to create account');
    }
    return response.json();
  },

  updateAccount: async (id: string, data: Partial<Account>): Promise<Account> => {
    const response = await fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update account');
    }
    return response.json();
  },

  deleteAccount: async (id: string): Promise<void> => {
    const response = await fetch(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete account');
    }
  },
};
```

Create similar service files for transactions and categories.

## Custom Hooks with TanStack Query

Create custom hooks that use TanStack Query to fetch data:

### 1. Account Hooks

Create a new file `/hooks/use-accounts.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/lib/services/account-service';
import { Account } from '@/lib/stores/account-store';

// Query keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters: any) => [...accountKeys.lists(), { filters }] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};

// Hooks
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: accountService.getAccounts,
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountService.getAccount(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: accountService.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) => 
      accountService.updateAccount(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(data.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: accountService.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}
```

Create similar hook files for transactions and categories.

## Integrating with Zustand Stores

Update your Zustand stores to use TanStack Query:

### 1. Updated Account Store

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Account } from '@/types';

interface AccountStore {
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  
  // UI state only - data fetching is now handled by TanStack Query
  isAccountFormOpen: boolean;
  openAccountForm: () => void;
  closeAccountForm: () => void;
}

export const useAccountStore = create<AccountStore>()(
  devtools(
    (set) => ({
      selectedAccountId: null,
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),
      
      isAccountFormOpen: false,
      openAccountForm: () => set({ isAccountFormOpen: true }),
      closeAccountForm: () => set({ isAccountFormOpen: false }),
    }),
    {
      name: 'account-store',
    }
  )
);
```

## Using in Components

Here's how to use TanStack Query hooks in your components:

### Account List Component

```tsx
import { useAccounts, useDeleteAccount } from '@/hooks/use-accounts';
import { useAccountStore } from '@/lib/stores/account-store';

export function AccountList() {
  const { data: accounts, isLoading, error } = useAccounts();
  const { mutate: deleteAccount } = useDeleteAccount();
  const setSelectedAccountId = useAccountStore((state) => state.setSelectedAccountId);
  
  if (isLoading) return <div>Loading accounts...</div>;
  if (error) return <div>Error loading accounts</div>;
  
  return (
    <div>
      <h2>Accounts</h2>
      <ul>
        {accounts?.map((account) => (
          <li key={account.id}>
            <span>{account.name}: {account.balance}</span>
            <button onClick={() => setSelectedAccountId(account.id)}>View</button>
            <button onClick={() => deleteAccount(account.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Account Form Component

```tsx
import { useCreateAccount, useUpdateAccount, useAccount } from '@/hooks/use-accounts';
import { useAccountStore } from '@/lib/stores/account-store';
import { useState } from 'react';

export function AccountForm() {
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId);
  const closeAccountForm = useAccountStore((state) => state.closeAccountForm);
  
  const { data: selectedAccount } = useAccount(selectedAccountId || '');
  const { mutate: createAccount, isLoading: isCreating } = useCreateAccount();
  const { mutate: updateAccount, isLoading: isUpdating } = useUpdateAccount();
  
  const [formData, setFormData] = useState({
    name: selectedAccount?.name || '',
    type: selectedAccount?.type || 'bank',
    balance: selectedAccount?.balance || 0,
    // other fields
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedAccountId) {
      updateAccount({ id: selectedAccountId, data: formData });
    } else {
      createAccount(formData);
    }
    
    closeAccountForm();
  };
  
  // Form JSX
}
```

## Optimistic Updates

For better UX, implement optimistic updates:

```typescript
export function useCreateAccountOptimistic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: accountService.createAccount,
    onMutate: async (newAccount) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: accountKeys.lists() });
      
      // Snapshot the previous value
      const previousAccounts = queryClient.getQueryData(accountKeys.lists());
      
      // Optimistically update to the new value
      queryClient.setQueryData(accountKeys.lists(), (old: Account[] = []) => {
        const optimisticAccount = {
          ...newAccount,
          id: 'temp-id-' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, optimisticAccount];
      });
      
      // Return context with the previous value
      return { previousAccounts };
    },
    onError: (err, newAccount, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(accountKeys.lists(), context?.previousAccounts);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}
```

## Next Steps

1. Create service files for all entities (accounts, transactions, categories)
2. Create custom hooks with TanStack Query for each entity
3. Update Zustand stores to focus on UI state only
4. Refactor components to use the new hooks
5. Implement optimistic updates for better UX

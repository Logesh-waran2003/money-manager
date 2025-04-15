import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from './useAuthStore';

// Types
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'credit' | 'debit' | 'cash';
  balance: number;
  currency: string;
  isDefault: boolean;
  creditLimit?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// API functions
const fetchAccounts = async (): Promise<Account[]> => {
  const response = await fetchWithAuth('/api/accounts');
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return response.json();
};

const fetchAccount = async (id: string): Promise<Account> => {
  const response = await fetchWithAuth(`/api/accounts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch account');
  }
  return response.json();
};

const createAccount = async (account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
  creditLimit?: number;
  dueDate?: Date;
}): Promise<Account> => {
  const response = await fetchWithAuth('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
  });
  if (!response.ok) {
    throw new Error('Failed to create account');
  }
  return response.json();
};

const updateAccount = async ({ id, ...data }: Partial<Account> & { id: string }): Promise<Account> => {
  const response = await fetchWithAuth(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update account');
  }
  return response.json();
};

const deleteAccount = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`/api/accounts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete account');
  }
};

// Hooks
export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });
};

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => fetchAccount(id),
    enabled: !!id,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', data.id] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

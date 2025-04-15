import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from './useAuthStore';

// Types
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'transfer' | 'credit';
  creditType?: 'borrowed' | 'payment';
  toAccountId?: string;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

// API functions
const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await fetchWithAuth('/api/transactions');
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

const fetchTransaction = async (id: string): Promise<Transaction> => {
  const response = await fetchWithAuth(`/api/transactions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transaction');
  }
  return response.json();
};

const createTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
  const response = await fetchWithAuth('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) {
    throw new Error('Failed to create transaction');
  }
  return response.json();
};

const updateTransaction = async ({ id, ...data }: Partial<Transaction> & { id: string }): Promise<Transaction> => {
  const response = await fetchWithAuth(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update transaction');
  }
  return response.json();
};

const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete transaction');
  }
};

// Hooks
export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => fetchTransaction(id),
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', data.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

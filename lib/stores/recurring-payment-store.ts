import { create } from 'zustand';
import { calculateNextDueDate } from '../utils/recurring-payment-utils';

interface RecurringPayment {
  id: string;
  name: string;
  defaultAmount: number; // Changed from amount to defaultAmount to match schema
  amount?: number; // For UI consistency
  frequency: string;
  customIntervalDays?: number;
  startDate: Date;
  endDate?: Date | null;
  nextDueDate: Date;
  accountId: string;
  accountName?: string;
  categoryId?: string;
  categoryName?: string;
  counterparty?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RecurringPaymentStore {
  recurringPayments: RecurringPayment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRecurringPayments: () => Promise<void>;
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RecurringPayment>;
  updateRecurringPayment: (id: string, data: Partial<RecurringPayment>) => Promise<RecurringPayment>;
  deleteRecurringPayment: (id: string) => Promise<void>;
  markPaymentComplete: (id: string, transactionDate: Date) => Promise<void>;
  togglePaymentActive: (id: string, isActive: boolean) => Promise<void>;
}

export const useRecurringPaymentStore = create<RecurringPaymentStore>((set, get) => ({
  recurringPayments: [],
  isLoading: false,
  error: null,
  
  fetchRecurringPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/recurring-payments');
      if (!response.ok) {
        throw new Error(`Failed to fetch recurring payments: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform data to ensure UI consistency by adding amount property
      const transformedData = data.map((payment: any) => ({
        ...payment,
        amount: payment.defaultAmount // Add amount property that matches defaultAmount
      }));
      
      set({ 
        recurringPayments: transformedData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching recurring payments:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch recurring payments',
        isLoading: false 
      });
    }
  },
  
  addRecurringPayment: async (payment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/recurring-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add recurring payment: ${response.statusText}`);
      }
      
      const newPayment = await response.json();
      
      set(state => ({ 
        recurringPayments: [...state.recurringPayments, newPayment],
        isLoading: false 
      }));
      
      return newPayment;
    } catch (error) {
      console.error('Error adding recurring payment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add recurring payment',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateRecurringPayment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/recurring-payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update recurring payment: ${response.statusText}`);
      }
      
      const updatedPayment = await response.json();
      
      set(state => ({
        recurringPayments: state.recurringPayments.map(p => 
          p.id === id ? updatedPayment : p
        ),
        isLoading: false
      }));
      
      return updatedPayment;
    } catch (error) {
      console.error('Error updating recurring payment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update recurring payment',
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteRecurringPayment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/recurring-payments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete recurring payment: ${response.statusText}`);
      }
      
      set(state => ({
        recurringPayments: state.recurringPayments.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting recurring payment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete recurring payment',
        isLoading: false 
      });
      throw error;
    }
  },
  
  markPaymentComplete: async (id, transactionDate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/recurring-payments/mark-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recurringPaymentId: id,
          transactionDate: transactionDate.toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to mark payment as complete: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update the payment in the store with the new next due date
      set(state => ({
        recurringPayments: state.recurringPayments.map(p => 
          p.id === id ? { ...p, nextDueDate: new Date(data.payment.nextDueDate) } : p
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error marking payment as complete:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark payment as complete',
        isLoading: false 
      });
      throw error;
    }
  },
  
  togglePaymentActive: async (id, isActive) => {
    try {
      await get().updateRecurringPayment(id, { isActive });
    } catch (error) {
      console.error('Error toggling payment active status:', error);
      throw error;
    }
  }
}));

/**
 * Utility functions for recurring payments
 */

/**
 * Get frequency options for dropdowns
 */
export function getFrequencyOptions() {
  return [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
  ];
}

/**
 * Calculate the next due date based on frequency and current date
 */
export function calculateNextDueDate(
  frequency: string,
  currentDate: Date,
  customIntervalDays?: number
): Date {
  const nextDate = new Date(currentDate);
  
  switch (frequency.toLowerCase()) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'custom':
      if (customIntervalDays) {
        nextDate.setDate(nextDate.getDate() + customIntervalDays);
      }
      break;
  }
  
  return nextDate;
}

/**
 * Get upcoming recurring payments within a specified number of days
 */
export function getUpcomingRecurringPayments(payments: any[], days: number = 7): any[] {
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + days);
  
  return payments
    .filter(payment => {
      const dueDate = new Date(payment.nextDueDate);
      return payment.isActive && dueDate >= today && dueDate <= endDate;
    })
    .sort((a, b) => 
      new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
    );
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: string, customIntervalDays?: number): string {
  if (frequency.toLowerCase() === 'custom' && customIntervalDays) {
    return `Every ${customIntervalDays} days`;
  }
  return frequency;
}

/**
 * Check if a recurring payment is overdue
 */
export function isPaymentOverdue(nextDueDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextDueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

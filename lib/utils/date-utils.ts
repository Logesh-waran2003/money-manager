/**
 * Calculates the next due date based on frequency and current date
 * @param frequency The frequency type (daily, weekly, monthly, quarterly, yearly, custom)
 * @param currentDate The current due date
 * @param customDays Optional number of days for custom frequency
 * @returns The next due date
 */
export function calculateNextDueDate(
  frequency: string,
  currentDate: Date,
  customDays?: number
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
      if (customDays && customDays > 0) {
        nextDate.setDate(nextDate.getDate() + customDays);
      } else {
        // Default to monthly if custom days is invalid
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    default:
      // Default to monthly for unknown frequency
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
}

/**
 * Gets a human-readable string for the frequency
 * @param frequency The frequency type
 * @param customDays Optional number of days for custom frequency
 * @returns A human-readable frequency string
 */
export function getFrequencyLabel(frequency: string, customDays?: number): string {
  switch (frequency.toLowerCase()) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    case 'custom':
      return customDays ? `Every ${customDays} days` : 'Custom';
    default:
      return frequency;
  }
}

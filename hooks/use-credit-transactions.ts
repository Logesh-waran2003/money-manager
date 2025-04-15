import { useEffect, useState } from 'react';
import { useCreditStore, CreditType, CreditTransaction } from '@/lib/stores/credit-store';

export function useCreditTransactions(type?: CreditType) {
  const { credits, isLoading, error, fetchCredits } = useCreditStore();
  const [filteredCredits, setFilteredCredits] = useState<CreditTransaction[]>([]);
  
  // Fetch credits on component mount - only once
  useEffect(() => {
    // We don't need to call fetchCredits on every render or type change
    // The parent component should handle fetching when needed
  }, []); // Empty dependency array ensures this runs only once
  
  // Filter credits by type if specified
  useEffect(() => {
    if (type) {
      setFilteredCredits(credits.filter(credit => credit.creditType === type));
    } else {
      setFilteredCredits(credits);
    }
  }, [credits, type]);
  
  // Calculate days until due for each credit
  const creditsWithDueInfo = filteredCredits.map(credit => {
    let daysUntilDue = null;
    let isOverdue = false;
    
    if (credit.dueDate) {
      const dueDate = new Date(credit.dueDate);
      const today = new Date();
      
      // Reset time part for accurate day calculation
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = daysUntilDue < 0;
    }
    
    return {
      ...credit,
      daysUntilDue,
      isOverdue
    };
  });
  
  return {
    credits: creditsWithDueInfo,
    isLoading,
    error,
    refetch: () => fetchCredits(type)
  };
}

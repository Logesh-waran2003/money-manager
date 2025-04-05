import { useEffect, useState } from 'react';
import { useCreditStore, CreditType, CreditTransaction } from '@/lib/stores/credit-store';

export function useCreditTransactions(type?: CreditType) {
  const { credits, isLoading, error, fetchCredits } = useCreditStore();
  const [filteredCredits, setFilteredCredits] = useState<CreditTransaction[]>([]);
  
  // Fetch credits on component mount
  useEffect(() => {
    fetchCredits(type);
  }, [fetchCredits, type]);
  
  // Filter credits by type if specified
  useEffect(() => {
    if (type) {
      setFilteredCredits(credits.filter(credit => credit.creditType === type));
    } else {
      setFilteredCredits(credits);
    }
  }, [credits, type]);
  
  return {
    credits: filteredCredits,
    isLoading,
    error,
    refetch: () => fetchCredits(type)
  };
}

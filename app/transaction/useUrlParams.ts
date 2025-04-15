  // Get URL parameters and prefetch credits
  useEffect(() => {
    // Get URL parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);

      // Set transfer mode if specified in URL
      if (params.get("type") === "transfer") {
        setIsTransfer(true);
        setTransactionType("transfer");
      }
    }
    
    // Prefetch credits for both lent and borrowed types
    const fetchCredits = async () => {
      try {
        await useCreditStore.getState().fetchCredits();
      } catch (error) {
        console.error("Error prefetching credits:", error);
      }
    };
    
    fetchCredits();
  }, []);

  // Apply URL parameters to form fields
  useEffect(() => {
    if (searchParams) {
      // Set transaction type
      const type = searchParams.get("type");
      if (type === "credit") {
        setIsCredit(true);
        setTransactionType("credit");
      } else if (type === "transfer") {
        setIsTransfer(true);
        setTransactionType("transfer");
      }
      
      // Set credit type
      const creditTypeParam = searchParams.get("creditType");
      if (creditTypeParam === "lent" || creditTypeParam === "borrowed") {
        setCreditType(creditTypeParam);
      }
      
      // Set repayment flag
      const isRepaymentParam = searchParams.get("isRepayment");
      if (isRepaymentParam === "true") {
        setIsRepayment(true);
      }
      
      // Set credit ID for repayment
      const creditId = searchParams.get("creditId");
      if (creditId) {
        setSelectedCreditId(creditId);
      }
      
      // Set counterparty
      const counterpartyParam = searchParams.get("counterparty");
      if (counterpartyParam) {
        setCounterparty(counterpartyParam);
      }
      
      // Set amount
      const amountParam = searchParams.get("amount");
      if (amountParam) {
        setAmount(amountParam);
      }
      
      // Set description
      const descriptionParam = searchParams.get("description");
      if (descriptionParam) {
        setDescription(descriptionParam);
      }
      
      // Set date
      const dateParam = searchParams.get("date");
      if (dateParam) {
        setDate(new Date(dateParam));
      }
      
      // Set account ID
      const accountId = searchParams.get("accountId");
      if (accountId) {
        setSelectedAccount(accountId);
      }
    }
  }, [searchParams]);

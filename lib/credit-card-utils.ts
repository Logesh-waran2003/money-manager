import { PrismaClient } from '@prisma/client';

/**
 * Handle a credit card purchase transaction
 * 
 * @param transaction The transaction data
 * @param prisma Prisma client instance
 * @returns The created transaction
 */
export const handleCreditCardPurchase = async (
  transaction: any,
  prisma: PrismaClient
) => {
  // For a credit card purchase:
  // 1. Create the transaction as an expense with creditType = 'borrowed'
  // 2. Update the credit card balance (increase the balance/debt)
  
  const creditCard = await prisma.account.findUnique({
    where: { id: transaction.accountId },
  });
  
  if (!creditCard || creditCard.type !== 'credit') {
    throw new Error('Invalid credit card account');
  }
  
  // Create the transaction
  const newTransaction = await prisma.transaction.create({
    data: {
      ...transaction,
      type: 'credit',
      creditType: 'borrowed',
    },
    include: {
      account: true,
      category: true,
    },
  });
  
  // Update credit card balance (increase debt)
  await prisma.account.update({
    where: { id: transaction.accountId },
    data: { balance: { increment: transaction.amount } },
  });
  
  return newTransaction;
};

/**
 * Handle a credit card payment transaction
 * 
 * @param transaction The transaction data
 * @param prisma Prisma client instance
 * @returns The created transaction
 */
export const handleCreditCardPayment = async (
  transaction: any,
  prisma: PrismaClient
) => {
  // For a credit card payment:
  // 1. Create a transfer transaction from bank account to credit card
  // 2. Update the bank account balance (decrease)
  // 3. Update the credit card balance (decrease debt)
  
  const bankAccount = await prisma.account.findUnique({
    where: { id: transaction.accountId },
  });
  
  const creditCard = await prisma.account.findUnique({
    where: { id: transaction.toAccountId },
  });
  
  if (!bankAccount || bankAccount.type === 'credit') {
    throw new Error('Invalid bank account');
  }
  
  if (!creditCard || creditCard.type !== 'credit') {
    throw new Error('Invalid credit card account');
  }
  
  // Create the transaction
  const newTransaction = await prisma.transaction.create({
    data: {
      ...transaction,
      type: 'transfer',
    },
    include: {
      account: true,
      toAccount: true,
    },
  });
  
  // Update bank account balance
  await prisma.account.update({
    where: { id: transaction.accountId },
    data: { balance: { decrement: transaction.amount } },
  });
  
  // Update credit card balance (reduce debt)
  await prisma.account.update({
    where: { id: transaction.toAccountId },
    data: { balance: { decrement: transaction.amount } },
  });
  
  return newTransaction;
};

/**
 * Calculate interest for a credit card
 * 
 * @param accountId The credit card account ID
 * @param date The date to calculate interest for
 * @param prisma Prisma client instance
 * @returns The created interest transaction
 */
export const calculateCreditCardInterest = async (
  accountId: string,
  date: Date,
  prisma: PrismaClient
) => {
  const creditCard = await prisma.account.findUnique({
    where: { id: accountId },
  });
  
  if (!creditCard || creditCard.type !== 'credit' || !creditCard.interestRate) {
    throw new Error('Invalid credit card account or missing interest rate');
  }
  
  // Calculate interest amount (simple calculation - can be made more complex)
  const interestAmount = (creditCard.balance * (creditCard.interestRate / 100)) / 12;
  
  if (interestAmount <= 0) {
    return null; // No interest to charge
  }
  
  // Create interest transaction
  const interestTransaction = await prisma.transaction.create({
    data: {
      amount: interestAmount,
      date,
      description: 'Interest charge',
      type: 'credit',
      creditType: 'borrowed',
      accountId,
      userId: creditCard.userId,
    },
  });
  
  // Update credit card balance
  await prisma.account.update({
    where: { id: accountId },
    data: { balance: { increment: interestAmount } },
  });
  
  return interestTransaction;
};

/**
 * Get available credit for a credit card
 * 
 * @param accountId The credit card account ID
 * @param prisma Prisma client instance
 * @returns The available credit amount
 */
export const getAvailableCredit = async (
  accountId: string,
  prisma: PrismaClient
) => {
  const creditCard = await prisma.account.findUnique({
    where: { id: accountId },
  });
  
  if (!creditCard || creditCard.type !== 'credit' || !creditCard.creditLimit) {
    throw new Error('Invalid credit card account or missing credit limit');
  }
  
  return creditCard.creditLimit - creditCard.balance;
};

/**
 * Get credit utilization percentage for a credit card
 * 
 * @param accountId The credit card account ID
 * @param prisma Prisma client instance
 * @returns The credit utilization percentage
 */
export const getCreditUtilization = async (
  accountId: string,
  prisma: PrismaClient
) => {
  const creditCard = await prisma.account.findUnique({
    where: { id: accountId },
  });
  
  if (!creditCard || creditCard.type !== 'credit' || !creditCard.creditLimit) {
    throw new Error('Invalid credit card account or missing credit limit');
  }
  
  return (creditCard.balance / creditCard.creditLimit) * 100;
};

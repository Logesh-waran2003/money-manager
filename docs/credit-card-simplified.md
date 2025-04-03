# Simplified Credit Card Implementation Plan - Phase 1

## Core Credit Card Features

This document outlines the essential credit card features to implement in Phase 1, focusing only on the most basic functionality. Advanced features like interest charges and statement cycle tracking will be implemented in a future phase.

## Phase 1: Basic Credit Card Functionality

### 1. Credit Card Purchases

**Implementation:**
```typescript
// Record a credit card purchase
const purchase = await prisma.transaction.create({
  data: {
    userId: session.user.id,
    accountId: creditCardId,
    amount: purchaseAmount,
    description: merchantName,
    date: purchaseDate,
    type: "expense",
    categoryId: categoryId,
    counterparty: merchantName,
  },
});

// Update credit card balance (increase debt)
await prisma.account.update({
  where: { id: creditCardId },
  data: { balance: { increment: purchaseAmount } },
});
```

### 2. Credit Card Payments

**Implementation:**
```typescript
// Record a credit card payment
const payment = await prisma.transaction.create({
  data: {
    userId: session.user.id,
    accountId: sourceAccountId,  // Bank account
    toAccountId: creditCardId,   // Credit card account
    amount: paymentAmount,
    description: `Payment to ${creditCardName}`,
    date: paymentDate,
    type: "transfer",
    counterparty: creditCardInstitution,
  },
});

// Update source account balance (decrease)
await prisma.account.update({
  where: { id: sourceAccountId },
  data: { balance: { decrement: paymentAmount } },
});

// Update credit card balance (decrease debt)
await prisma.account.update({
  where: { id: creditCardId },
  data: { balance: { decrement: paymentAmount } },
});
```

### 3. Basic UI Components

#### Credit Card Account Form
- Fields for account name, institution, and credit limit
- Simple balance tracking

#### Credit Card Dashboard Widget
- Shows current balance and available credit
- Basic visualization of credit usage

#### Credit Card Transaction Form
- Enhanced transaction form that handles credit card purchases
- Special form for recording payments between accounts

## Implementation Steps

1. Update transaction API to handle credit card transactions
2. Create UI components for basic credit card management
3. Implement credit card balance tracking

## Future Phases (Not Included in Phase 1)

The following features are planned for future phases and are NOT part of the initial implementation:

1. **Interest Charges**
   - Recording and calculating interest
   - Categorizing interest as a special expense type

2. **Statement Cycle Tracking**
   - Tracking statement dates
   - Managing due dates and minimum payments
   - Generating statements

3. **Advanced Credit Card Features**
   - Payment reminders
   - Interest calculation
   - Credit utilization tracking
   - Statement history

Note: While the database schema includes fields for these future features (creditLimit, dueDate, interestRate, minimumPayment, statementDate), we will not be implementing the logic for them in Phase 1.

# Credit Card Transaction Design

## Overview

This document outlines the design and implementation plan for handling credit card transactions in the Money Manager application. Credit cards require special handling because they represent both a transaction and a change to a debt balance.

## Credit Card Account Model

The existing Account model already includes credit card specific fields:

```typescript
// Credit-specific fields in Account model
creditLimit: Float?
dueDate: DateTime?
interestRate: Float?
minimumPayment: Float?
statementDate: DateTime?
```

## Credit Card Transaction Types

We need to handle several types of credit card transactions:

### 1. Credit Card Purchases

When a user makes a purchase with a credit card:

- It should be recorded as an expense transaction
- It should increase the credit card balance (debt)
- The transaction should be linked to the credit card account

Implementation:
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

When a user makes a payment to a credit card:

- It should be recorded as a transfer transaction
- It should decrease the source account balance
- It should decrease the credit card balance (reduce debt)
- The transaction should link both accounts

Implementation:
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

### 3. Interest Charges

When interest is charged to a credit card:

- It should be recorded as an expense transaction
- It should increase the credit card balance (debt)
- It should be categorized as "Interest" or "Fees"

Implementation:
```typescript
// Record interest charge
const interestCharge = await prisma.transaction.create({
  data: {
    userId: session.user.id,
    accountId: creditCardId,
    amount: interestAmount,
    description: "Interest charge",
    date: chargeDate,
    type: "expense",
    categoryId: interestCategoryId,
    counterparty: creditCardInstitution,
  },
});

// Update credit card balance (increase debt)
await prisma.account.update({
  where: { id: creditCardId },
  data: { balance: { increment: interestAmount } },
});
```

## Credit Card Balance Tracking

For credit cards, we need to track:

1. **Current Balance**: The total amount owed on the card
2. **Available Credit**: The credit limit minus the current balance
3. **Statement Balance**: The balance as of the last statement date
4. **Minimum Payment**: The minimum amount due for the current period
5. **Payment Due Date**: When the minimum payment is due

## UI Components for Credit Cards

### Credit Card Account Detail View

- Display credit limit and available credit as a progress bar
- Show payment due date with countdown if approaching
- Display minimum payment amount
- Show statement balance vs. current balance
- Provide quick action to make a payment

### Credit Card Transaction Form

Extend the unified transaction form to handle credit card specific fields:

- When selecting a credit card as the account:
  - For expenses: Show standard expense fields
  - For payments: Show transfer fields with credit card as destination

### Credit Card Statement View

- List all transactions within a statement period
- Show opening and closing balance
- Display interest charges
- Show minimum payment and due date
- Provide option to pay statement balance

## Interest Calculation

For accurate financial tracking, we should implement interest calculation:

1. **Simple Interest Calculation**:
   ```
   Interest = (Balance * Annual Interest Rate / 365) * Days
   ```

2. **Compound Interest Calculation** (more accurate):
   ```
   Interest = Balance * ((1 + (Annual Interest Rate / 365)) ^ Days - 1)
   ```

## Implementation Plan

1. **Update Transaction API**:
   - Enhance transaction creation to handle credit card specific logic
   - Implement proper balance updates for different transaction types

2. **Create Credit Card UI Components**:
   - Design and implement credit card account detail view
   - Extend transaction form for credit card payments
   - Create credit card statement view

3. **Implement Interest Calculation**:
   - Create a scheduled job to calculate and apply interest charges
   - Allow manual interest charge recording

4. **Add Payment Reminders**:
   - Implement notification system for upcoming due dates
   - Display payment reminders on dashboard

## Data Model Updates

No additional schema changes are needed as the current models support credit card functionality. The existing fields in the Account and Transaction models are sufficient for implementing the credit card features described above.

## Next Steps

1. Implement the credit card purchase and payment transaction handlers
2. Create the UI components for credit card management
3. Implement interest calculation logic
4. Add payment reminder functionality

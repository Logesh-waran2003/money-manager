# Recurring Payments Transaction Integration

This document outlines how recurring payments are integrated with the transaction form in the Money Manager application.

## Overview

The transaction form has been enhanced to support recurring payments in two ways:

1. Creating transactions linked to existing recurring payments
2. Automatically updating the next due date for recurring payments when transactions are created

## Transaction Form Integration

### UI Components

The transaction form now includes:

- A toggle for marking a transaction as recurring
- A selector for choosing an existing recurring payment
- Auto-filling of transaction details based on the selected recurring payment
- Support for custom interval days for custom frequency recurring payments

### Workflow

1. User toggles the "Recurring" switch in the transaction form
2. User can select an existing recurring payment from the dropdown
3. Form fields are auto-populated with the recurring payment details:
   - Amount
   - Account
   - Category
   - Counterparty
   - Description
   - Frequency
4. User can modify any of these fields if needed
5. When the transaction is saved:
   - It is linked to the recurring payment via `recurringPaymentId`
   - The next due date of the recurring payment is automatically updated

## API Integration

When a transaction is created with a `recurringPaymentId`:

1. The transaction is saved with a reference to the recurring payment
2. The API automatically calculates the next due date based on the frequency:
   - Daily: +1 day
   - Weekly: +7 days
   - Monthly: +1 month
   - Quarterly: +3 months
   - Yearly: +1 year
   - Custom: +X days (where X is the custom interval)
3. The recurring payment's `nextDueDate` field is updated

## Utility Functions

The following utility functions have been implemented to support recurring payments:

- `calculateNextDueDate`: Calculates the next due date based on frequency and current date
- `getFrequencyLabel`: Returns a human-readable label for a frequency
- `validateRecurringPayment`: Validates recurring payment data
- `getFrequencyOptions`: Returns the available frequency options
- `updateNextDueDate`: Updates the next due date for a recurring payment via API call
- `fetchRecurringPayments`: Fetches recurring payments from the API

## Data Flow

1. User selects a recurring payment in the transaction form
2. Transaction details are auto-filled
3. User submits the transaction
4. Transaction is saved with a reference to the recurring payment
5. API calculates the next due date and updates the recurring payment
6. User receives confirmation that the transaction was saved and the next due date was updated

## Future Enhancements

- Add ability to create a new recurring payment directly from the transaction form
- Implement batch processing for recurring payments that are due
- Add notifications for upcoming recurring payments
- Provide analytics on recurring payment history and patterns

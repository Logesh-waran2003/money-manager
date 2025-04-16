# Recurring Payments Implementation

This document outlines the implementation details of the recurring payments feature in the Money Manager application.

## Overview

The recurring payments feature allows users to:
- Create and manage recurring payments (bills, subscriptions, etc.)
- Track upcoming payment due dates
- Mark recurring payments as completed
- View payment history
- Integrate recurring payments with the transaction form

## Frontend Components

### 1. Recurring Payments Page (`/app/recurring-payments/page.tsx`)

The main page for managing recurring payments with the following features:
- Tabs for filtering payments (All/Active/Inactive)
- Upcoming payments section showing payments due soon
- Grid view of all recurring payments with details
- Actions for each payment (edit, delete, toggle active status)
- Add new payment button

**Key functionality:**
- Displays payment details (name, amount, frequency, next due date)
- Allows toggling payment active status
- Provides edit and delete actions
- Shows empty state when no payments exist

### 2. Recurring Payment Dialog (`/components/recurring-payment-dialog.tsx`)

A modal dialog for adding and editing recurring payments:
- Form with fields for all payment details
- Support for different frequency types
- Custom interval option for non-standard frequencies (e.g., every 84 days)
- Account and category selection
- Optional end date

**Form fields:**
- Payment name
- Amount
- Frequency (Daily, Weekly, Monthly, Quarterly, Yearly, Custom)
- Custom interval days (when Custom frequency is selected)
- Next due date
- End date (optional)
- Account selection
- Category selection (optional)
- Counterparty
- Description (optional)

### 3. Recurring Payment Selector (`/components/recurring-payment-selector.tsx`)

A dropdown component for selecting existing recurring payments:
- Used in the transaction form
- Shows payment details in dropdown items
- Auto-fills transaction form fields when a payment is selected

### 4. Upcoming Recurring Payments (`/components/upcoming-recurring-payments.tsx`)

A dashboard widget component to display upcoming payments:
- Shows payment name, amount, and due date
- Links to the recurring payments page
- Displays empty state when no upcoming payments exist

### 5. Enhanced Transaction Form Fields (`/components/enhanced-transaction-form-fields.tsx`)

An enhanced version of the existing transaction form fields component:
- Adds integration with recurring payments
- Allows selecting existing recurring payments
- Supports custom interval input
- Auto-fills transaction details when a recurring payment is selected

## State Management

### Recurring Payment Store (`/lib/stores/recurring-payment-store.ts`)

A Zustand store for managing recurring payment state:

**State:**
- `recurringPayments`: Array of recurring payment objects
- `isLoading`: Loading state indicator
- `error`: Error message if any

**Actions:**
- `fetchRecurringPayments()`: Fetches all recurring payments
- `addRecurringPayment()`: Creates a new recurring payment
- `updateRecurringPayment()`: Updates an existing payment
- `deleteRecurringPayment()`: Deletes a payment
- `markPaymentComplete()`: Marks a payment as completed and updates next due date
- `togglePaymentActive()`: Toggles the active status of a payment

## Utility Functions

### Recurring Payment Utils (`/lib/utils/recurring-payment-utils.ts`)

Helper functions for recurring payment operations:

- `calculateNextDueDate()`: Calculates the next due date based on frequency and current date
- `getUpcomingRecurringPayments()`: Filters payments due within a specified number of days
- `formatFrequency()`: Formats frequency for display
- `isPaymentOverdue()`: Checks if a payment is overdue

## API Integration

The frontend components are designed to work with the following API endpoints:

### GET `/api/recurring-payments`
- Fetches all recurring payments for the current user
- Returns an array of recurring payment objects

### POST `/api/recurring-payments`
- Creates a new recurring payment
- Requires payment details in request body

### GET `/api/recurring-payments/:id`
- Fetches a specific recurring payment by ID

### PUT `/api/recurring-payments/:id`
- Updates an existing recurring payment
- Requires payment details in request body

### DELETE `/api/recurring-payments/:id`
- Deletes a recurring payment

## Data Model

The recurring payment object structure:

```typescript
interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  customIntervalDays?: number;
  startDate: Date;
  endDate?: Date | null;
  nextDueDate: Date;
  accountId: string;
  accountName?: string;
  categoryId?: string;
  categoryName?: string;
  counterparty?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Integration with Transaction Form

When a user creates a transaction from a recurring payment:

1. User selects "Recurring" toggle in the transaction form
2. User can select an existing recurring payment from the dropdown
3. Form fields are auto-populated with the recurring payment details
4. When the transaction is saved, the recurring payment's next due date is updated

## Next Steps and Considerations

1. **Backend Implementation**:
   - Implement the API routes as described in the API Integration section
   - Ensure proper validation of recurring payment data
   - Implement the next due date calculation logic on the server side

2. **Dashboard Integration**:
   - Add the `UpcomingRecurringPayments` component to the dashboard
   - Consider adding payment statistics or summaries

3. **Navigation**:
   - Add a link to the recurring payments page in the main navigation

4. **Notifications**:
   - Implement notifications for upcoming and overdue payments
   - Add email notifications option

5. **Mobile Optimization**:
   - Ensure the recurring payments page and components are responsive
   - Test on various screen sizes

## Notes for Backend Developers

The frontend implementation assumes the following from the backend:

1. The API endpoints follow RESTful conventions as outlined in the API Integration section
2. The recurring payment object structure matches the data model described above
3. The backend handles next due date calculations when a payment is marked as completed
4. Proper validation is implemented for all API endpoints
5. Authentication and authorization are handled for all endpoints

Please review the existing Prisma schema for the `RecurringPayment` model and ensure it aligns with the frontend implementation.

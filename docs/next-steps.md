# Money Manager - Next Steps

## Last Updated: April 1, 2025

This document outlines the immediate next steps for the Money Manager project based on the current state of the codebase.

## 1. Standardize Authentication

There are currently two different authentication methods being used across API routes:
- Some routes use `getServerSession(authOptions)`
- Others use the custom `authMiddleware` function

**Action Items:**
- Choose one authentication approach for consistency
- Update all API routes to use the chosen method
- Ensure proper error handling for authentication failures

## 2. Complete API Routes Implementation

While the basic structure for API routes is set up, some implementations need to be completed:

**Action Items:**
- Test all CRUD operations for accounts, transactions, and categories
- Ensure proper error handling and validation
- Verify that account balance updates correctly with different transaction types
- Test authentication and authorization for all routes

## 3. Connect Zustand Stores to API Endpoints

The Zustand stores currently use mock data or placeholders for API calls:

**Action Items:**
- Update store files to use real API calls:
  ```javascript
  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      set({ accounts: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch accounts', 
        isLoading: false 
      });
    }
  }
  ```
- Implement proper error handling for API requests
- Add loading states for better UX
- Integrate TanStack Query for data fetching, caching, and automatic refetching

## 4. Credit Card Transaction Handling

As noted in the progress tracker, we need to define and implement credit card transaction behavior:

**Action Items:**
1. **Create a Credit Card Transaction Plan Document:**
   - Define how credit card purchases are recorded
   - Specify how payments to credit cards are handled
   - Document how to calculate interest and track payment due dates

2. **Implement Credit Card Transaction Logic:**
   - Update the transaction API to handle credit card specific fields
   - Create logic for tracking credit card balances and available credit
   - Implement interest calculations

3. **Design Credit Card UI Components:**
   - Create UI for credit card account details
   - Design credit limit visualization
   - Implement payment due date reminders

## 5. Implement Recurring Payments

After handling the core functionality, we need to implement recurring payments:

**Action Items:**
- Design and implement the recurring payment system
- Create UI for managing recurring payments
- Set up logic for generating transactions from recurring payment schedules

## 6. Data Import/Export

For user convenience, we need to implement data import/export functionality:

**Action Items:**
- Implement CSV import/export functionality
- Create UI for data import/export operations

## How to Resume Development

1. Start the development environment:
   ```bash
   cd /home/logesh/Coding/Vibe/money-2
   docker-compose up -d  # Start the database
   npm run dev  # Start the Next.js development server
   ```

2. Begin with standardizing the authentication approach across all API routes

3. Then move on to connecting the Zustand stores to the API endpoints

4. Create a detailed plan for credit card transaction handling before implementation

## Files to Review

- `/app/api/accounts/route.ts` - Account API routes
- `/app/api/transactions/route.ts` - Transaction API routes
- `/app/api/categories/route.ts` - Category API routes
- `/lib/stores/account-store.ts` - Account state management
- `/lib/stores/transaction-store.ts` - Transaction state management
- `/lib/stores/category-store.ts` - Category state management
- `/lib/auth.ts` - Authentication utilities

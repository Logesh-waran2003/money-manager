# API Integration Guide

This document outlines how the frontend components connect to the backend API in the Money Manager application.

## Database Seeding

For development purposes, you can seed the database with initial data by making a POST request to the `/api/seed` endpoint:

```bash
curl -X POST http://localhost:3000/api/seed
```

This will create:
- A test user
- Default accounts (checking, savings, credit card, investment)
- Default categories for income and expenses

## API Endpoints

### Accounts

- `GET /api/accounts` - Get all accounts for the current user
- `POST /api/accounts` - Create a new account
- `GET /api/accounts/:id` - Get a specific account
- `PUT /api/accounts/:id` - Update an account
- `DELETE /api/accounts/:id` - Delete an account

### Categories

- `GET /api/categories` - Get all categories for the current user
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get a specific category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Transactions

- `GET /api/transactions` - Get all transactions for the current user
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

## Frontend Integration

The frontend uses Zustand stores to manage state and interact with the API:

### Transaction Store

The transaction store handles fetching, creating, updating, and deleting transactions:

```typescript
// Example of creating a transaction
const { addTransaction } = useTransactionStore();

// Create a transaction
const transaction = await addTransaction({
  accountId: 'account-id',
  amount: 100,
  type: 'expense',
  date: new Date().toISOString(),
  // other fields...
});
```

### Account Store

The account store manages account data:

```typescript
// Example of fetching accounts
const { accounts, fetchAccounts } = useAccountStore();

// Fetch accounts on component mount
useEffect(() => {
  fetchAccounts();
}, [fetchAccounts]);
```

### Category Store

The category store manages category data:

```typescript
// Example of getting categories by type
const { getCategoriesByType } = useCategoryStore();
const expenseCategories = getCategoriesByType('expense');
```

## Authentication

The application uses a simplified authentication system for development:

- All API requests are authenticated using the `getAuthUser` function in `lib/auth.ts`
- In development, this function returns a mock user
- In production, it would verify a JWT token from cookies or Authorization header

## Error Handling

API errors are handled consistently:

- API routes return appropriate HTTP status codes
- Error responses include an `error` field with a descriptive message
- Frontend components display toast notifications for errors
- Console errors are logged for debugging

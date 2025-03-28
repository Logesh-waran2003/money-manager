# Money Manager API Documentation

## Overview

This document outlines the API endpoints available in the Money Manager application. The API follows RESTful principles and returns JSON responses.

## Base URL

All API endpoints are relative to the base URL: `http://localhost:3000/api`

## Authentication

Currently, the API does not implement authentication. This will be added in future iterations.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include a JSON object with an `error` field containing a description of the error.

## Endpoints

### Accounts

#### GET /accounts
Retrieves all accounts.

**Response**
```json
[
  {
    "id": 1,
    "name": "Main Checking",
    "type": "debit",
    "balance": "5000.00",
    "description": "Primary checking account"
  },
  {
    "id": 2,
    "name": "Credit Card",
    "type": "credit",
    "balance": "-1500.00",
    "description": "Monthly expenses"
  }
]
```

#### GET /accounts/:id
Retrieves a specific account by ID.

**Response**
```json
{
  "id": 1,
  "name": "Main Checking",
  "type": "debit",
  "balance": "5000.00",
  "description": "Primary checking account"
}
```

#### POST /accounts
Creates a new account.

**Request Body**
```json
{
  "name": "Savings Account",
  "type": "debit",
  "balance": "10000.00",
  "description": "Emergency fund"
}
```

**Response**
```json
{
  "id": 3,
  "name": "Savings Account",
  "type": "debit",
  "balance": "10000.00",
  "description": "Emergency fund"
}
```

#### PUT /accounts/:id
Updates an existing account.

**Request Body**
```json
{
  "name": "Updated Account Name",
  "description": "Updated description"
}
```

**Response**
```json
{
  "id": 1,
  "name": "Updated Account Name",
  "type": "debit",
  "balance": "5000.00",
  "description": "Updated description"
}
```

#### DELETE /accounts/:id
Deletes an account (only if no transactions are linked).

**Response**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Transactions

#### GET /transactions
Retrieves transactions with optional filtering.

**Query Parameters**
- `accountId`: Filter by account ID
- `withTransfers`: Include transfer transactions (true/false)
- `sortBy`: Field to sort by (default: "time")
- `sortOrder`: Sort order ("asc" or "desc", default: "desc")

**Response**
```json
[
  {
    "id": 1,
    "accountId": 1,
    "amount": "-50.00",
    "category": "Food",
    "description": "Grocery shopping",
    "time": "2025-03-26T12:00:00Z",
    "appUsed": "Supermarket App"
  },
  {
    "id": 2,
    "accountId": 1,
    "amount": "-30.00",
    "category": "Entertainment",
    "description": "Movie tickets",
    "time": "2025-03-25T18:30:00Z",
    "appUsed": "Cinema App"
  }
]
```

#### GET /transactions/:id
Retrieves a specific transaction by ID.

**Response**
```json
{
  "id": 1,
  "accountId": 1,
  "amount": "-50.00",
  "category": "Food",
  "description": "Grocery shopping",
  "time": "2025-03-26T12:00:00Z",
  "appUsed": "Supermarket App"
}
```

#### POST /transactions
Creates a new transaction.

**Request Body**
```json
{
  "accountId": 1,
  "amount": "-25.50",
  "category": "Food",
  "description": "Lunch",
  "appUsed": "Restaurant App",
  "time": "2025-03-27T13:00:00Z"
}
```

**Response**
```json
{
  "id": 3,
  "accountId": 1,
  "amount": "-25.50",
  "category": "Food",
  "description": "Lunch",
  "time": "2025-03-27T13:00:00Z",
  "appUsed": "Restaurant App"
}
```

#### PUT /transactions/:id
Updates an existing transaction.

**Request Body**
```json
{
  "amount": "-27.50",
  "description": "Updated description"
}
```

**Response**
```json
{
  "id": 1,
  "accountId": 1,
  "amount": "-27.50",
  "category": "Food",
  "description": "Updated description",
  "time": "2025-03-26T12:00:00Z",
  "appUsed": "Supermarket App"
}
```

#### DELETE /transactions/:id
Deletes a transaction and adjusts the account balance.

**Response**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

### Transfers

#### POST /transfers
Creates a transfer between two accounts.

**Request Body**
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": "500.00",
  "description": "Monthly credit card payment",
  "time": "2025-03-27T14:00:00Z"
}
```

**Response**
```json
{
  "id": 1,
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": "500.00",
  "description": "Monthly credit card payment",
  "time": "2025-03-27T14:00:00Z",
  "fromTransaction": {
    "id": 4,
    "accountId": 1,
    "amount": "-500.00",
    "description": "Transfer to Credit Card",
    "time": "2025-03-27T14:00:00Z",
    "transferId": 1
  },
  "toTransaction": {
    "id": 5,
    "accountId": 2,
    "amount": "500.00",
    "description": "Transfer from Main Checking",
    "time": "2025-03-27T14:00:00Z",
    "transferId": 1
  }
}
```

### Credits (Planned)

#### GET /credits
Retrieves all credits.

#### GET /credits/:id
Retrieves a specific credit by ID.

#### POST /credits
Creates a new credit.

#### PUT /credits/:id
Updates an existing credit.

#### DELETE /credits/:id
Deletes a credit.

### Recurring Payments (Planned)

#### GET /recurring-payments
Retrieves all recurring payments.

#### GET /recurring-payments/:id
Retrieves a specific recurring payment by ID.

#### POST /recurring-payments
Creates a new recurring payment.

#### PUT /recurring-payments/:id
Updates an existing recurring payment.

#### DELETE /recurring-payments/:id
Deletes a recurring payment.

## Data Models

### Account
```typescript
{
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
  description?: string;
}
```

### Transaction
```typescript
{
  id: number;
  accountId: number;
  amount: string;
  category?: string;
  description?: string;
  time: Date;
  appUsed?: string;
  transferId?: number;
}
```

### Transfer
```typescript
{
  id: number;
  fromAccountId: number;
  toAccountId: number;
  amount: string;
  description?: string;
  time: Date;
}
```

### Credit (Planned)
```typescript
{
  id: number;
  name: string;
  amount: string;
  beneficiary: string;
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "cancelled";
  description?: string;
}
```

### Recurring Payment (Planned)
```typescript
{
  id: number;
  name: string;
  accountId: number;
  amount: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  category?: string;
  description?: string;
  status: "active" | "paused" | "completed";
}
```

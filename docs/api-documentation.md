# Money Manager API Documentation

## Authentication

All API endpoints require authentication. Include the authentication token in the request headers:

```
Authorization: Bearer YOUR_TOKEN
```

## Transactions API

### Get All Transactions

```
GET /api/transactions
```

Returns all transactions for the authenticated user.

### Get Transaction by ID

```
GET /api/transactions/:id
```

Returns a specific transaction by ID.

### Create Transaction

```
POST /api/transactions
```

Create a new transaction.

**Request Body:**

```json
{
  "amount": 50.00,
  "date": "2025-04-03T12:00:00Z",
  "description": "Grocery shopping",
  "notes": "Weekly groceries",
  "type": "expense",
  "counterparty": "Supermarket",
  "appUsed": "In-store",
  "accountId": "account_id",
  "categoryId": "category_id"
}
```

**Transaction Types:**
- `expense`: Money spent from an account
- `income`: Money received into an account
- `transfer`: Money moved between accounts
- `credit`: Credit card transaction (requires `creditType`)

**For Credit Card Transactions:**
```json
{
  "amount": 100.00,
  "date": "2025-04-03T12:00:00Z",
  "description": "Online purchase",
  "type": "credit",
  "creditType": "borrowed",
  "accountId": "credit_card_account_id",
  "categoryId": "category_id"
}
```

**For Transfers:**
```json
{
  "amount": 200.00,
  "date": "2025-04-03T12:00:00Z",
  "description": "Transfer to savings",
  "type": "transfer",
  "accountId": "source_account_id",
  "toAccountId": "destination_account_id"
}
```

### Update Transaction

```
PUT /api/transactions/:id
```

Update an existing transaction.

**Request Body:** Same as create transaction, but fields are optional.

### Delete Transaction

```
DELETE /api/transactions/:id
```

Delete a transaction by ID.

## Accounts API

### Get All Accounts

```
GET /api/accounts
```

Returns all accounts for the authenticated user.

### Get Account by ID

```
GET /api/accounts/:id
```

Returns a specific account by ID.

### Create Account

```
POST /api/accounts
```

Create a new account.

**Request Body:**

```json
{
  "name": "Chase Checking",
  "type": "bank",
  "balance": 1000.00,
  "currency": "USD",
  "accountNumber": "xxxx1234",
  "institution": "Chase Bank",
  "notes": "Primary checking account",
  "isDefault": true
}
```

**For Credit Card Accounts:**
```json
{
  "name": "Chase Freedom",
  "type": "credit",
  "balance": 500.00,
  "currency": "USD",
  "accountNumber": "xxxx5678",
  "institution": "Chase Bank",
  "creditLimit": 5000.00,
  "dueDate": "2025-04-15T00:00:00Z",
  "interestRate": 18.99,
  "minimumPayment": 25.00,
  "statementDate": "2025-04-01T00:00:00Z"
}
```

**Account Types:**
- `bank`: Bank account
- `credit`: Credit card
- `cash`: Cash
- `investment`: Investment account

### Update Account

```
PUT /api/accounts/:id
```

Update an existing account.

**Request Body:** Same as create account, but fields are optional.

### Delete Account

```
DELETE /api/accounts/:id
```

Delete an account by ID. This will fail if there are transactions associated with the account.

## Categories API

### Get All Categories

```
GET /api/categories
```

Returns all categories for the authenticated user.

### Get Category by ID

```
GET /api/categories/:id
```

Returns a specific category by ID.

### Create Category

```
POST /api/categories
```

Create a new category.

**Request Body:**

```json
{
  "name": "Groceries",
  "type": "expense",
  "color": "#4CAF50",
  "icon": "shopping_cart",
  "parentId": "parent_category_id"
}
```

**Category Types:**
- `income`: Income category
- `expense`: Expense category

### Update Category

```
PUT /api/categories/:id
```

Update an existing category.

**Request Body:** Same as create category, but fields are optional.

### Delete Category

```
DELETE /api/categories/:id
```

Delete a category by ID. This will fail if there are transactions or subcategories associated with the category.

## Credit Card API

### Calculate Interest

```
POST /api/credit-cards/interest
```

Calculate and apply interest for a credit card.

**Request Body:**

```json
{
  "accountId": "credit_card_account_id",
  "date": "2025-04-03T00:00:00Z"
}
```

### Get Credit Card Statistics

```
GET /api/credit-cards/:id/stats
```

Get statistics for a credit card account.

**Response:**

```json
{
  "balance": 500.00,
  "availableCredit": 4500.00,
  "utilization": 10.00,
  "creditLimit": 5000.00,
  "dueDate": "2025-04-15T00:00:00Z",
  "daysUntilDue": 12,
  "minimumPayment": 25.00,
  "interestRate": 18.99,
  "statementDate": "2025-04-01T00:00:00Z",
  "monthlySpending": 350.00,
  "recentTransactions": [...]
}
```

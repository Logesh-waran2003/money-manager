# Money Manager Project Context for Amazon Q

## Project Overview
- **Name**: Money Manager
- **Description**: A comprehensive personal finance tracking application with a unified transaction form
- **Repository**: `/home/logesh/Coding/Vibe/money-2`
- **Purpose**: Track personal finances, manage accounts, and handle different transaction types

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS with shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL in Docker with Prisma ORM
- **State Management**: Zustand for local state, TanStack Query for server state
- **Development Environment**: Docker Compose for PostgreSQL database

## Project Structure
```
money-2/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   └── ...               # Page components
├── components/           # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── docs/                 # Project documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared code
│   ├── stores/           # Zustand stores
│   └── utils.ts          # Utility functions
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── .env.example          # Example environment variables
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project README
```

## Current Project Status

### Completed Features
1. **Transaction Form UI**
   - Fixed to match the desired design from previous commits
   - Added category selection
   - Implemented proper form validation and error handling
   - Integrated with the application workflow

2. **Database Schema**
   - Created Prisma schema with models for:
     - Users (authentication, profile)
     - Accounts (bank accounts, credit cards, cash)
     - Transactions (income, expense, transfer, credit, recurring)
     - Categories (income and expense categories)

3. **Authentication System**
   - Implemented register endpoint
   - Implemented login endpoint
   - Implemented password reset endpoint
   - Created authentication middleware

### In-Progress Features
1. **API Routes**
   - Authentication routes completed
   - Account, transaction, and category routes need implementation

2. **Data Integration**
   - Need to connect Zustand stores to API endpoints
   - Currently using mock data in the frontend

3. **Credit Card Management**
   - Basic schema defined
   - Need to implement specific credit card behaviors

## Database Schema Details

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  transactions  Transaction[]
  categories    Category[]
}
```

### Account Model
```prisma
model Account {
  id            String    @id @default(cuid())
  name          String
  type          String    // bank, credit, cash, investment
  balance       Float
  currency      String    @default("USD")
  accountNumber String?
  institution   String?
  notes         String?
  isDefault     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Transactions where this is the source account
  outgoingTransactions Transaction[] @relation("SourceAccount")
  
  // Transactions where this is the destination account (for transfers)
  incomingTransactions Transaction[] @relation("DestinationAccount")
  
  // Credit-specific fields
  creditLimit   Float?
  dueDate       DateTime?
  interestRate  Float?
  minimumPayment Float?
  statementDate DateTime?
}
```

### Transaction Model
```prisma
model Transaction {
  id            String    @id @default(cuid())
  amount        Float
  date          DateTime
  description   String?
  notes         String?
  type          String    // income, expense, transfer, credit, recurring
  counterparty  String?
  appUsed       String?
  
  // Account relationships
  accountId     String
  account       Account   @relation("SourceAccount", fields: [accountId], references: [id], onDelete: Cascade)
  toAccountId   String?
  toAccount     Account?  @relation("DestinationAccount", fields: [toAccountId], references: [id])
  
  // Category relationship
  categoryId    String?
  category      Category? @relation(fields: [categoryId], references: [id])
  
  // User relationship
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Credit-specific fields
  creditType    String?   // lent, borrowed
  dueDate       DateTime?
  isPaid        Boolean?
  
  // Recurring-specific fields
  frequency     String?   // daily, weekly, monthly, yearly
  endDate       DateTime?
  isActive      Boolean?  @default(true)
}
```

### Category Model
```prisma
model Category {
  id            String    @id @default(cuid())
  name          String
  type          String    // income, expense
  color         String?
  icon          String?
  parentId      String?
  parent        Category? @relation("SubCategories", fields: [parentId], references: [id])
  subCategories Category[] @relation("SubCategories")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions  Transaction[]
}
```

## Transaction Types

### Regular Transaction
- Simple income or expense
- Has a direction (sent/received)
- Has a counterparty
- Has a category

### Credit Transaction
- Represents money lent or borrowed
- Has a credit type (lent/borrowed)
- Has a counterparty
- Has a due date

### Recurring Transaction
- Repeating payment or income
- Has a frequency (daily, weekly, monthly, etc.)
- Has a name (e.g., "Netflix Subscription")
- Can have an end date

### Transfer Transaction
- Movement of money between accounts
- Has source and destination accounts
- No counterparty or category

## UI Components

### Transaction Form
- Unified form for all transaction types
- Toggle switches for transaction type selection
- Conditional fields based on transaction type
- Form validation and error handling

### Account Selector
- Dropdown for selecting accounts
- Shows account name and balance
- Used in transaction form

### Category Selector
- Dropdown for selecting categories
- Filters categories by type (income/expense)
- Used in transaction form

## Next Steps

### API Routes Implementation
1. **Transaction API Routes**
   - Create transaction endpoint
   - Get transactions endpoint
   - Update transaction endpoint
   - Delete transaction endpoint

2. **Account API Routes**
   - Create account endpoint
   - Get accounts endpoint
   - Update account endpoint
   - Delete account endpoint

3. **Category API Routes**
   - Create category endpoint
   - Get categories endpoint
   - Update category endpoint
   - Delete category endpoint

### Data Integration
1. Connect Zustand stores to API endpoints using TanStack Query
2. Replace mock data with real data from the database
3. Implement proper error handling for API requests

### Credit Card Management
1. Define credit card transaction behavior
   - How to represent credit card purchases vs. payments
   - How to track credit card balances and available credit
   - How to handle interest calculations and due dates

2. Implement credit card specific features
   - Payment tracking
   - Interest calculation
   - Statement generation

### Recurring Payments
1. Implement recurring payment scheduling
2. Create UI for managing recurring payments

## How to Resume Development

1. Start the development environment:
   ```bash
   cd /home/logesh/Coding/Vibe/money-2
   docker-compose up -d  # Start the database
   npm run dev  # Start the Next.js development server
   ```

2. Review the progress tracker:
   ```bash
   cat /home/logesh/Coding/Vibe/money-2/docs/progress-tracker.md
   ```

3. Focus on implementing the API routes for transactions, accounts, and categories

4. Plan the credit card transaction behavior in detail

## Key Files to Review

- `/docs/progress-tracker.md` - Detailed progress and next steps
- `/prisma/schema.prisma` - Database schema
- `/components/transaction-form-fields.tsx` - Transaction form UI
- `/app/transaction/page.tsx` - Transaction page implementation
- `/lib/db.ts` - Database connection setup
- `/app/api/auth/register/route.ts` - Example API route implementation
- `/lib/auth.ts` - Authentication utilities

## Commands for Common Tasks

- Start database: `docker-compose up -d`
- Generate Prisma client: `npx prisma generate`
- Create database migration: `npx prisma migrate dev --name <migration-name>`
- View database: `npx prisma studio`
- Run development server: `npm run dev`

## Credit Card Transaction Planning

Credit card transactions require special handling because they represent both a transaction and a change to a debt balance. Here are key considerations:

1. **Credit Card Purchases**
   - Should be recorded as expenses but also increase the credit card balance
   - Need to track the merchant, category, and date

2. **Credit Card Payments**
   - Should be recorded as transfers from a bank account to the credit card
   - Need to track payment amount, date, and source account

3. **Interest and Fees**
   - Need to track interest charges and fees separately
   - Should be categorized appropriately for reporting

4. **Credit Card Balance**
   - Need to track current balance vs. statement balance
   - Need to calculate available credit based on credit limit

5. **Credit Card Statements**
   - Need to generate monthly statements
   - Track statement closing date and payment due date
   - Calculate minimum payment due

6. **Credit Card Rewards**
   - Optional: Track cashback, points, or other rewards
   - Calculate rewards earned per transaction

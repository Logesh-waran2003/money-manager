# Codebase Restructuring Plan

This document outlines a comprehensive plan for restructuring the Money Manager codebase to improve organization, maintainability, and performance.

## Current Structure Assessment

The current structure follows a typical Next.js App Router pattern, but there are some areas that could benefit from restructuring:

### Strengths
- Clear separation of API routes and page components
- Organized component structure with UI and feature components
- Documentation directory for project docs
- Proper separation of utilities and stores

### Areas for Improvement

1. **CSS Loading Issues**: The intermittent CSS loading suggests potential issues with how styles are imported and managed
2. **Build Errors**: The errors encountered suggest potential circular dependencies or module resolution issues
3. **Code Organization**: As the project grows, the flat structure within directories may become harder to navigate
4. **Type Definitions**: The TypeScript errors suggest inconsistent or scattered type definitions

## Recommended Restructuring

### 1. Reorganize the Project Structure

```
money-manager/
├── app/                       # Next.js App Router
│   ├── (auth)/                # Group authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx         # Shared layout for auth pages
│   ├── (dashboard)/           # Group dashboard routes
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   └── layout.tsx         # Shared layout with sidebar/nav
│   ├── api/                   # API Routes (grouped by domain)
│   │   ├── auth/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   └── recurring-payments/
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # Base UI components
│   ├── forms/                 # Form components
│   │   ├── account-form.tsx
│   │   ├── transaction-form.tsx
│   │   └── ...
│   ├── layouts/               # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── ...
│   ├── features/              # Feature-specific components
│   │   ├── accounts/
│   │   ├── transactions/
│   │   └── recurring-payments/
│   └── providers/             # Context providers
├── hooks/                     # Custom React hooks
│   ├── use-accounts.ts
│   ├── use-transactions.ts
│   └── ...
├── lib/                       # Utility functions and shared code
│   ├── api/                   # API client functions
│   │   ├── accounts.ts
│   │   ├── transactions.ts
│   │   └── ...
│   ├── stores/                # Zustand stores
│   ├── utils/                 # Utility functions (grouped by domain)
│   │   ├── date-utils.ts
│   │   ├── currency-utils.ts
│   │   └── ...
│   └── types/                 # TypeScript type definitions
│       ├── accounts.ts
│       ├── transactions.ts
│       └── ...
├── styles/                    # Global styles
│   ├── globals.css
│   └── ...
├── prisma/                    # Prisma schema and migrations
├── public/                    # Static assets
└── config/                    # Configuration files
    ├── site.ts                # Site metadata
    └── ...
```

### 2. Centralize Type Definitions

Create a dedicated `types` directory to centralize all TypeScript interfaces and types:

```typescript
// lib/types/accounts.ts
export type AccountType = "credit" | "bank" | "debit" | "cash" | "investment";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  // ...other properties
}
```

### 3. Improve CSS Management

1. **Use CSS Modules or Tailwind CSS consistently**:
   ```tsx
   // If using CSS modules
   import styles from './Component.module.css';
   
   // If using Tailwind, ensure proper configuration
   ```

2. **Add a global CSS reset and variables**:
   ```css
   /* styles/globals.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   :root {
     --primary: #0070f3;
     --secondary: #1a1a1a;
     /* other variables */
   }
   ```

### 4. Implement API Layer Abstraction

Create a clean API layer to separate API calls from UI components:

```typescript
// lib/api/transactions.ts
import { Transaction } from '@/lib/types/transactions';

export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch('/api/transactions');
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
}
```

### 5. Implement Custom Hooks for Data Fetching

```typescript
// hooks/use-transactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, createTransaction } from '@/lib/api/transactions';
import { Transaction } from '@/lib/types/transactions';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

### 6. Improve Error Handling

Create a consistent error handling pattern:

```typescript
// lib/utils/error-utils.ts
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return `Error (${error.status}): ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
```

## Implementation Plan

1. **Create the new directory structure** without moving files yet
2. **Centralize type definitions** in the new `lib/types` directory
3. **Refactor API routes** to use the new structure
4. **Create API client functions** in `lib/api`
5. **Implement custom hooks** for data fetching
6. **Gradually migrate components** to the new structure
7. **Update imports** throughout the codebase

This approach allows for incremental improvement of the codebase without breaking existing functionality. The restructuring will make the code more maintainable, reduce the likelihood of CSS loading issues, and make it easier to identify and fix type errors.

## Benefits of Restructuring

1. **Improved Developer Experience**:
   - Easier navigation through the codebase
   - Clearer separation of concerns
   - More consistent patterns

2. **Better Performance**:
   - Reduced bundle sizes through better code splitting
   - More efficient CSS loading
   - Optimized API calls

3. **Enhanced Maintainability**:
   - Centralized type definitions
   - Consistent error handling
   - Clear API abstraction layer

4. **Easier Onboarding**:
   - More intuitive project structure
   - Better documentation through organization
   - Clearer patterns for new developers to follow

## Timeline Considerations

- **Phase 1**: Set up new directory structure and centralize types (1-2 days)
- **Phase 2**: Implement API layer and custom hooks (2-3 days)
- **Phase 3**: Migrate components and pages (3-5 days)
- **Phase 4**: Update imports and fix any remaining issues (1-2 days)

The entire restructuring can be completed in approximately 7-12 days, depending on the complexity and size of the codebase.

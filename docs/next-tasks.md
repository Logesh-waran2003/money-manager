# Next Tasks

This document outlines the immediate next tasks to focus on for the Money Manager application.

## 1. Standardize Authentication

**Task:** Update all API routes to use the custom JWT middleware approach.

**Files to modify:**
- `/lib/auth.ts` - Enhance the auth middleware
- `/app/api/transactions/route.ts` - Update to use auth middleware
- `/app/api/categories/route.ts` - Update to use auth middleware
- `/app/api/accounts/route.ts` - Verify it's using auth middleware

**Example implementation:**
```typescript
// Before
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  // Handler logic
}

// After
export async function GET(request: NextRequest) {
  return authMiddleware(request, async (req, { userId }) => {
    // Handler logic
  });
}
```

## 2. Complete API Routes

**Task:** Test and finalize all API routes for accounts, transactions, and categories.

**Files to check:**
- `/app/api/accounts/route.ts` and `/app/api/accounts/[id]/route.ts`
- `/app/api/transactions/route.ts` and `/app/api/transactions/[id]/route.ts`
- `/app/api/categories/route.ts` and `/app/api/categories/[id]/route.ts`

**Testing approach:**
1. Use Postman or curl to test each endpoint
2. Verify authentication works correctly
3. Test error handling for invalid inputs
4. Confirm database updates correctly

## 3. Connect Zustand Stores to API

**Task:** Update Zustand stores to use real API calls instead of mock data.

**Files to modify:**
- `/lib/stores/account-store.ts`
- `/lib/stores/transaction-store.ts`
- `/lib/stores/category-store.ts`

**Example implementation:**
```typescript
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

## 4. Implement Basic Credit Card Features

**Task:** Implement core credit card functionality.

**Steps:**
1. Update transaction API to handle credit card purchases
2. Implement credit card payment logic
3. Create basic UI components for credit card management

**Files to create/modify:**
- `/app/api/transactions/route.ts` - Update for credit card handling
- `/components/credit-card-form.tsx` - Create new component
- `/components/credit-card-widget.tsx` - Create new component

## Start With This Task Today

Begin by standardizing the authentication approach across all API routes:

1. Open `/lib/auth.ts` and enhance the auth middleware
2. Update `/app/api/transactions/route.ts` to use the auth middleware
3. Update `/app/api/categories/route.ts` to use the auth middleware
4. Test the authentication with Postman or curl

# Authentication Standardization Plan

## Current Authentication Methods

Currently, the Money Manager application uses two different authentication methods across API routes:

1. **NextAuth Session-based Authentication**:
   ```typescript
   import { getServerSession } from 'next-auth';
   import { authOptions } from '@/lib/auth';

   const session = await getServerSession(authOptions);
   if (!session?.user) {
     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **Custom JWT Middleware**:
   ```typescript
   import { authMiddleware } from '@/lib/auth';

   export async function GET(request: NextRequest) {
     return authMiddleware(request, async (req, userId) => {
       // Handler logic
     });
   }
   ```

## Standardization Approach

We will standardize on the custom JWT middleware approach for all API routes, as it provides more flexibility and control over the authentication process.

## Implementation Plan

### 1. Update Auth Middleware

First, enhance the auth middleware to provide more context and better error handling:

```typescript
// lib/auth.ts

import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './db';

// Interface for the decoded JWT token
interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

// Interface for the authenticated request context
export interface AuthContext {
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Enhanced middleware to protect API routes
 */
export async function authMiddleware(
  request: NextRequest,
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Fallback to cookie if no Authorization header
      const cookieStore = cookies();
      token = cookieStore.get('token')?.value;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify and decode the token
    const decoded = verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as DecodedToken;

    // Get basic user info for context
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User not found' },
        { status: 401 }
      );
    }

    // Call the handler with the authenticated context
    return await handler(request, { userId: decoded.userId, user });
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Unauthorized: Token expired' },
        { status: 401 }
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Unauthorized: Authentication failed' },
      { status: 401 }
    );
  }
}
```

### 2. Update API Routes

Next, update all API routes to use the standardized auth middleware:

#### Example: Accounts API

```typescript
// app/api/accounts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/accounts - Get all accounts for the authenticated user
export async function GET(request: NextRequest) {
  return authMiddleware(request, async (req, { userId }) => {
    try {
      const accounts = await prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      );
    }
  });
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  return authMiddleware(request, async (req, { userId }) => {
    try {
      const {
        name,
        type,
        balance,
        currency,
        accountNumber,
        institution,
        notes,
        isDefault,
        creditLimit,
        dueDate,
        interestRate,
        minimumPayment,
        statementDate,
      } = await req.json();

      // Validation and account creation logic...
      
      return NextResponse.json(account);
    } catch (error) {
      console.error('Error creating account:', error);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }
  });
}
```

#### Example: Transactions API

```typescript
// app/api/transactions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/transactions - Get all transactions for the authenticated user
export async function GET(request: NextRequest) {
  return authMiddleware(request, async (req, { userId }) => {
    try {
      // Parse query parameters
      const { searchParams } = new URL(req.url);
      const accountId = searchParams.get('accountId');
      const categoryId = searchParams.get('categoryId');
      // Other parameters...
      
      // Build the where clause
      const where: any = { userId };
      
      // Add filters...
      
      // Get transactions
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          account: { select: { name: true, type: true } },
          category: { select: { name: true, icon: true, color: true } },
        },
        skip: offset,
        take: limit,
      });

      // Get total count for pagination
      const total = await prisma.transaction.count({ where });

      return NextResponse.json({
        transactions,
        pagination: { total, limit, offset },
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }
  });
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  return authMiddleware(request, async (req, { userId }) => {
    try {
      const transactionData = await req.json();
      
      // Validation and transaction creation logic...
      
      return NextResponse.json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }
  });
}
```

### 3. Update Dynamic Route Handlers

For dynamic routes (e.g., `/api/accounts/[id]`), update the handlers to use the auth middleware:

```typescript
// app/api/accounts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/accounts/[id] - Get a specific account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(request, async (req, { userId }) => {
    try {
      const account = await prisma.account.findUnique({
        where: { id: params.id },
      });

      if (!account) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }

      // Check if the account belongs to the authenticated user
      if (account.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized: This account does not belong to you' },
          { status: 403 }
        );
      }

      return NextResponse.json(account);
    } catch (error) {
      console.error('Error fetching account:', error);
      return NextResponse.json(
        { error: 'Failed to fetch account' },
        { status: 500 }
      );
    }
  });
}

// Similar updates for PUT and DELETE handlers...
```

## Testing Authentication

After standardizing the authentication approach, test all API routes to ensure they work correctly:

1. Test with valid authentication token
2. Test with invalid token
3. Test with expired token
4. Test with no token
5. Test authorization checks (e.g., accessing another user's resources)

## Client-Side Authentication

Update the client-side code to include the authentication token in all API requests:

```typescript
// lib/api-client.ts

export const apiClient = {
  async fetch(url: string, options: RequestInit = {}) {
    // Get token from localStorage or cookie
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return null;
    }
    
    return response;
  },
  
  async get(url: string) {
    const response = await this.fetch(url);
    if (!response) return null;
    return response.json();
  },
  
  async post(url: string, data: any) {
    const response = await this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response) return null;
    return response.json();
  },
  
  async put(url: string, data: any) {
    const response = await this.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response) return null;
    return response.json();
  },
  
  async delete(url: string) {
    const response = await this.fetch(url, {
      method: 'DELETE',
    });
    if (!response) return null;
    return response.json();
  },
};
```

## Next Steps

1. Update the auth middleware in `/lib/auth.ts`
2. Standardize all API routes to use the auth middleware
3. Update client-side code to include authentication token in all requests
4. Test all API routes with various authentication scenarios
5. Document the authentication flow for future reference

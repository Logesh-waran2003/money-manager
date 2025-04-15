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
 * Get the authenticated user from the request
 * Used in API routes to get the current user
 */
export async function getAuthUser(request: NextRequest) {
  try {
    // DEVELOPMENT BYPASS: Return a user with an ID that exists in the database
    return {
      id: "cm91y74jd0000ime8za4jbuby", // Using the existing user ID from the database
      name: "Test User",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Original code below - commented out for now
    /*
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
      return null;
    }

    // Verify and decode the token
    const decoded = verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as DecodedToken;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
    */
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Get the current authenticated user from the request
 */
export async function getCurrentUser() {
  try {
    // DEVELOPMENT BYPASS: Return a user with an ID that exists in the database
    return {
      id: "cm91y74jd0000ime8za4jbuby", // Using the existing user ID from the database
      name: "Test User",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Original code below - commented out for now
    /*
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    // Verify and decode the token
    const decoded = verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as DecodedToken;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
    */
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Enhanced middleware to protect API routes
 */
export async function authMiddleware(
  request: NextRequest,
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  try {
    // DEVELOPMENT BYPASS: Always provide a user context with an ID that exists in the database
    const mockUser = {
      id: "cm91y74jd0000ime8za4jbuby", // Using the existing user ID from the database
      name: "Test User",
      email: "test@example.com",
    };
    
    // Call the handler with the mocked authenticated context
    return await handler(request, { userId: mockUser.id, user: mockUser });
    
    // Original code below - commented out for now
    /*
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
    */
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET all accounts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we should include inactive accounts
    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';
    
    // Create the base query
    const query = {
      where: { 
        userId: user.id,
      },
      orderBy: { name: 'asc' },
    };
    
    // Only add isActive filter if we're not including inactive accounts
    if (!includeInactive) {
      const accounts = await prisma.account.findMany({
        where: { 
          userId: user.id,
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(accounts);
    } else {
      // Get all accounts regardless of active status
      const accounts = await prisma.account.findMany({
        where: { 
          userId: user.id,
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(accounts);
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

// CREATE a new account
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.type || data.balance === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If this is set as default, unset any existing default account
    if (data.isDefault) {
      await prisma.account.updateMany({
        where: { 
          userId: user.id,
          isDefault: true 
        },
        data: { isDefault: false },
      });
    }

    // Create the new account
    const account = await prisma.account.create({
      data: {
        ...data,
        userId: user.id,
        isActive: true, // Ensure new accounts are active by default
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/accounts - Get all accounts for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching accounts' },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, type, balance, currency, accountNumber, institution, notes } = await request.json();

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { message: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Check if this is the first account for the user
    const existingAccounts = await prisma.account.count({
      where: {
        userId: session.user.id,
      },
    });

    // Create the account
    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name,
        type,
        balance: balance || 0,
        currency: currency || 'USD',
        accountNumber,
        institution,
        notes,
        isDefault: existingAccounts === 0, // Make it default if it's the first account
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the account' },
      { status: 500 }
    );
  }
}

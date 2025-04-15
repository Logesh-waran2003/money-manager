import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET a specific account by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}

// UPDATE an account by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // If this is set as default, unset any existing default account
    if (data.isDefault) {
      await prisma.account.updateMany({
        where: { 
          userId: user.id,
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false },
      });
    }

    // Update the account
    const account = await prisma.account.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data,
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

// DELETE an account by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if there are any transactions associated with this account
    const transactionCount = await prisma.transaction.count({
      where: {
        OR: [
          { accountId: params.id },
          { toAccountId: params.id }
        ],
      },
    });

    if (transactionCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete account with associated transactions. Please delete the transactions first or transfer them to another account.' 
      }, { status: 400 });
    }

    // Delete the account
    await prisma.account.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

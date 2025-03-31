import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/accounts/[id] - Get a specific account
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const account = await prisma.account.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if the account belongs to the authenticated user
    if (account.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the account' },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/[id] - Update an account
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the account exists and belongs to the user
    const existingAccount = await prisma.account.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    if (existingAccount.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { name, type, balance, currency, accountNumber, institution, notes, isDefault } = await request.json();

    // Update the account
    const updatedAccount = await prisma.account.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        type,
        balance,
        currency,
        accountNumber,
        institution,
        notes,
        isDefault,
      },
    });

    // If this account is set as default, unset default for other accounts
    if (isDefault) {
      await prisma.account.updateMany({
        where: {
          userId: session.user.id,
          id: {
            not: params.id,
          },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the account' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete an account
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the account exists and belongs to the user
    const existingAccount = await prisma.account.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    if (existingAccount.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if there are any transactions associated with this account
    const transactionCount = await prisma.transaction.count({
      where: {
        OR: [
          { accountId: params.id },
          { toAccountId: params.id },
        ],
      },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete an account with transactions. Please delete the transactions first or transfer them to another account.' },
        { status: 400 }
      );
    }

    // Delete the account
    await prisma.account.delete({
      where: {
        id: params.id,
      },
    });

    // If this was the default account, set another account as default
    if (existingAccount.isDefault) {
      const anotherAccount = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
        },
      });

      if (anotherAccount) {
        await prisma.account.update({
          where: {
            id: anotherAccount.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the account' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET all credits for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await prisma.credit.findMany({
      where: { userId: user.id },
      include: {
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

// Mark a credit as paid
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Missing credit ID' }, { status: 400 });
    }

    // Check if the credit exists and belongs to the user
    const credit = await prisma.credit.findFirst({
      where: {
        id: data.id,
        userId: user.id,
      },
    });

    if (!credit) {
      return NextResponse.json({ error: 'Credit not found' }, { status: 404 });
    }

    // Update the credit to mark it as paid
    const updatedCredit = await prisma.credit.update({
      where: { id: data.id },
      data: { isPaid: true },
    });

    return NextResponse.json(updatedCredit);
  } catch (error) {
    console.error('Error updating credit:', error);
    return NextResponse.json({ error: 'Failed to update credit' }, { status: 500 });
  }
}

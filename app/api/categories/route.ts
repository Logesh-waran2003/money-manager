import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/categories - Get all categories for the authenticated user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'income' or 'expense'

    // Build the where clause
    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, icon, color, type } = await request.json();

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { message: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Check if a category with the same name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        icon,
        color,
        type,
        isDefault: false,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the category' },
      { status: 500 }
    );
  }
}

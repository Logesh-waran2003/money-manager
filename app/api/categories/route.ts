import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET all categories for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    });

    // Since we don't have actual subcategories in the database schema,
    // we'll add an empty array to match the expected interface
    const categoriesWithEmptySubCategories = categories.map(category => ({
      ...category,
      subCategories: [],
    }));

    return NextResponse.json(categoriesWithEmptySubCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// CREATE a new category
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If parentId is provided, verify it exists
    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: {
          id: data.parentId,
          userId: user.id,
        },
      });

      if (!parentCategory) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    // Add empty subcategories array to match interface
    const categoryWithEmptySubCategories = {
      ...category,
      subCategories: [],
    };

    return NextResponse.json(categoryWithEmptySubCategories);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

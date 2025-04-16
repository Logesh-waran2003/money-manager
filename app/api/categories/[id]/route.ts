import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET a specific category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Add empty subcategories array to match interface
    const categoryWithEmptySubCategories = {
      ...category,
      subCategories: [],
    };

    return NextResponse.json(categoryWithEmptySubCategories);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// UPDATE a category by ID
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
    
    // If parentId is provided, verify it exists and is not the category itself
    if (data.parentId) {
      if (data.parentId === params.id) {
        return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 });
      }
      
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

    // Update the category
    const category = await prisma.category.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data,
    });

    // Add empty subcategories array to match interface
    const categoryWithEmptySubCategories = {
      ...category,
      subCategories: [],
    };

    return NextResponse.json(categoryWithEmptySubCategories);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE a category by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if there are any transactions associated with this category
    const transactionCount = await prisma.transaction.count({
      where: {
        categoryId: params.id,
      },
    });

    if (transactionCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with associated transactions. Please reassign the transactions to another category first.' 
      }, { status: 400 });
    }

    // Delete the category
    await prisma.category.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

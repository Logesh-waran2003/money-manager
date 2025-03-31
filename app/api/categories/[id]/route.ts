import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/categories/[id] - Get a specific category
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

    const category = await prisma.category.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if the category belongs to the authenticated user
    if (category.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update a category
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

    // Check if the category exists and belongs to the user
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { name, icon, color } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if another category with the same name already exists for this user
    if (name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          userId: session.user.id,
          name,
          id: {
            not: params.id,
          },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { message: 'A category with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        icon,
        color,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
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

    // Check if the category exists and belongs to the user
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if this is a default category
    if (existingCategory.isDefault) {
      return NextResponse.json(
        { message: 'Cannot delete a default category' },
        { status: 400 }
      );
    }

    // Check if there are any transactions using this category
    const transactionCount = await prisma.transaction.count({
      where: {
        categoryId: params.id,
      },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete a category that is being used by transactions' },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the category' },
      { status: 500 }
    );
  }
}

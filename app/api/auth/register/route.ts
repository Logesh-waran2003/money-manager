import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create default categories for the user
    try {
      await createDefaultCategories(user.id);
    } catch (categoryError) {
      console.error('Error creating default categories:', categoryError);
      // Continue with user creation even if categories fail
    }

    // Return user data (excluding password) and token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

// Helper function to create default categories for a new user
async function createDefaultCategories(userId: string) {
  const defaultCategories = [
    // Income categories
    { name: 'Salary', isIncome: true, color: '#4CAF50', icon: 'briefcase' },
    { name: 'Freelance', isIncome: true, color: '#2196F3', icon: 'code' },
    { name: 'Investments', isIncome: true, color: '#9C27B0', icon: 'trending-up' },
    { name: 'Gifts', isIncome: true, color: '#E91E63', icon: 'gift' },
    { name: 'Other Income', isIncome: true, color: '#607D8B', icon: 'plus-circle' },
    
    // Expense categories
    { name: 'Housing', isIncome: false, color: '#FF5722', icon: 'home' },
    { name: 'Food & Dining', isIncome: false, color: '#FF9800', icon: 'utensils' },
    { name: 'Transportation', isIncome: false, color: '#795548', icon: 'car' },
    { name: 'Utilities', isIncome: false, color: '#607D8B', icon: 'zap' },
    { name: 'Entertainment', isIncome: false, color: '#9C27B0', icon: 'film' },
    { name: 'Shopping', isIncome: false, color: '#2196F3', icon: 'shopping-bag' },
    { name: 'Health & Medical', isIncome: false, color: '#F44336', icon: 'activity' },
    { name: 'Personal Care', isIncome: false, color: '#E91E63', icon: 'user' },
    { name: 'Education', isIncome: false, color: '#3F51B5', icon: 'book' },
    { name: 'Other Expenses', isIncome: false, color: '#607D8B', icon: 'more-horizontal' },
  ];

  // Create categories one by one instead of using createMany
  for (const category of defaultCategories) {
    await prisma.category.create({
      data: {
        ...category,
        userId,
      },
    });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isValidEmail } from '@/lib/utils/validation';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
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

    // Create default categories
    await createDefaultCategories(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

// Helper function to create default categories for new users
async function createDefaultCategories(userId: string) {
  const defaultCategories = [
    // Income categories
    { name: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income', isDefault: true },
    { name: 'Freelance', icon: 'laptop', color: '#10B981', type: 'income', isDefault: true },
    { name: 'Investments', icon: 'trending-up', color: '#10B981', type: 'income', isDefault: true },
    { name: 'Gifts', icon: 'gift', color: '#10B981', type: 'income', isDefault: true },
    { name: 'Other Income', icon: 'plus-circle', color: '#10B981', type: 'income', isDefault: true },
    
    // Expense categories
    { name: 'Food', icon: 'utensils', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Housing', icon: 'home', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Transportation', icon: 'car', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Entertainment', icon: 'film', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Shopping', icon: 'shopping-bag', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Health', icon: 'heart', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Education', icon: 'book', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Personal', icon: 'user', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Travel', icon: 'plane', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Bills', icon: 'file-text', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Other Expenses', icon: 'more-horizontal', color: '#EF4444', type: 'expense', isDefault: true },
  ];

  for (const category of defaultCategories) {
    await prisma.category.create({
      data: {
        ...category,
        userId,
      },
    });
  }
}

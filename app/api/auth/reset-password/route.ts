import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Just return a success message as if we sent the email
      return NextResponse.json({
        message: 'If your email is registered, you will receive password reset instructions',
      });
    }

    // Generate a password reset token
    const resetToken = sign(
      { userId: user.id, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // In a real application, you would send an email with a link containing the token
    // For this demo, we'll just return the token in the response
    console.log(`Password reset token for ${email}: ${resetToken}`);

    // Return success message
    return NextResponse.json({
      message: 'If your email is registered, you will receive password reset instructions',
      // In a real app, you would NOT include the token in the response
      // This is just for demonstration purposes
      token: resetToken,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

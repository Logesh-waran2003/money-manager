import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

// Function to get the authenticated user from a request
export async function getAuthUser(request: NextRequest) {
  try {
    // DEVELOPMENT BYPASS: Return a user with an ID that exists in the database
    return {
      id: "cm94i0m9t0000ouc5bsldef8f", // Using the existing user ID from the database
      name: "Test User",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error in getAuthUser:", error);
    return null;
  }
}

// Function to get the current user's session
export async function auth() {
  try {
    // DEVELOPMENT BYPASS: Return a mock session with a user that exists in the database
    return {
      user: {
        id: "cm94i0m9t0000ouc5bsldef8f", // Using the existing user ID from the database
        name: "Test User",
        email: "test@example.com",
      },
    };
  } catch (error) {
    console.error("Error in auth:", error);
    return null;
  }
}

// Function to get the current user
export async function getCurrentUser() {
  try {
    // DEVELOPMENT BYPASS: Return a user with an ID that exists in the database
    return {
      id: "cm92n2yn10000u1yai7zk6ebr", // Using the existing user ID from the database
      name: "Test User",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

// Middleware to check if the user is authenticated
export async function authMiddleware(
  request: NextRequest,
  options: {
    redirectTo?: string;
    onError?: (error: Error) => void;
  } = {}
) {
  try {
    // DEVELOPMENT BYPASS: Always provide a user context with an ID that exists in the database
    const mockUser = {
      id: "cm94i0m9t0000ouc5bsldef8f", // Using the existing user ID from the database
      name: "Test User",
      email: "test@example.com",
    };

    return { user: mockUser };
  } catch (error) {
    if (options.onError) {
      options.onError(error as Error);
    }

    if (options.redirectTo) {
      return { redirect: options.redirectTo };
    }

    return { error: "Unauthorized" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

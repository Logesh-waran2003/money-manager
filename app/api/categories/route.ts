import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all categories for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = "dev-user-id";

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    // Map database categories to the format expected by the frontend
    const mappedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.isIncome ? "income" : "expense",
      color: category.color,
      icon: category.icon || undefined,
      subCategories: [], // Add empty subcategories array for compatibility
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));

    return NextResponse.json(mappedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// CREATE a new category
export async function POST(request: NextRequest) {
  try {
    const userId = "dev-user-id";

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        isIncome: data.type === "income",
        color: data.color || "#000000",
        icon: data.icon,
        userId,
      },
    });

    // Map to the format expected by the frontend and add subcategories
    const mappedCategory = {
      id: category.id,
      name: category.name,
      type: category.isIncome ? "income" : "expense",
      color: category.color,
      icon: category.icon || undefined,
      subCategories: [], // Add empty subcategories array for compatibility
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    return NextResponse.json(mappedCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

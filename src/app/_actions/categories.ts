"use server";

import { db } from "@/lib/prisma";

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        imagePath: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        isActive: true,
      }
    });
    return { categories };
  } catch (error) {
    return { error: "Failed to fetch categories" };
  }
}

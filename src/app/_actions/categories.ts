"use server";

import { db } from "@/lib/prisma";

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return { categories };
  } catch (error) {
    return { error: "Failed to fetch categories" };
  }
}

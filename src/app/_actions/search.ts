"use server";

import prisma from "@/db/db";

export async function searchProducts(query: string) {
  if (!query) return [];

  try {
    console.log("Searching for:", query);

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query.toLowerCase() } },
          { description: { contains: query.toLowerCase() } },
        ],
      },
      include: {
        category: true,
      },
      take: 5,
    });

    console.log("Search results:", products);
    return products;
  } catch (error) {
    console.error("Search error:", error);
    
    // Check if it's a Prisma error
    if (error instanceof Error) {
      console.error("Detailed error:", error.message);
    }
    
    // Try a simpler query as fallback
    try {
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: query
          }
        },
        include: {
          category: true
        },
        take: 5
      });
      
      console.log("Fallback search results:", products);
      return products;
    } catch (fallbackError) {
      console.error("Fallback search error:", fallbackError);
      return [];
    }
  }
}

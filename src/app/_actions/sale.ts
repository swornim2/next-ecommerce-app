import { db } from "@/lib/prisma";

export async function getSaleProducts() {
  try {
    const products = await db.product.findMany({
      where: {
        onSale: true,
        salePrice: {
          not: null,
        },
        isAvailableForPurchase: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  } catch (error) {
    console.error("Error fetching sale products:", error);
    throw error;
  }
}

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
        category: {
          isActive: true // Only show products from active categories
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        onSale: true,
        imagePath: true,
        isAvailableForPurchase: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        createdAt: true,
      },
      orderBy: [
        {
          salePrice: "asc" // Show biggest discounts first (lower sale price)
        },
        {
          name: "asc" // Then alphabetically
        }
      ],
    });

    // Calculate discount percentages and sort by highest discount
    const productsWithDiscount = products.map(product => {
      const discountPercentage = product.salePrice 
        ? ((product.price - product.salePrice) / product.price) * 100 
        : 0;
      return {
        ...product,
        discountPercentage
      };
    }).sort((a, b) => b.discountPercentage - a.discountPercentage);

    return productsWithDiscount;
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return []; // Return empty array instead of throwing
  }
}

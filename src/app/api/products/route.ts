import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');

    const whereClause = categorySlug
      ? {
          category: {
            slug: categorySlug,
          },
          isAvailableForPurchase: true,
        }
      : {
          isAvailableForPurchase: true,
        };

    const products = await db.product.findMany({
      where: whereClause,
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to ensure all fields are present
    const transformedProducts = products.map(product => ({
      ...product,
      onSale: product.onSale ?? false, // Ensure onSale is never undefined
      salePrice: product.salePrice ?? null, // Ensure salePrice is never undefined
    }));

    console.log('API Response:', JSON.stringify(transformedProducts, null, 2));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, imagePath, categoryId } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        imagePath,
        categoryId,
        isAvailableForPurchase: true,
        onSale: false, // Set default value
        salePrice: null, // Set default value
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
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

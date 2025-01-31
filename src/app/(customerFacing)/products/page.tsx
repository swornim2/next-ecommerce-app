"use server";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Suspense } from "react";
import { Product, Category } from "@prisma/client";
import Footer from "@/components/Footer";

type ProductWithCategory = {
  name: string;
  id: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  description: string;
  imagePath: string;
  isAvailableForPurchase: boolean;
  categoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
  category: Category | null;
};

const getProducts = cache(async () => {
  "use server";
  try {
    console.log("[Server] Attempting to fetch all products...");
    const products = await db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { name: "asc" },
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
    });

    // Transform the data to ensure all fields are present
    const transformedProducts = products.map((product) => ({
      ...product,
      onSale: product.onSale ?? false,
      salePrice: product.salePrice ?? null,
    }));

    console.log("[Server] Found products:", transformedProducts);
    return transformedProducts;
  } catch (error) {
    console.error("[Server] Error fetching products:", error);
    return [];
  }
}, ["/products", "getProducts"]);

export default async function ProductsPage() {
  console.log("[Server] Rendering ProductsPage");
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mt-16">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our collection of high-quality products
          </p>
        </div>

        {/* Products Grid */}
        <div className="flex flex-wrap gap-6">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
              </div>
            }
          >
            <ProductList />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}

async function ProductList() {
  console.log("[Server] ProductList component rendering");
  const products = await getProducts();
  console.log("[Server] Products in ProductList:", products.length);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        console.log("Rendering product:", {
          name: product.name,
          salePrice: product.salePrice,
          onSale: product.onSale,
        });

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            salePrice={product.salePrice}
            onSale={product.onSale}
            description={product.description}
            imagePath={product.imagePath}
            isAvailableForPurchase={product.isAvailableForPurchase}
            categoryId={product.categoryId}
            categoryName={product.category?.name}
          />
        );
      })}
    </div>
  );
}

function ProductsSuspense() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

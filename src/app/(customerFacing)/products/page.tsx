import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
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

// Disable caching for this page
export const dynamic = 'force-dynamic';

async function getProducts() {
  console.log("[Server] Attempting to fetch all products...");
  try {
    const products = await db.product.findMany({
      where: { 
        isAvailableForPurchase: true,
        category: {
          isActive: true
        }
      },
      orderBy: [
        { onSale: "desc" },
        { name: "asc" }
      ],
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
      },
    });

    // Transform and filter the data
    const transformedProducts = products
      .filter(product => product.category?.isActive)
      .map((product) => ({
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
}

export default async function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mt-16">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our collection of high-quality products
          </p>
        </div>

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
  const products = await getProducts();
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12 w-full">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          No Products Available
        </h2>
        <p className="text-gray-600">
          Check back soon for new products!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
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
      ))}
    </div>
  );
}

'use server'

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import db from "@/db/db"
import { cache } from "@/lib/cache"
import { Suspense } from "react"

const getProducts = cache(
  async () => {
    'use server'
    try {
      console.log("[Server] Attempting to fetch all products...");
      const products = await db.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { name: "asc" },
      });
      console.log("[Server] Found products:", products);
      return products;
    } catch (error) {
      console.error("[Server] Error fetching products:", error);
      return [];
    }
  },
  ["/products", "getProducts"]
)

export default async function ProductsPage() {
  console.log("[Server] Rendering ProductsPage");
  return (
    <div className="bg-gray-50 min-h-screen mt-16">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mt-3">
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
                {Array(8).fill(0).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ProductsSuspense />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function ProductsSuspense() {
  console.log("[Server] ProductsSuspense component rendering");
  const products = await getProducts()
  console.log("[Server] Products in ProductsSuspense:", products.length);
  return products.map(product => <ProductCard key={product.id} {...product} />)
}

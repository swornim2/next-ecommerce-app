"use client";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  imagePath: string;
  isAvailableForPurchase: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `/api/products?category=${encodeURIComponent(params.slug)}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setProducts(data);
        if (data.length > 0 && data[0].category) {
          setCategoryName(data[0].category.name);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [params.slug]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex flex-col space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              asChild
              className="w-fit hover:bg-gray-100 -ml-3"
            >
              <Link href="/categories" className="inline-flex items-center text-gray-600">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Categories
              </Link>
            </Button>

            {/* Category Title and Description */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {categoryName || "Loading..."}
              </h1>
              <p className="text-lg text-gray-600">
                Browse our collection of {categoryName.toLowerCase() || "loading"} products
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid Section */}
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-lg mx-auto">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-[#8B7355] hover:bg-[#8B7355]/90 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-lg mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6">
                We could not find any products in this category.
              </p>
              <Button asChild className="bg-[#8B7355] hover:bg-[#8B7355]/90 text-white">
                <Link href="/">Browse All Products</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Showing {products.length} product{products.length === 1 ? '' : 's'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

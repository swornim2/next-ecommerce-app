"use client";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imagePath: string;
  isAvailableForPurchase: boolean;
  categoryId: string;
  category?: {
    name: string;
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/products?category=${encodeURIComponent(categoryName)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <Link
          href="/categories"
          className="inline-flex items-center text-[#8B7355] hover:text-[#8B7355]/80"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Categories
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          {categoryName}
        </h1>
        <p className="mt-2 text-gray-600">
          Browse our selection of {categoryName.toLowerCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
          </>
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#8B7355]/90"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No products found in this category.</p>
            <Link
              href="/products"
              className="mt-4 inline-block px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#8B7355]/90"
            >
              View All Products
            </Link>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              imagePath={product.imagePath}
              isAvailableForPurchase={product.isAvailableForPurchase}
              categoryId={product.categoryId}
              categoryName={product.category?.name}
            />
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories } from "@/app/_actions/categories";
import { getCloudinaryUrl } from "@/lib/cloudinary";

interface Category {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getCategories();
        if (result.error) {
          throw new Error(result.error);
        }
        // Filter out inactive categories
        const activeCategories = (result.categories || []).filter(
          (category) => category.isActive !== false
        );
        setCategories(activeCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen mt-16">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mt-3">
            All Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of categories and find exactly what you are
            looking for
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[410px] bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#8B7355]/90"
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex-shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] rounded-xl overflow-hidden group/card relative transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="relative h-[410px] w-full">
                  <Image
                    src={category.imagePath ? getCloudinaryUrl(category.imagePath) : "/images/placeholder.jpg"}
                    alt={category.name}
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Dark overlay with stronger gradient at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70 group-hover/card:opacity-90 transition-all duration-300" />

                  {/* Content container */}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    {/* Content wrapper for animation */}
                    <div className="transform transition-all duration-300 group-hover/card:-translate-y-2">
                      {/* Title with text shadow for better readability */}
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                        {category.name}
                      </h3>
                      {/* Description with text shadow */}
                      {category.description && (
                        <p className="text-white/90 text-sm line-clamp-2 drop-shadow-lg">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

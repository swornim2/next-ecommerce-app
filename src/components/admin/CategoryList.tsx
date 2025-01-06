"use client";

import { getCategories, toggleCategoryVisibility } from "@/app/admin/_actions/categories";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Category } from "@prisma/client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (categoryId: string) => {
    try {
      console.log('Toggling visibility for category:', categoryId);
      const result = await toggleCategoryVisibility(categoryId);
      console.log('Toggle result:', result);
      if (result.success) {
        toast.success("Category visibility updated");
        loadCategories(); // Reload the list
      } else {
        console.error('Toggle failed:', result.error);
        toast.error(result.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Error toggling category visibility:", error);
      toast.error("Failed to update category");
    }
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div className="flex items-center space-x-4">
              {category.imagePath && (
                <div className="relative w-12 h-12">
                  <Image
                    src={getCloudinaryUrl(category.imagePath)}
                    alt={category.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {category.isActive ? (
                  <EyeIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOffIcon className="w-4 h-4 text-red-500" />
                )}
                <Switch
                  checked={category.isActive}
                  onCheckedChange={() => handleToggleVisibility(category.id)}
                  aria-label={`Toggle visibility for ${category.name}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

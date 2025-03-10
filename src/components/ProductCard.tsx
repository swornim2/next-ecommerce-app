"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";
import { useCartActions } from "@/hooks/useCart";
import { useCart } from "@/lib/CartContext";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { ProductModal } from "./ProductModal";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  description: string | null;
  imagePath: string | null;
  isAvailableForPurchase?: boolean;
  categoryId?: string;
  categoryName?: string;
};

export function ProductCard({
  id,
  name,
  price,
  salePrice,
  onSale,
  description,
  imagePath,
  isAvailableForPurchase = true,
  categoryId,
  categoryName,
}: ProductCardProps) {
  const { addToCart, isLoading } = useCartActions();
  const { items, updateLocalCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOnSale = onSale === true && typeof salePrice === "number" && salePrice > 0;
  const displayPrice = isOnSale ? salePrice : price;

  const handleAddToCart = async () => {
    try {
      setError(null);
      const existingItem = items.find((item) => item.id === id);
      const updatedItems = existingItem
        ? items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [
            ...items,
            {
              id,
              name,
              description,
              imagePath: imagePath || "",
              price: displayPrice,
              salePrice,
              onSale,
              quantity: 1,
            },
          ];

      updateLocalCart(updatedItems);
      await addToCart(id);
      toast.success("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add to cart");
      toast.error("Failed to add to cart. Please try again.");
      updateLocalCart(items);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex overflow-hidden flex-col h-[500px] w-[400px] relative">
        {!isAvailableForPurchase && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xl transform -rotate-45">
              Out of Stock
            </div>
          </div>
        )}
        <div 
          className="relative w-full h-[300px] bg-gray-100 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          {!imageError && imagePath ? (
            <Image
              alt={name}
              src={getCloudinaryUrl(imagePath)}
              fill
              className={`object-cover transition-transform duration-300 hover:scale-105 ${!isAvailableForPurchase ? 'opacity-75' : ''}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              quality={85}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ImageOff className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {categoryName && (
              <div className="bg-white/90 backdrop-blur-sm text-[#8B7355] text-xs font-medium px-2 py-1 rounded-full">
                {categoryName}
              </div>
            )}
            {isOnSale && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SALE
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-1.5 p-4">
          <h3 
            className={`text-xl font-semibold leading-none tracking-tight line-clamp-1 cursor-pointer hover:text-primary ${!isAvailableForPurchase ? 'text-gray-500' : ''}`}
            onClick={() => setIsModalOpen(true)}
          >
            {name}
          </h3>
        </div>
        <div className="p-4 pt-0 mt-auto">
          <div className="mb-4">
            {isOnSale ? (
              <div className={`flex flex-col gap-1 ${!isAvailableForPurchase ? 'opacity-75' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">
                    NPR {salePrice.toLocaleString()}
                  </span>
                </div>
                <span className="text-gray-500 text-sm line-through">
                  MRP: NPR {price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className={`text-2xl font-bold ${!isAvailableForPurchase ? 'text-gray-500' : ''}`}>
                NPR {price.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isAvailableForPurchase || isLoading}
            className="w-full bg-[#000000] hover:bg-[#FF0000]/90 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading
              ? "Adding..."
              : isAvailableForPurchase
              ? "Add to Cart"
              : "Out of Stock"}
          </button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          id,
          name,
          price,
          salePrice,
          onSale,
          description: description || "",
          imagePath: imagePath || "",
          isAvailableForPurchase,
          categoryName,
        }}
        onAddToCart={handleAddToCart}
        isLoading={isLoading}
      />
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden h-[500px] w-[400px]">
      <div className="w-full h-[300px] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

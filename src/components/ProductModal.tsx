"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { Button } from "./ui/button";
import { Share2, Heart, X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    onSale: boolean;
    description: string | null;
    imagePath: string | null;
    isAvailableForPurchase?: boolean;
    categoryName?: string;
  };
  onAddToCart: () => Promise<void>;
  isLoading?: boolean;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  isLoading
}: ProductModalProps) {
  const {
    name,
    price,
    salePrice,
    onSale,
    description,
    imagePath,
    isAvailableForPurchase = true,
    categoryName,
  } = product;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // In a real app, you'd fetch these from your API
  const productImages = imagePath ? [
    imagePath,
    imagePath, // Replace with actual additional images
    imagePath,
    imagePath,
  ] : [];

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const displayPrice = onSale && salePrice ? salePrice : price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1000px] p-0 gap-0 bg-white rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row h-[90vh] md:h-[80vh] max-h-[800px]">
          {/* Left side - Image gallery */}
          <div className="w-full md:w-3/5 bg-[#f8f8f8] relative h-[40vh] md:h-full">
            <div className="relative w-full h-[300px] md:h-[400px] bg-gray-100">
              {productImages.length > 0 ? (
                <Image
                  src={getCloudinaryUrl(productImages[selectedImageIndex])}
                  alt={name}
                  fill
                  className="object-contain p-4 md:p-8"
                  priority
                  quality={90}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <ImageOff className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Navigation arrows - Hidden on mobile when there's only one image */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 md:p-2 shadow-lg transition-all"
                  >
                    <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 md:p-2 shadow-lg transition-all"
                  >
                    <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
                  </button>
                </>
              )}

              {/* Thumbnail indicators - Hidden on mobile when there's only one image */}
              {productImages.length > 1 && (
                <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                        selectedImageIndex === idx
                          ? "bg-black w-3 md:w-4"
                          : "bg-black/20 hover:bg-black/40"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Product details */}
          <div className="w-full md:w-2/5 p-4 md:p-8 flex flex-col h-[50vh] md:h-full overflow-y-auto">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="flex-1">
                {categoryName && (
                  <div className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2 uppercase tracking-wide">
                    {categoryName}
                  </div>
                )}
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{name}</h2>
              </div>
              <div className="flex gap-1.5 md:gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4 md:h-5 md:w-5 transition-colors",
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                    )} 
                  />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                >
                  <Share2 className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-black/10 transition-colors"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <div className="flex flex-wrap items-baseline gap-2 md:gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  NPR {displayPrice.toLocaleString()}
                </span>
                {onSale && salePrice && (
                  <span className="text-base md:text-lg text-gray-500 line-through">
                    NPR {price.toLocaleString()}
                  </span>
                )}
              </div>
              {onSale && salePrice && (
                <div className="inline-block bg-red-100 text-red-700 text-xs md:text-sm font-medium px-2 py-0.5 rounded">
                  Save {Math.round(((price - salePrice) / price) * 100)}%
                </div>
              )}
            </div>

            {description && (
              <div className="mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">About this item</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            <div className="sticky bottom-0 left-0 right-0 mt-auto pt-4 bg-white border-t md:border-t-0">
              <Button
                className="w-full h-10 md:h-12 text-base md:text-lg font-medium rounded-full"
                onClick={onAddToCart}
                disabled={!isAvailableForPurchase || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm md:text-base">Adding to Cart...</span>
                  </div>
                ) : (
                  <span className="text-sm md:text-base">
                    {isAvailableForPurchase ? "Add to Cart" : "Out of Stock"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

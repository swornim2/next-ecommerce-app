"use client"

import { formatCurrency } from "@/lib/formatters"
import { useCartActions } from "@/hooks/useCart"
import { useCart } from "@/lib/CartContext"
import { useState } from "react"
import { toast } from "sonner"
import Image from "next/image"

type ProductCardProps = {
  id: string
  name: string
  price: number
  description: string | null
  imagePath: string
  isAvailableForPurchase?: boolean
  categoryId?: string
  categoryName?: string
}

export function ProductCard({
  id,
  name,
  price,
  description,
  imagePath,
  isAvailableForPurchase = true,
  categoryId,
  categoryName,
}: ProductCardProps) {
  const { addToCart, isLoading } = useCartActions()
  const { items, updateLocalCart } = useCart()
  const [error, setError] = useState<string | null>(null)

  const handleAddToCart = async () => {
    try {
      setError(null)
      
      // Optimistically update the cart
      const existingItem = items.find(item => item.id === id)
      const updatedItems = existingItem
        ? items.map(item =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [
            ...items,
            {
              id,
              name,
              description,
              imagePath,
              price,
              quantity: 1,
            },
          ]
      
      updateLocalCart(updatedItems)
      
      // Make the actual API call
      await addToCart(id)
      toast.success("Added to cart!")
    } catch (err) {
      console.error("Error adding to cart:", err)
      setError("Failed to add to cart")
      toast.error("Failed to add to cart. Please try again.")
      
      // Revert the optimistic update on error
      updateLocalCart(items)
    }
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex overflow-hidden flex-col h-[500px] w-[400px]">
      <div className="relative w-full h-[300px]">
        <Image
          alt={name}
          src={imagePath}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {categoryName && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#FF0000] text-xs font-medium px-2 py-1 rounded-full">
            {categoryName}
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 p-4">
        <h3 className="text-xl font-semibold leading-none tracking-tight line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
      <div className="p-4 pt-0">
        <p className="text-2xl font-bold">
          NPR&nbsp;{price.toLocaleString()}
        </p>
      </div>
      <div className="items-center p-4 pt-0 flex gap-2 mt-auto">
        {isAvailableForPurchase ? (
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2 w-full"
          >
            Add to Cart
          </button>
        ) : (
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            disabled
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex overflow-hidden flex-col h-[500px] w-[250px]">
      <div className="relative w-full h-[300px] bg-gray-200 animate-pulse" />
      <div className="flex flex-col space-y-1.5 p-4">
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded mt-2" />
      </div>
      <div className="p-4 pt-0">
        <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="items-center p-4 pt-0 flex gap-2 mt-auto">
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  )
}

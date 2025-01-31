"use client"

import Image from "next/image"
import { useCartActions } from "@/hooks/useCart"
import { useCart } from "@/lib/CartContext"
import { CartItem as CartItemType } from "@/app/_actions/cart"
import { formatCurrency } from "@/lib/formatters"
import { Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { getCloudinaryUrl } from "@/lib/cloudinary"
import { ImageOff } from "lucide-react"

type CartItemProps = {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity } = useCartActions()
  const { items, updateLocalCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return
    if (isLoading) return

    try {
      setIsLoading(true)

      // Optimistic update
      const updatedItems = items.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ).filter((cartItem) => cartItem.quantity > 0)

      updateLocalCart(updatedItems)

      await updateQuantity(item.id, newQuantity)
      if (newQuantity === 0) {
        toast.success("Item removed from cart")
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      // Revert optimistic update
      updateLocalCart(items)
      toast.error("Failed to update quantity")
    } finally {
      setIsLoading(false)
    }
  }

  const handleIncrement = () => handleUpdateQuantity(item.quantity + 1)
  const handleDecrement = () => handleUpdateQuantity(item.quantity - 1)
  const handleRemove = () => handleUpdateQuantity(0)

  return (
    <div className="flex gap-4 items-center border-b py-4">
      <div className="relative w-24 h-24">
        {item.imagePath ? (
          <Image
            src={getCloudinaryUrl(item.imagePath)}
            alt={item.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 96px, 96px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ImageOff className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-600">{formatCurrency(item.price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={isLoading || item.quantity <= 1}
          className="h-8 w-8"
        >
          -
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={isLoading}
          className="h-8 w-8"
        >
          +
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        disabled={isLoading}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  )
}

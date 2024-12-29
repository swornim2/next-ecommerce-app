'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart as addToCartAction, updateCartItemQuantity as updateCartItemQuantityAction } from '@/app/_actions/cart'
import { useCart as useCartContext } from '@/lib/CartContext'

export function useCartActions() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { refreshCart } = useCartContext()

  const addToCart = async (productId: string) => {
    try {
      setIsLoading(true)
      await addToCartAction(productId)
      await refreshCart() // Refresh cart immediately after adding item
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setIsLoading(true)
      await updateCartItemQuantityAction(productId, quantity)
      await refreshCart() // Refresh cart immediately after updating quantity
    } catch (error) {
      console.error('Error updating cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addToCart,
    updateQuantity,
    isLoading,
  }
}

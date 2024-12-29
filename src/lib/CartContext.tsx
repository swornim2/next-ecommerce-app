"use client"

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react"
import { CartItem, getCart, updateCartItemQuantity } from "@/app/_actions/cart"

export type CartContextType = {
  itemCount: number
  items: CartItem[]
  isLoading: boolean
  error: string | null
  refreshCart: () => Promise<void>
  updateLocalCart: (items: CartItem[]) => void
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
}

const defaultContext: CartContextType = {
  itemCount: 0,
  items: [],
  isLoading: false,
  error: null,
  refreshCart: async () => {},
  updateLocalCart: () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
}

const CartContext = createContext<CartContextType>(defaultContext)

export function CartContextProvider({
  children,
  initialItems = [],
}: {
  children: ReactNode
  initialItems?: CartItem[]
}) {
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const cartItems = await getCart()
      setItems(cartItems)
    } catch (err) {
      console.error('Error refreshing cart:', err)
      setError('Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Function to update cart items locally (for optimistic updates)
  const updateLocalCart = useCallback((newItems: CartItem[]) => {
    setItems(newItems)
  }, [])

  // Function to remove item from cart
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      // Optimistically update the UI
      const newItems = items.filter(item => item.id !== productId)
      setItems(newItems)

      // Update the server
      await updateCartItemQuantity(productId, 0)
      await refreshCart() // Refresh to ensure sync with server
    } catch (err) {
      console.error('Error removing item from cart:', err)
      setError('Failed to remove item')
      await refreshCart() // Refresh to revert changes if failed
    }
  }, [items, refreshCart])

  // Function to update item quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      // Optimistically update the UI
      const newItems = items.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
      setItems(newItems)

      // Update the server
      await updateCartItemQuantity(productId, quantity)
      await refreshCart() // Refresh to ensure sync with server
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Failed to update quantity')
      await refreshCart() // Refresh to revert changes if failed
    }
  }, [items, refreshCart])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        itemCount,
        items,
        isLoading,
        error,
        refreshCart,
        updateLocalCart,
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartContextProvider')
  }
  return context
}

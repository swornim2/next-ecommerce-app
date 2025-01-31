"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/CartContext"
import { cn } from "@/lib/utils"

interface CartButtonProps {
  className?: string
}

export function CartButton({ className }: CartButtonProps) {
  const { items } = useCart()
  
  return (
    <Link href="/cart" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
      <div className={cn("relative", className)}>
        <ShoppingBag className="h-6 w-6 text-white" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
            {items.length}
          </span>
        )}
      </div>
    </Link>
  )
}

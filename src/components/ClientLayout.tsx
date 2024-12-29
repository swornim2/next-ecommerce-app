"use client"

import { Navbar } from "@/components/Navbar"
import { CartContextProvider } from "@/lib/CartContext"
import { Toaster } from "sonner"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartContextProvider>
      <Navbar />
      {children}
      <Toaster />
    </CartContextProvider>
  )
}

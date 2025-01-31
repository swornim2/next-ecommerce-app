import { cookies } from "next/headers"
import { prisma } from "./db/prisma"
import { Cart } from "@prisma/client"

export type CartItem = {
  id: string
  name: string
  imagePath: string | null
  price: number
  quantity: number
}

export async function getCart(): Promise<CartItem[]> {
  const cartId = cookies().get("cartId")?.value
  
  if (!cartId) {
    return []
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!cart) {
    return []
  }

  return cart.items.map((item: { productId: any; quantity: any; product: { name: any; imagePath: any; price: any } }) => ({
    id: item.productId,
    quantity: item.quantity,
    name: item.product.name,
    imagePath: item.product.imagePath,
    price: item.product.price
  }))
}

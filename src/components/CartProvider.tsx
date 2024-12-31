import { getCart } from "@/app/_actions/cart"
import { CartContextProvider } from "@/lib/CartContext"

export async function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const cart = await getCart()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContextProvider initialItems={cart}>
      {children}
    </CartContextProvider>
  )
}

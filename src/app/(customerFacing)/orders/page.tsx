import { getOrders } from "@/app/_actions/orders"
import { formatCurrency } from "@/lib/formatters"
import { format } from "date-fns"
import { Package } from "lucide-react"
import Image from "next/image"

export default async function OrdersPage() {
  const orders = await getOrders()

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-4">
          When you make a purchase, your orders will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg overflow-hidden bg-white"
          >
            <div className="border-b p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Order #{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">
                    Placed on {format(order.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(order.pricePaidInCents)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={order.product.imagePath}
                    alt={order.product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{order.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {order.product.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

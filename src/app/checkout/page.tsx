"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/CartContext"
import { formatCurrency } from "@/lib/formatters"
import { useState } from "react"
import Image from "next/image"
import { createOrder } from "@/app/_actions/orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { items, refreshCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    province: "",
    city: "",
    streetAddress: "",
  })

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 200 // Fixed shipping cost of NPR 200
  const total = subtotal + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      console.log('Submitting order with items:', items)
      const result = await createOrder({
        ...formData,
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total
      })

      if (result.success) {
        toast.success("Order placed successfully!")
        await refreshCart() // Refresh cart to clear items
        router.push("/") // Redirect to home page
      } else {
        console.error('Order creation failed:', result.error, result.details)
        toast.error(result.error || "Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex mt-1">
                <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                  <Image
                    src="/flags/np.svg"
                    alt="Nepal"
                    width={20}
                    height={15}
                    className="mr-2"
                  />
                  <span>+977</span>
                </div>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                  placeholder="98XXXXXXXX"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="province">Province</Label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                required
                className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Province</option>
                <option value="Koshi">Koshi</option>
                <option value="Madhesh">Madhesh</option>
                <option value="Bagmati">Bagmati</option>
                <option value="Gandaki">Gandaki</option>
                <option value="Lumbini">Lumbini</option>
                <option value="Karnali">Karnali</option>
                <option value="Sudurpashchim">Sudurpashchim</option>
              </select>
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                placeholder="Enter your city"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="streetAddress">Street Address</Label>
              <Textarea
                id="streetAddress"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                required
                placeholder="Enter your street address"
                className="mt-1"
              />
            </div>

            <div className="pt-4">
              <Label className="text-base font-semibold">Payment Method</Label>
              <div className="mt-2 flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  checked
                  readOnly
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="cod" className="text-sm font-medium text-gray-700">
                  Cash on Delivery
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Order Now"}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.imagePath}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

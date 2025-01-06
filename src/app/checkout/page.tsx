"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/CartContext";
import { formatCurrency } from "@/lib/formatters";
import { useState } from "react";
import Image from "next/image";
import { createOrder } from "@/app/_actions/orders";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Phone, User } from "lucide-react";

export default function CheckoutPage() {
  const { items, refreshCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    province: "",
    city: "",
    streetAddress: "",
  });

  const subtotal = items.reduce((acc, item) => {
    const itemPrice =
      item.onSale && item.salePrice ? item.salePrice : item.price;
    return acc + itemPrice * item.quantity;
  }, 0);
  const shipping = 200; // Fixed shipping cost of NPR 200
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting order with items:", items);
      const result = await createOrder({
        ...formData,
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.onSale && item.salePrice ? item.salePrice : item.price,
        })),
        total,
      });

      if (result.success) {
        toast.success("Order placed successfully!");
        await refreshCart();
        router.push("/");
      } else {
        console.error("Order creation failed:", result.error, result.details);
        toast.error(result.error || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>
              Please enter your delivery details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    placeholder="Full Name"
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="Email Address"
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex">
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      required
                      placeholder="98XXXXXXXX"
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div>
                  <select
                    id="province"
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                    placeholder="City"
                    className="pl-10"
                  />
                </div>

                <div>
                  <Textarea
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        streetAddress: e.target.value,
                      })
                    }
                    required
                    placeholder="Street Address"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <Label className="text-base font-semibold mb-2 block">
                    Payment Method
                  </Label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked
                      readOnly
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor="cod"
                      className="text-sm font-medium text-gray-700"
                    >
                      Cash on Delivery
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="divide-y divide-gray-200">
              {items.map((item) => {
                const displayPrice =
                  item.onSale && item.salePrice ? item.salePrice : item.price;
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image
                        src={getCloudinaryUrl(item.imagePath)}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      {item.onSale && item.salePrice ? (
                        <div>
                          <p className="text-sm font-medium text-red-600">
                            {formatCurrency(item.salePrice * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            MRP: {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

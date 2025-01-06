"use client";

import { useCart } from "@/lib/CartContext";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart();

  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.onSale && item.salePrice ? item.salePrice : item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mt-3">
              Shopping Cart
            </h1>
            <p className="text-lg text-gray-600">
              {items.length === 0
                ? "Your cart is empty"
                : `You have ${items.length} item${
                    items.length === 1 ? "" : "s"
                  } in your cart`}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-white rounded-full mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Looks like you have not added anything to your cart yet
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                  <ul className="divide-y divide-gray-100">
                    {items.map((item) => {
                      const displayPrice = item.onSale && item.salePrice ? item.salePrice : item.price;
                      return (
                        <li
                          key={item.id}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200">
                              <Image
                                src={getCloudinaryUrl(item.imagePath)}
                                alt={item.name}
                                fill
                                className="object-cover object-center"
                                sizes="(max-width: 768px) 100px, 112px"
                              />
                            </div>
                            <div className="ml-6 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-base font-medium text-gray-900">
                                    {item.name}
                                  </h3>
                                  <div className="mt-1">
                                    {item.onSale && item.salePrice ? (
                                      <div className="flex flex-col">
                                        <span className="text-sm text-red-600 font-medium">
                                          {formatCurrency(item.salePrice)}
                                        </span>
                                        <span className="text-sm text-gray-500 line-through">
                                          MRP: {formatCurrency(item.price)}
                                        </span>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-600">
                                        {formatCurrency(item.price)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg group"
                                >
                                  <span className="sr-only">Remove</span>
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    className={cn(
                                      "p-1 rounded-lg transition-colors",
                                      item.quantity <= 1
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    )}
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="text-gray-900 font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        Math.min(10, item.quantity + 1)
                                      )
                                    }
                                    className={cn(
                                      "p-1 rounded-lg transition-colors",
                                      item.quantity >= 10
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    )}
                                    disabled={item.quantity >= 10}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatCurrency(displayPrice * item.quantity)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {formatCurrency(displayPrice)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="mt-8 lg:mt-0 lg:col-span-4">
                <div className="bg-white shadow-lg rounded-2xl p-6 sticky top-24">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    Order Summary
                  </h2>
                  <div className="flow-root">
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-600">Subtotal</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {formatCurrency(subtotal)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <dt className="text-base font-medium text-gray-900">
                          Order total
                        </dt>
                        <dd className="text-base font-medium text-gray-900">
                          {formatCurrency(subtotal)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <Button
                    className="w-full mt-6 h-12 text-base"
                    asChild
                    disabled={items.length === 0}
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    Shipping & taxes calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

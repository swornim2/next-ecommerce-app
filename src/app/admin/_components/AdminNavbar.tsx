"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Store } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
]

export function AdminNavbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-[2000px] mx-auto">
        <div className="flex h-16 items-center px-4 sm:px-8">
          <div className="mr-4 flex flex-1 items-center">
            <Link 
              href="/admin" 
              className="mr-8 flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
            >
              <Store className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Admin Dashboard
              </span>
            </Link>
            <nav className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span>View Store</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

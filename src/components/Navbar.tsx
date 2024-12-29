"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { CartButton } from "./CartButton";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Categories", href: "/categories" },
  { name: "Products", href: "/products" },
  { name: "Deals", href: "/deals" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000] shadow-sm">
      <div className="max-w-[2000px] mx-auto">
        <div className="flex items-center justify-between px-4 sm:px-8 h-16">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] rounded-lg"
          >
            <Image
              src="/logo/logo.png"
              alt="Bigstar Appliances"
              width={80}
              height={40}
              className="object-contain"
            />
            
          </Link>

          {/* Navigation Links - Hidden on Mobile */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-white hover:text-[#FF0000]/80 transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] rounded-lg px-2 py-1",
                  pathname === item.href ? "text-[#FF0000]" : ""
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 rounded-full bg-gray/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray focus:border-[#8B7355] backdrop-blur-sm"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-800" />
            </div>
          </div>

          {/* Right Section - Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Button with Counter */}
            <div className="relative">
              <CartButton className="relative flex items-center justify-center h-10 w-10 rounded-full bg-[#8B7355]/10 hover:bg-[#8B7355]/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355]" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#ffffff]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355]"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search - Shown only on Mobile */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-2 rounded-full bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] backdrop-blur-sm"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-[#8B7355] hover:bg-[#8B7355]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355]",
                    pathname === item.href
                      ? "bg-[#8B7355]/10 text-[#8B7355]"
                      : ""
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

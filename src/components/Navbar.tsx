"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { searchProducts } from "@/app/_actions/search";
import { useCartActions } from "@/hooks/useCart";
import { toast } from "sonner";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { CartButton } from "./CartButton";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { getCloudinaryUrl } from "@/lib/cloudinary";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  category?: {
    id: string;
    name: string;
    description: string | null;
    imagePath: string | null;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
  };
}

const navigation = [
  { name: "Categories", href: "/categories" },
  { name: "Products", href: "/products" },
  { name: "Sale", href: "/sale" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const router = useRouter();
  const { addToCart, isLoading: isAddingToCart } = useCartActions();

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        console.log("Performing search for:", debouncedSearch);
        const results = await searchProducts(debouncedSearch);
        console.log("Received results:", results);

        if (results && results.length > 0) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
          if (debouncedSearch.trim()) {
            toast.error("No products found matching your search");
          }
        }
      } catch (error) {
        console.error("Search error in component:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleSearchSelect = (productId: string) => {
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/products/${productId}`);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      toast.success("Added to cart!");
      // Clear search after adding to cart
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const formatCurrency = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

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
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => {
                  console.log("Search input changed:", e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-10 pr-12 py-2.5 rounded-full bg-white/10 border border-gray-700/50 focus:border-[#8B7355] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/50 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[70vh] overflow-auto z-50 transform transition-all duration-200 ease-out">
                  {isSearching ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-[#8B7355] rounded-full mb-2"></div>
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="mb-2">
                        <Search className="h-6 w-6 text-gray-400 mx-auto" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No products found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="group/item px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <button
                              onClick={() => handleSearchSelect(product.id)}
                              className="flex items-center gap-4 flex-grow"
                            >
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <Image
                                  src={product.imagePath ? getCloudinaryUrl(product.imagePath) : "/placeholder.jpg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover/item:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="font-medium text-gray-900 truncate group-hover/item:text-[#8B7355] transition-colors">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {product.category?.name}
                                </div>
                                <div className="mt-1">
                                  {product.onSale && product.salePrice ? (
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-red-600 font-medium">
                                        {formatCurrency(product.salePrice)}
                                      </span>
                                      <span className="text-gray-400 text-sm line-through">
                                        {formatCurrency(product.price)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-900 font-medium">
                                      {formatCurrency(product.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product.id);
                              }}
                              size="sm"
                              className="bg-[#8B7355] hover:bg-[#8B7355]/90 text-white shadow-sm transition-all duration-200 hover:shadow-md whitespace-nowrap"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <CartButton className="text-white hover:text-white/80" />
            {/* Mobile Menu Button - Only show on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] rounded-lg md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-[#000000] border-t border-gray-800 md:hidden transition-all duration-200 ease-in-out",
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          {/* Mobile Search */}
          <div className="p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-full bg-white/10 border border-gray-700/50 focus:border-[#8B7355] text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/50 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Mobile Search Results */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[60vh] overflow-auto z-50">
                  {isSearching ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-[#8B7355] rounded-full mb-2"></div>
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="mb-2">
                        <Search className="h-6 w-6 text-gray-400 mx-auto" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No products found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="group/item px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <button
                              onClick={() => handleSearchSelect(product.id)}
                              className="flex items-center gap-4 flex-grow"
                            >
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <Image
                                  src={product.imagePath ? getCloudinaryUrl(product.imagePath) : "/placeholder.jpg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover/item:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="font-medium text-gray-900 truncate group-hover/item:text-[#8B7355] transition-colors">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {product.category?.name}
                                </div>
                                <div className="mt-1">
                                  {product.onSale && product.salePrice ? (
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-red-600 font-medium">
                                        {formatCurrency(product.salePrice)}
                                      </span>
                                      <span className="text-gray-400 text-sm line-through">
                                        {formatCurrency(product.price)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-900 font-medium">
                                      {formatCurrency(product.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product.id);
                              }}
                              size="sm"
                              className="bg-[#8B7355] hover:bg-[#8B7355]/90 text-white shadow-sm transition-all duration-200 hover:shadow-md whitespace-nowrap"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "text-[#FF0000] bg-white/5"
                      : "text-white hover:text-[#FF0000]/80 hover:bg-white/5"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

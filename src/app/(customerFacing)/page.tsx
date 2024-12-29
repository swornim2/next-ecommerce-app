"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, TrendingUp, Award, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { Suspense } from 'react'

const slides = [
  {
    title: "Premium Kitchen Appliances",
    image: "/images/cover1.jpg",
    description: "Discover our curated collection of high-end kitchen appliances designed for modern homes.",
    link: "/products",
    tag: "New Arrivals"
  },
  {
    title: "Exclusive Sale",
    image: "/images/cover2.png",
    description: "Limited time offers on our most popular home and kitchen appliances. Don't miss out!",
    link: "/products",
    tag: "Special Offer"
  },
  {
    title: "Storage Solutions",
    image: "/images/cover3.jpg",
    description: "Organize your kitchen with our premium collection of storage solutions.",
    link: "/products",
    tag: "Featured"
  }
]

const features = [
  {
    icon: Star,
    title: "Premium Quality",
    description: "Handpicked products from trusted brands"
  },
  {
    icon: TrendingUp,
    title: "Best Sellers",
    description: "Most loved by our customers"
  },
  {
    icon: Award,
    title: "Warranty Assured",
    description: "All products with warranty"
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Quick doorstep delivery"
  }
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryError, setCategoryError] = useState(null)
  const [isCategoryLoading, setIsCategoryLoading] = useState(true)

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        setIsCategoryLoading(true)
        setCategoryError(null)
        const response = await fetch('/api/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategoryError(error.message)
      } finally {
        setIsCategoryLoading(false)
      }
    }

    fetchProducts()
    fetchCategories()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Auto-sliding Carousel */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-1000",
              currentSlide === index ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-[2000px] mx-auto px-4 sm:px-8 flex items-center">
              <div className="max-w-xl text-white">
                {/* Tag */}
                <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm mb-4">
                  {slide.tag}
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl mb-8">{slide.description}</p>
                <Link
                  href={slide.link}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentSlide === index
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#F5F5DC]/30 w-full">
        <div className="max-w-[2000px] mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-3 bg-[#005B8F]/10 rounded-lg">
                  <feature.icon className="h-6 w-6 text-[#005B8F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
              <p className="mt-2 text-gray-600">Find what you need in our curated categories</p>
            </div>
            <Link 
              href="/categories"
              className="inline-flex items-center text-[#8B7355] hover:text-[#8B7355]/80 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] rounded-lg px-4 py-2"
            >
              View All
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {isCategoryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="h-72 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : categoryError ? (
            <div className="text-center py-8">
              <p className="text-red-500">{categoryError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#8B7355]/90"
              >
                Try Again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found.</p>
            </div>
          ) : (
            <div className="relative group">
              <div className="overflow-x-auto pb-4 -mb-4 flex space-x-6 snap-x">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="flex-shrink-0 w-[299px] snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] rounded-xl overflow-hidden group/card relative transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                  >
                    <div className="relative h-[410px] w-full">
                      <Image
                        src={category.imagePath || "/images/placeholder.jpg"}
                        alt={category.name}
                        fill
                        className="object-cover rounded-xl"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Dark overlay with stronger gradient at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70 group-hover/card:opacity-90 transition-all duration-300" />
                      
                      {/* Content container */}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        {/* Content wrapper for animation */}
                        <div className="transform transition-all duration-300 group-hover/card:-translate-y-2">
                          {/* Title with text shadow for better readability */}
                          <h3 className="text-white font-semibold text-xl drop-shadow-lg">
                            {category.name}
                          </h3>
                          
                          {/* Description - slides up and fades in on hover */}
                          <div className="h-0 group-hover/card:h-auto overflow-hidden transition-all duration-300">
                            <p className="text-white/0 group-hover/card:text-white/90 transform translate-y-4 group-hover/card:translate-y-0 transition-all duration-300 text-sm mt-2 line-clamp-2 drop-shadow-lg">
                              {category.description || "Explore our collection"}
                            </p>
                            
                            {/* Product count */}
                            {category._count?.products > 0 && (
                              <p className="text-white/70 text-xs mt-2 drop-shadow-lg">
                                {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Scroll Buttons - Hidden on Mobile */}
              <button
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full items-center justify-center text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-x-6 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                  if (container) {
                    container.scrollBy({ left: -440, behavior: 'smooth' });
                  }
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full items-center justify-center text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-x-6 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                  if (container) {
                    container.scrollBy({ left: 440, behavior: 'smooth' });
                  }
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 px-4 sm:px-8">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <Suspense fallback={
            <>
              {Array(4).fill(0).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </>
          }>
            {isLoading ? (
              <>
                {Array(4).fill(0).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  imagePath={product.imagePath}
                  isAvailableForPurchase={product.isAvailableForPurchase}
                  categoryId={product.categoryId}
                  categoryName={product.category?.name || ""}
                />
              ))
            )}
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  )
}

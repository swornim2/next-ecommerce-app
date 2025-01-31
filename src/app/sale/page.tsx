import { Metadata } from "next";
import { getSaleProducts } from "@/app/_actions/sale";
import { ProductCard } from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export const metadata: Metadata = {
  title: "Sale | Your Store",
  description: "Check out our amazing deals and discounts!",
};

export const dynamic = 'force-dynamic'; // Disable caching for this page

export default async function SalePage() {
  const products = await getSaleProducts();

  // Get the highest discount for the hero section
  const maxDiscount = products.length > 0 
    ? Math.round(products[0].discountPercentage) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Sale Items Available</h1>
            <p className="text-gray-600">Check back soon for new deals!</p>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 mb-12 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                  Mega Sale!
                </h1>
                <p className="text-xl mb-6">
                  Save up to {maxDiscount}% on selected items
                </p>
                <div className="inline-block bg-white text-red-600 px-6 py-3 rounded-full font-semibold text-lg">
                  Limited Time Offer
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.salePrice}
                  onSale={product.onSale}
                  description={product.description || ""}
                  imagePath={product.imagePath ? getCloudinaryUrl(product.imagePath) : null}
                  categoryName={product.category?.name}
                  isAvailableForPurchase={product.isAvailableForPurchase}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

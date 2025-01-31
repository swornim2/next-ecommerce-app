import { Metadata } from "next";
import { getSaleProducts } from "@/app/_actions/sale";
import { ProductCard } from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export const metadata: Metadata = {
  title: "Sale | BestBuy Store",
  description: "Discover amazing deals on our premium home and kitchen appliances. Shop now and save big on quality products.",
};

export default async function SalePage() {
  const products = await getSaleProducts();

  // Calculate discount percentage for sorting
  const productsWithDiscount = products.map(product => ({
    ...product,
    discountPercentage: product.salePrice 
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0
  }));

  // Sort by highest discount first
  const sortedProducts = productsWithDiscount.sort((a, b) => 
    b.discountPercentage - a.discountPercentage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-red-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 mt-16">Special Offers</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Discover incredible savings on premium appliances. Limited time offers on selected items.
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Sale Items Available
            </h2>
            <p className="text-gray-600">
              Check back soon for new deals and discounts!
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Sale Items ({sortedProducts.length})
              </h2>
              <div className="text-sm text-gray-600">
                Showing all items on sale
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
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

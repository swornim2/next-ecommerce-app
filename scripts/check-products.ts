import { PrismaClient } from "@prisma/client";
import { Product } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log("All Products:");
  products.forEach((product: Product) => {
    console.log(`\nProduct: ${product.name}`);
    console.log(`ID: ${product.id}`);
    console.log(`Available: ${product.isAvailableForPurchase}`);
    console.log(`Price: ${product.price / 100}`);
    console.log(`Image: ${product.imagePath}`);
    console.log(`Description: ${product.description}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

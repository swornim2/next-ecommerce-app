import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany()
  console.log('All Products:')
  for (const product of products) {
    console.log(`\nProduct: ${product.name}`)
    console.log(`ID: ${product.id}`)
    console.log(`Available: ${product.isAvailableForPurchase}`)
    console.log(`Price: ${product.priceInCents / 100}`)
    console.log(`Image: ${product.imagePath}`)
    console.log(`File: ${product.filePath}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

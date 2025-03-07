import { db } from "@/lib/prisma"
import { PageHeader } from "../../../_components/PageHeader"
import { ProductForm } from "../../_components/ProductForm"
import { notFound } from "next/navigation"

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const [product, categories] = await Promise.all([
    db.product.findUnique({ 
      where: { id },
      include: {
        category: true
      }
    }),
    db.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  ])

  if (!product) {
    notFound()
  }

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} categories={categories} />
    </>
  )
}

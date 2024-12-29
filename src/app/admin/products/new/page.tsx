import { PageHeader } from "../../_components/PageHeader"
import { ProductForm } from "../_components/ProductForm"
import { db } from "@/lib/prisma"

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <>
      <PageHeader>Add Product</PageHeader>
      <ProductForm categories={categories} />
    </>
  )
}

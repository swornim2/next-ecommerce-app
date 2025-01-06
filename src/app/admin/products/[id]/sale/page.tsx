import { notFound } from "next/navigation"
import { db } from "@/lib/prisma"
import { SalePriceForm } from "@/components/admin/SalePriceForm"
import { PageHeader } from "@/app/admin/_components/PageHeader"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: {
    id: string
  }
}

export default async function ProductSalePage({ params }: Props) {
  const product = await db.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      price: true,
      salePrice: true,
      onSale: true,
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader>Manage Sale Price - {product.name}</PageHeader>
      </div>

      <div className="max-w-2xl">
        <SalePriceForm
          productId={product.id}
          currentPrice={product.price}
          currentSalePrice={product.salePrice}
          onSale={product.onSale}
        />
      </div>
    </div>
  )
}

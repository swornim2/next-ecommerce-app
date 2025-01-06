import { Button } from "@/components/ui/button"
import { PageHeader } from "../_components/PageHeader"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/prisma"
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "./_components/ProductActions"
import { AddCategoryButton } from "@/components/admin/AddCategoryButton"

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  isAvailableForPurchase: boolean;
  category?: {
    name: string;
  };
  _count: {
    orders: number;
  };
}

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Products</PageHeader>
        <div className="flex gap-2">
          <AddCategoryButton />
          <Button asChild>
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        </div>
      </div>
      <ProductsTable />
    </>
  )
}

async function ProductsTable() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      salePrice: true,
      onSale: true,
      isAvailableForPurchase: true,
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Regular Price</TableHead>
            <TableHead>Sale Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product: Product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category?.name ?? "-"}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {product.onSale && product.salePrice !== null ? (
                    <>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(product.salePrice)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        SALE
                      </span>
                    </>
                  ) : (
                    "-"
                  )}
                </div>
              </TableCell>
              <TableCell>
                {product.isAvailableForPurchase ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell>{formatNumber(product._count.orders)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}/sale`}>
                        Manage Sale
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <ActiveToggleDropdownItem
                      productId={product.id}
                      isAvailable={product.isAvailableForPurchase}
                    />
                    <DeleteDropdownItem productId={product.id} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

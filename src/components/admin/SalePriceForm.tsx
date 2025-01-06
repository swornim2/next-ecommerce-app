"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { updateProductSalePrice } from "@/app/admin/_actions/products"
import { formatCurrency } from "@/lib/formatters"

interface SalePriceFormProps {
  productId: string
  currentPrice: number
  currentSalePrice: number | null
  onSale: boolean
  onUpdate?: () => void
}

export function SalePriceForm({
  productId,
  currentPrice,
  currentSalePrice,
  onSale,
  onUpdate,
}: SalePriceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [salePrice, setSalePrice] = useState(currentSalePrice || "")
  const [isSaleActive, setIsSaleActive] = useState(onSale)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProductSalePrice(productId, {
        salePrice: salePrice ? Number(salePrice) : null,
        onSale: isSaleActive,
      })

      if (result.success) {
        toast.success("Sale price updated successfully")
        onUpdate?.()
      } else {
        toast.error(result.error || "Failed to update sale price")
      }
    } catch (error) {
      console.error("Error updating sale price:", error)
      toast.error("Failed to update sale price")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Regular Price</p>
          <p className="text-lg font-semibold">{formatCurrency(currentPrice)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isSaleActive}
            onCheckedChange={setIsSaleActive}
            aria-label="Toggle sale"
          />
          <span className="text-sm font-medium">
            {isSaleActive ? "Sale Active" : "Sale Inactive"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="salePrice" className="text-sm font-medium">
          Sale Price
        </label>
        <input
          id="salePrice"
          type="number"
          min="0"
          step="1"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          disabled={!isSaleActive}
          className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter sale price"
        />
        {salePrice && Number(salePrice) >= currentPrice && (
          <p className="text-sm text-red-500">
            Sale price should be less than regular price
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={
          isLoading ||
          (isSaleActive && (!salePrice || Number(salePrice) >= currentPrice))
        }
        className="w-full bg-[#8B7355] hover:bg-[#8B7355]/90 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Updating..." : "Update Sale Price"}
      </button>
    </form>
  )
}

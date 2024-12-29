"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"
import {
  deleteProduct,
  toggleProductAvailability,
} from "../../_actions/products"
import { useRouter } from "next/navigation"

export function ActiveToggleDropdownItem({
  productId,
  isAvailable,
}: {
  productId: string
  isAvailable: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailability(productId, !isAvailable)
          router.refresh()
        })
      }}
    >
      {isAvailable ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  )
}

export function DeleteDropdownItem({
  productId,
  disabled,
}: {
  productId: string
  disabled: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(productId)
          router.refresh()
        })
      }}
    >
      Delete
    </DropdownMenuItem>
  )
}

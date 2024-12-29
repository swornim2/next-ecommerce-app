"use client"

import { Input } from "./ui/input"
import { Search } from "lucide-react"

export function SearchBar() {
  return (
    <div className="relative max-w-xl w-full">
      <Input
        type="search"
        placeholder="Search products..."
        className="pl-10 pr-4"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
    </div>
  )
}

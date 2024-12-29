"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, X } from "lucide-react"

export function AddCategoryForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB")
        return
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }

      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImage(null)
    setImagePreview(null)
    const input = document.getElementById('image') as HTMLInputElement
    if (input) {
      input.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)

      if (!name.trim()) {
        toast.error("Name is required")
        return
      }

      if (!image) {
        toast.error("Please upload a category image")
        return
      }

      // First, create the category
      const categoryResponse = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      })

      const categoryData = await categoryResponse.json()

      if (!categoryResponse.ok) {
        throw new Error(categoryData.error || "Failed to create category")
      }

      // If we have an image, upload it
      if (image) {
        const formData = new FormData()
        formData.append("file", image)
        formData.append("categoryId", categoryData.id)

        const imageResponse = await fetch("/api/upload/category", {
          method: "POST",
          body: formData,
        })

        if (!imageResponse.ok) {
          const imageData = await imageResponse.json()
          throw new Error(imageData.error || "Failed to upload image")
        }
      }

      toast.success("Category created successfully!")
      
      // Reset form
      setName("")
      setDescription("")
      setImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error(error.message || "Failed to create category")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter category description"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Category Image</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preview Section */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Category preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Upload className="w-8 h-8 mb-2" />
                <span>Preview</span>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Image Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• File types: JPG, PNG</li>
                <li>• Maximum size: 5MB</li>
                <li>• Recommended size: 800x600px</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image" className="sr-only">Choose file</Label>
              <Input
                id="image"
                type="file"
                onChange={handleImageChange}
                accept=".jpg,.jpeg,.png"
                disabled={isLoading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8B7355] file:text-white hover:file:bg-[#8B7355]/90"
              />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Create Category"}
      </Button>
    </form>
  )
}

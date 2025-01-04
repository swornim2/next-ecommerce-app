"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { addCategory } from "@/app/admin/_actions/categories"

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

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('image', image)

      const result = await addCategory(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Category created successfully!")
      
      // Reset form
      setName("")
      setDescription("")
      clearImage()
      
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Failed to create category")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter category description"
          className="h-32"
        />
      </div>

      <div>
        <Label htmlFor="image">Image</Label>
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-4">
            <Input
              id="image"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="flex-1"
              required
            />
            {imagePreview && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {imagePreview && (
            <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Category"
        )}
      </Button>
    </form>
  )
}

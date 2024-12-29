"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Upload, X } from "lucide-react";
import Image from "next/image";

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Please upload a JPG or PNG image");
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    const input = document.getElementById("image") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!image) {
      toast.error("Please upload a category image");
      return;
    }

    setIsSubmitting(true);
    let createdCategoryId: string | null = null;

    try {
      // First create the category
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create category");
      }

      createdCategoryId = responseData.id;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", image);
      formData.append("categoryId", responseData.id);

      // Upload the image
      const imageResponse = await fetch("/api/upload/category", {
        method: "POST",
        body: formData,
      });

      const imageData = await imageResponse.json();

      if (!imageResponse.ok) {
        throw new Error(
          imageData.error || imageData.details || "Failed to upload image"
        );
      }

      toast.success("Category added successfully", {
        description: `Category "${name}" has been added.`,
      });

      setOpen(false);
      setName("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      router.refresh();
    } catch (error: any) {
      console.error("Error adding category:", error);

      // If we created a category but image upload failed, clean up the category
      if (createdCategoryId) {
        try {
          await fetch(`/api/categories/${createdCategoryId}`, {
            method: "DELETE",
          });
        } catch (deleteError) {
          console.error("Failed to clean up category:", deleteError);
        }
      }

      toast.error("Error adding category", {
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border border-gray-300">
        <DialogHeader>
          <DialogTitle className="text-black">Add New Category</DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new category for your products. Categories help organize
            your products and make them easier to find.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-black">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="col-span-3 border border-gray-300 bg-white text-black focus:ring-1 focus:ring-gray-400"
              disabled={isSubmitting}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-black">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description (optional)"
              className="col-span-3 h-24 border border-gray-300 bg-white text-black focus:ring-1 focus:ring-gray-400"
              disabled={isSubmitting}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black">Category Image</Label>
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
                  <h4 className="font-medium mb-2 text-black">
                    Image Requirements:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• File types: JPG, PNG</li>
                    <li>• Maximum size: 5MB</li>
                    <li>• Recommended size: 800x600px</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="sr-only">
                    Choose file
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    onChange={handleImageChange}
                    accept=".jpg,.jpeg,.png"
                    disabled={isSubmitting}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="bg-white text-black border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !image}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              {isSubmitting ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

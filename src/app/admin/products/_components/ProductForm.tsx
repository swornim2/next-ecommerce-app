"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { Category, Product } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import {
  ActionResult,
  addProduct,
  updateProduct,
} from "../../_actions/products";

type FormState = ActionResult;

type ProductWithCategory = Product & {
  category: Category;
};

interface ProductFormProps {
  product?: ProductWithCategory | null;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  // Use direct server actions instead of useFormState
  const submitAction = async (formData: FormData) => {
    try {
      if (product) {
        // When editing, explicitly pass the existing image path
        if (product.imagePath) {
          formData.append("imagePath", product.imagePath);
        }
        return await updateProduct(product.id, null, formData);
      }
      return await addProduct(null, formData);
    } catch (error) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: "Failed to process request. Please try again.",
      };
    }
  };

  const [price, setPrice] = useState<string>(product?.price?.toString() || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    product?.categoryId || categories[0]?.id || ""
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imagePath || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure non-negative numbers only
    if (value === "" || parseInt(value) >= 0) {
      setPrice(value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    const input = document.getElementById("image") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
      setPrice("");
      setSelectedCategoryId(categories[0]?.id || "");
      clearImage();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Client-side validation
      if (!price || isNaN(Number(price)) || Number(price) < 0) {
        toast.error("Please enter a valid price", {
          duration: 3000,
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      // Validate description length
      if (descriptionLength > MAX_DESCRIPTION_LENGTH) {
        toast.error(
          `Description is too long. Please keep it under ${MAX_DESCRIPTION_LENGTH} characters.`,
          {
            duration: 3000,
            position: "top-center",
          }
        );
        setIsLoading(false);
        return;
      }

      // Prepare form data
      const formData = new FormData(e.currentTarget);
      formData.set("categoryId", selectedCategoryId);
      formData.set("price", price);

      // Reset previous form errors
      setFormError(null);

      // Submit form directly to server action
      const result = await submitAction(formData);
      console.log("Server action result:", result);

      // Handle success case
      if (result?.success) {
        // Show success toast notification
        toast.success(
          product
            ? "Product updated successfully!"
            : "Product created successfully!",
          {
            duration: 3000,
            position: "top-center",
          }
        );

        // Redirect to products page after a brief delay
        setTimeout(() => {
          window.location.href = "/admin/products";
        }, 500);
        return;
      }

      // Store form errors for display
      setFormError({
        error: result?.error,
        fieldErrors: result?.fieldErrors,
      });

      // Handle error cases
      if (result?.error) {
        toast.error(result.error, {
          duration: 5000,
          position: "top-center",
        });
      } else if (result?.fieldErrors) {
        // Handle field-specific errors
        Object.entries(result.fieldErrors as Record<string, string[]>).forEach(
          ([field, errors]) => {
            if (errors?.length) {
              toast.error(`${field}: ${errors[0]}`, {
                duration: 5000,
                position: "top-center",
              });
            }
          }
        );
      }
    } catch (err) {
      // Handle unexpected errors
      console.error("Error submitting form:", err);
      toast.error("An unexpected error occurred. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Track form state for error display
  const [formError, setFormError] = useState<{
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);

  // Track description length for validation
  const [descriptionLength, setDescriptionLength] = useState<number>(
    product?.description?.length || 0
  );
  const MAX_DESCRIPTION_LENGTH = 5000; // New limit using TEXT field type

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {formError?.fieldErrors?.name && (
          <div className="text-destructive">
            {formError.fieldErrors.name[0]}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="category" className="text-sm font-medium">
          Product Category
        </Label>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
          required
        >
          <SelectTrigger className="w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-input ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <SelectValue
              placeholder="Choose a category"
              className="text-gray-500"
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto bg-white p-1">
            <div className="py-2 px-3 text-xs font-medium text-gray-500 bg-gray-50">
              Available Categories
            </div>
            {categories.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formError?.fieldErrors?.categoryId && (
          <div className="text-destructive">
            {formError.fieldErrors.categoryId[0]}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (NPR)</Label>
        <Input
          type="number"
          id="price"
          name="price"
          required
          value={price}
          onChange={handlePriceChange}
          min="0"
          step="1"
          placeholder="Enter price in NPR"
        />
        <p className="text-sm text-muted-foreground">
          Preview: {formatCurrency(Number(price) || 0)}
        </p>
        {formError?.fieldErrors?.price && (
          <div className="text-destructive">
            {formError.fieldErrors.price[0]}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="description">Description</Label>
          <span
            className={`text-xs ${
              descriptionLength > MAX_DESCRIPTION_LENGTH
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {descriptionLength}/{MAX_DESCRIPTION_LENGTH} characters
          </span>
        </div>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description || ""}
          onChange={(e) => setDescriptionLength(e.target.value.length)}
          className={
            descriptionLength > MAX_DESCRIPTION_LENGTH
              ? "border-destructive"
              : ""
          }
          rows={6}
        />
        {descriptionLength > MAX_DESCRIPTION_LENGTH && (
          <div className="text-destructive text-sm">
            Description is too long. Please keep it under{" "}
            {MAX_DESCRIPTION_LENGTH} characters.
          </div>
        )}
        {formError?.fieldErrors?.description && (
          <div className="text-destructive">
            {formError.fieldErrors.description[0]}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Product Image</Label>
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-4">
            <Input
              id="image"
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              required={product ? false : true}
              className="flex-1"
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
                alt="Product preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        {formError?.fieldErrors?.image && (
          <div className="text-destructive">
            {formError.fieldErrors.image[0]}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-spin" />
            {product ? "Updating..." : "Creating..."}
          </>
        ) : product ? (
          "Update Product"
        ) : (
          "Create Product"
        )}
      </Button>
    </form>
  );
}

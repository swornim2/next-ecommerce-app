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
import { ActionResult, addProduct, updateProduct } from "../../_actions/products";

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
  const [error, formAction] = useFormState<FormState, FormData>(
    product == null
      ? addProduct
      : (updateProduct.bind(null, product.id) as any),
    null
  );

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
    setPrice(value);
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
      const formData = new FormData(e.currentTarget);
      formData.set("categoryId", selectedCategoryId);
      const result: ActionResult = product
        ? await updateProduct(product.id, null, formData)
        : await addProduct(null, formData);
      if (result?.success) {
        if (!product) {
          // Clear form for new product
          resetForm();
        }
        toast.success(
          product
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
        // Navigate after all local operations are complete
        router.push("/admin/products");
        router.refresh();
      } else if (result?.error) {
        toast.error(result.error);
      } else if (result?.fieldErrors) {
        // Handle field-specific errors
        Object.entries(result.fieldErrors as Record<string, string[]>).forEach(
          ([field, errors]) => {
            if (errors?.length) {
              toast.error(`${field}: ${errors[0]}`);
            }
          }
        );
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {error?.fieldErrors?.name && (
          <div className="text-destructive">{error.fieldErrors.name[0]}</div>
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
        {error?.fieldErrors?.categoryId && (
          <div className="text-destructive">
            {error.fieldErrors.categoryId[0]}
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
        />
        <p className="text-sm text-muted-foreground">
          Preview: {formatCurrency(Number(price) || 0)}
        </p>
        {error?.fieldErrors?.price && (
          <div className="text-destructive">{error.fieldErrors.price[0]}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description || ""}
        />
        {error?.fieldErrors?.description && (
          <div className="text-destructive">
            {error.fieldErrors.description[0]}
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
              required={!product}
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
        {error?.fieldErrors?.image && (
          <div className="text-destructive">{error.fieldErrors.image[0]}</div>
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

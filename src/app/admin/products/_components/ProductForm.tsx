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
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { addProduct, updateProduct } from "../../_actions/products";

type FormState = {
  name?: string[];
  description?: string[];
  price?: string[];
  categoryId?: string[];
  image?: string[];
  success?: boolean;
};

type ProductWithCategory = Product & {
  category: Category;
};

interface ProductFormProps {
  product?: ProductWithCategory | null;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [error, action] = useFormState<FormState, FormData>(
    product == null
      ? addProduct
      : (updateProduct.bind(null, product.id) as any),
    {}
  );

  const [price, setPrice] = useState<string>(product?.price?.toString() || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    product?.categoryId || categories[0]?.id || ""
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", selectedCategoryId);
    action(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {error?.name && <div className="text-destructive">{error.name}</div>}
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
        {error?.categoryId && (
          <div className="text-sm text-red-500 mt-1.5">
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              {error.categoryId}
            </span>
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
        {error?.price && <div className="text-destructive">{error.price}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description}
        />
        {error?.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required={product == null} />
        {product != null && (
          <Image
            src={product.imagePath}
            height="400"
            width="400"
            alt="Product Image"
          />
        )}
        {error?.image && <div className="text-destructive">{error.image}</div>}
      </div>

      <SubmitButton error={error} product={product} />
    </form>
  );
}

function SubmitButton({
  error,
  product,
}: {
  error: FormState;
  product?: Product | null;
}) {
  const { pending } = useFormStatus();
  const router = useRouter();

  if (error?.success) {
    toast.success("Product saved successfully!");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : product == null ? "Add Product" : "Save Changes"}
    </Button>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import { useState } from "react";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Product, Category } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FormState = {
  name?: string[];
  description?: string[];
  priceInCents?: string[];
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
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  );

  const [priceInCents, setPriceInCents] = useState<string>(
    product?.price?.toString() || ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    product?.categoryId || categories[0]?.id || ""
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceInCents(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('categoryId', selectedCategoryId);
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

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.categoryId && (
          <div className="text-destructive">{error.categoryId}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={handlePriceChange}
          min="0"
          step="1"
        />
        <div className="text-muted-foreground">
          {formatCurrency((Number(priceInCents) || 0) / 100)}
        </div>
        {error?.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
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

function SubmitButton({ error, product }: { error: FormState; product?: Product | null }) {
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
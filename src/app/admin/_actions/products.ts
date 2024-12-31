"use server";

import { db } from "@/lib/prisma";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const imageSchema = z
  .object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
  })
  .refine(
    (file) => file.size === 0 || file.type.startsWith("image/"),
    "Must be an image file"
  );

const addSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().transform((val) => parseInt(val)),
  categoryId: z.string().min(1, "Category is required"),
  image: imageSchema,
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const imageData = formData.get("image") as File | null;
  const categoryId = formData.get("categoryId") as string;

  if (!imageData) {
    return {
      image: "Image is required",
    };
  }

  if (!categoryId) {
    return {
      categoryId: "Category is required",
    };
  }

  const validatedFields = addSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    image: {
      name: imageData.name,
      size: imageData.size,
      type: imageData.type,
    },
  });

  if (!validatedFields.success) {
    return validatedFields.error.flatten().fieldErrors;
  }

  const {
    name,
    description,
    price,
    categoryId: validatedCategoryId,
  } = validatedFields.data;

  // Save image to public/products directory
  const ext = imageData.name.split(".").pop();
  const imageName = `${crypto.randomUUID()}-${imageData.name}`;
  const imagePath = `/products/${imageName}`;
  const imageBuffer = Buffer.from(await imageData.arrayBuffer());

  try {
    await fs.mkdir("public/products", { recursive: true });
    await fs.writeFile(`public${imagePath}`, imageBuffer as any);

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        imagePath,
        categoryId: validatedCategoryId,
        isAvailableForPurchase: true,
      },
    });

    // Revalidate all necessary paths
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/"); // Revalidate homepage which shows products
    return { success: true };
  } catch (error) {
    console.error("Error saving product:", error);
    return { error: "Failed to save product" };
  }
}

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const imageData = formData.get("image") as File | null;
  const categoryId = formData.get("categoryId") as string;

  if (!categoryId) {
    return {
      categoryId: "Category is required",
    };
  }

  const validatedFields = addSchema
    .omit({ image: true })
    .extend({
      image: imageSchema.optional(),
    })
    .safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      categoryId: formData.get("categoryId"),
      image: imageData && {
        name: imageData.name,
        size: imageData.size,
        type: imageData.type,
      },
    });

  if (!validatedFields.success) {
    return validatedFields.error.flatten().fieldErrors;
  }

  const {
    name,
    description,
    price,
    categoryId: validatedCategoryId,
  } = validatedFields.data;

  try {
    let imagePath = undefined;

    if (imageData) {
      // Save new image
      const ext = imageData.name.split(".").pop();
      const imageName = `${crypto.randomUUID()}-${imageData.name}`;
      imagePath = `/products/${imageName}`;
      const imageBuffer = Buffer.from(await imageData.arrayBuffer());

      await fs.mkdir("public/products", { recursive: true });
      await fs.writeFile(`public${imagePath}`, imageBuffer as any);

      // Delete old image
      const oldProduct = await db.product.findUnique({ where: { id } });
      if (oldProduct?.imagePath) {
        await fs.unlink(`public${oldProduct.imagePath}`).catch(() => {});
      }
    }

    await db.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        categoryId: validatedCategoryId,
        ...(imagePath && { imagePath }),
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  try {
    await db.product.update({
      where: { id },
      data: { isAvailableForPurchase },
    });

    // Revalidate all necessary paths
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/"); // Revalidate homepage which shows products
  } catch (error) {
    console.error("Error toggling product availability:", error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({
      where: { id },
    });

    // Revalidate all necessary paths
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/"); // Revalidate homepage which shows products
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

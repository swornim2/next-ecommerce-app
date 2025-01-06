"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary.server";

export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

const imageSchema = z
  .object({
    name: z.string(),
    size: z.number(),
    type: z
      .string()
      .refine((val) => val.startsWith("image/"), "Must be an image file"),
  })
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "Image must be less than 5MB"
  );

const addSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().transform((val) => parseInt(val)),
  categoryId: z.string().min(1, "Category is required"),
  image: imageSchema,
});

async function handleImageUpload(imageData: File) {
  try {
    const imageBuffer = Buffer.from(await imageData.arrayBuffer());
    const result = await uploadToCloudinary(imageBuffer);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

export async function addProduct(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const imageFile = formData.get("image") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const categoryId = formData.get("categoryId") as string;

    const validatedFields = addSchema.safeParse({
      name,
      description,
      price,
      categoryId,
      image: {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      },
    });

    if (!validatedFields.success) {
      return {
        success: false,
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const uploadResult = await handleImageUpload(imageFile);

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseInt(price),
        categoryId,
        imagePath: uploadResult.public_id,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      success: false,
      error: "Failed to add product. Please try again.",
    };
  }
}

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const categoryId = formData.get("categoryId") as string;
    const imageData = formData.get("image") as File | null;

    const updateData: any = {
      name,
      description,
      price: parseInt(price),
      categoryId,
    };

    if (imageData && imageData.size > 0) {
      const validatedImage = imageSchema.safeParse({
        name: imageData.name,
        size: imageData.size,
        type: imageData.type,
      });

      if (!validatedImage.success) {
        return {
          success: false,
          fieldErrors: validatedImage.error.flatten().fieldErrors,
        };
      }

      const uploadResult = await handleImageUpload(imageData);
      updateData.imagePath = uploadResult.public_id;

      // Delete old image from Cloudinary
      const oldProduct = await db.product.findUnique({
        where: { id },
      });

      if (oldProduct?.imagePath) {
        try {
          await deleteFromCloudinary(oldProduct.imagePath);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
    }

    await db.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Failed to update product. Please try again.",
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Delete image from Cloudinary if exists
    if (product.imagePath) {
      try {
        await deleteFromCloudinary(product.imagePath);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await db.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Failed to delete product. Please try again.",
    };
  }
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
): Promise<ActionResult> {
  try {
    await db.product.update({
      where: { id },
      data: { isAvailableForPurchase },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error toggling product availability:", error);
    return {
      success: false,
      error: "Failed to update product availability. Please try again.",
    };
  }
}

export async function updateProductSalePrice(
  productId: string,
  data: {
    salePrice: number | null;
    onSale: boolean;
  }
) {
  try {
    const product = await db.product.update({
      where: { id: productId },
      data: {
        salePrice: data.salePrice,
        onSale: data.onSale,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true, product };
  } catch (error) {
    console.error('Error updating product sale price:', error);
    return { success: false, error: 'Failed to update product sale price' };
  }
}

"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";

export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

async function uploadToCloudinary(imageData: File) {
  const imageBuffer = Buffer.from(await imageData.arrayBuffer());

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        resource_type: "auto",
        transformation: [{ quality: "auto:best" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const bufferStream = require("stream").Readable.from(imageBuffer);
    bufferStream.pipe(uploadStream);
  });
}

export async function addProduct(prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const imageData = formData.get("image") as File | null;
    const categoryId = formData.get("categoryId") as string;

    if (!imageData) {
      return {
        success: false,
        fieldErrors: { image: ["Image is required"] }
      };
    }

    if (!categoryId) {
      return {
        success: false,
        fieldErrors: { categoryId: ["Category is required"] }
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
      return {
        success: false,
        fieldErrors: validatedFields.error.flatten().fieldErrors
      };
    }

    const {
      name,
      description,
      price,
      categoryId: validatedCategoryId,
    } = validatedFields.data;

    // Upload image to Cloudinary
    const uploadResult = (await uploadToCloudinary(imageData)) as any;

    // Create product with Cloudinary URL
    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        categoryId: validatedCategoryId,
        imagePath: uploadResult.secure_url,
      },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error in addProduct:", error);
    return {
      success: false,
      error: "Failed to create product. Please try again."
    };
  }
}

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const imageData = formData.get("image") as File | null;
    const categoryId = formData.get("categoryId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;

    if (!categoryId) {
      return {
        success: false,
        fieldErrors: { categoryId: ["Category is required"] }
      };
    }

    const updateData: any = {
      name,
      description,
      price: parseInt(price),
      categoryId,
    };

    // If new image is provided, upload it
    if (imageData && imageData.size > 0) {
      const validatedImage = imageSchema.safeParse({
        name: imageData.name,
        size: imageData.size,
        type: imageData.type,
      });

      if (!validatedImage.success) {
        return {
          success: false,
          fieldErrors: validatedImage.error.flatten().fieldErrors
        };
      }

      const uploadResult = (await uploadToCloudinary(imageData)) as any;
      updateData.imagePath = uploadResult.secure_url;

      // Optionally: Delete old image from Cloudinary
      const oldProduct = await db.product.findUnique({
        where: { id },
        select: { imagePath: true },
      });

      if (oldProduct?.imagePath) {
        try {
          const publicId = oldProduct.imagePath.split("/").pop()?.split(".")[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`products/${publicId}`);
          }
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
    }

    // Update product
    await db.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return {
      success: false,
      error: "Failed to update product. Please try again."
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
    return { success: true };
  } catch (error) {
    console.error("Error toggling availability:", error);
    return {
      success: false,
      error: "Failed to toggle product availability. Please try again."
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      select: { imagePath: true },
    });

    // Delete image from Cloudinary if it exists
    if (product?.imagePath) {
      try {
        const publicId = product.imagePath.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`products/${publicId}`);
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await db.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Failed to delete product. Please try again."
    };
  }
}

'use server'

import { db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

export async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

export async function addCategory(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageData = formData.get('image') as File | null

  if (!name) {
    return {
      error: 'Category name is required'
    }
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    let imageUrl = null
    
    if (imageData) {
      // Validate image
      const imageValidation = imageSchema.safeParse({
        name: imageData.name,
        size: imageData.size,
        type: imageData.type,
      });

      if (!imageValidation.success) {
        return {
          error: 'Invalid image file'
        }
      }

      // Upload to Cloudinary
      const imageBuffer = Buffer.from(await imageData.arrayBuffer())
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'categories',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )

        const bufferStream = require('stream').Readable.from(imageBuffer)
        bufferStream.pipe(uploadStream)
      })

      const uploadResult = await uploadPromise as any
      imageUrl = uploadResult.secure_url
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        imagePath: imageUrl
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/')
    
    return { success: true, category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { error: 'Failed to create category' }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageData = formData.get('image') as File | null

  if (!name) {
    return {
      error: 'Category name is required'
    }
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    let imageUrl = undefined

    if (imageData) {
      // Validate image
      const imageValidation = imageSchema.safeParse({
        name: imageData.name,
        size: imageData.size,
        type: imageData.type,
      });

      if (!imageValidation.success) {
        return {
          error: 'Invalid image file'
        }
      }

      // Upload to Cloudinary
      const imageBuffer = Buffer.from(await imageData.arrayBuffer())
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'categories',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )

        const bufferStream = require('stream').Readable.from(imageBuffer)
        bufferStream.pipe(uploadStream)
      })

      const uploadResult = await uploadPromise as any
      imageUrl = uploadResult.secure_url
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        ...(imageUrl && { imagePath: imageUrl })
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/')
    
    return { success: true, category }
  } catch (error) {
    console.error('Error updating category:', error)
    return { error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id }
    })

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { error: 'Failed to delete category' }
  }
}

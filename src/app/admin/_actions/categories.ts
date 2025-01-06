'use server'

import { db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadToCloudinary } from '@/lib/cloudinary.server'
import { z } from 'zod'

// Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

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

export async function getActiveCategories() {
  try {
    return await db.category.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching active categories:', error)
    throw new Error('Failed to fetch active categories')
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

    let imagePath = null
    if (imageData && imageData.size > 0) {
      const buffer = Buffer.from(await imageData.arrayBuffer())
      
      // Ensure we're uploading with the correct options
      const result = await uploadToCloudinary(buffer, {
        folder: 'categories',
        resource_type: 'image',
        unique_filename: true, // Ensure unique filenames
        format: 'jpg',  // Force jpg format
        transformation: [
          { width: 800, height: 800, crop: 'fill' }, // Resize to standard size
          { quality: 'auto:best' }, // Optimize quality
          { fetch_format: 'auto' } // Auto format for browser
        ]
      })
      
      // Log the result to debug
      console.log('Cloudinary upload result:', result)
      
      imagePath = result.public_id
    }

    const category = await db.category.create({
      data: {
        name,
        description,
        slug,
        imagePath
      }
    })

    revalidatePath('/admin/categories')
    revalidatePath('/categories')
    return { success: true, category }
  } catch (error) {
    console.error('Error adding category:', error)
    return {
      error: 'Failed to add category'
    }
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
    
    let imagePath = undefined

    if (imageData && imageData.size > 0) {
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
      const buffer = Buffer.from(await imageData.arrayBuffer())
      const result = await uploadToCloudinary(buffer, {
        folder: 'categories', // Store in root level categories folder
        resource_type: 'image'
      })
      imagePath = result.public_id
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        ...(imagePath && { imagePath })
      }
    })

    revalidatePath('/admin/categories')
    revalidatePath('/categories')
    return { success: true, category }
  } catch (error) {
    console.error('Error updating category:', error)
    return { error: 'Failed to update category' }
  }
}

export async function toggleCategoryVisibility(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Server: Toggling category visibility for ID:', id);
    const category = await db.category.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        name: true
      }
    });

    if (!category) {
      console.log('Server: Category not found');
      return { success: false, error: 'Category not found' };
    }

    console.log('Server: Current category state:', category);
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        isActive: !category.isActive,
        updatedAt: new Date()
      },
      select: {
        id: true,
        isActive: true,
        name: true
      }
    });

    console.log('Server: Category updated:', updatedCategory);

    // Revalidate necessary paths
    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    
    return { success: true };
  } catch (error) {
    console.error('Server: Error toggling category visibility:', error);
    return {
      success: false,
      error: 'Failed to toggle category visibility'
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id }
    })

    revalidatePath('/admin/categories')
    revalidatePath('/categories')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { error: 'Failed to delete category' }
  }
}

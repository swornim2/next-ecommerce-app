'use server'

import { db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

export async function addCategory({
  name,
  description
}: {
  name: string
  description?: string
}) {
  if (!name) {
    throw new Error('Category name is required')
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const category = await db.category.create({
      data: {
        name,
        slug,
        description
      }
    })

    revalidatePath('/admin/products')
    return category
  } catch (error) {
    console.error('Error creating category:', error)
    throw new Error('Failed to create category')
  }
}

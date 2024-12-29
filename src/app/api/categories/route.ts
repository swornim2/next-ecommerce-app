import { NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)

    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()
    // Create a URL-friendly slug from the name
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    console.log('Generated slug:', slug)

    // Check if category with same name or slug exists
    // For SQLite, we'll convert to lowercase for comparison
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: trimmedName,
            }
          },
          {
            slug: {
              equals: slug,
            }
          }
        ]
      }
    })

    if (existingCategory) {
      console.log('Found existing category:', existingCategory)
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Create the category
    console.log('Creating category with data:', { name: trimmedName, slug, description })
    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null, // Ensure description is null if not provided
      },
    })

    console.log('Created category:', category)
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    )
  }
}

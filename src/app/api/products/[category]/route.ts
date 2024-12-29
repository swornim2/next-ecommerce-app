import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        slug: params.category
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

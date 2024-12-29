import { NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const category = await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

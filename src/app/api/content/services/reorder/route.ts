import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    // Update all items with new order
    await Promise.all(
      items.map((item: { id: string; order: number }) =>
        prisma.service.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering services:', error)
    return NextResponse.json(
      { error: 'Sıralama güncellenemedi' },
      { status: 500 }
    )
  }
}

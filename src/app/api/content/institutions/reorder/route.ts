import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items geçerli bir dizi olmalı' },
        { status: 400 }
      )
    }

    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.institutionItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2025' || err.message?.includes('Record to update does not exist')) {
      return NextResponse.json(
        { error: 'Güncellenecek kurum bulunamadı' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Sıralama güncellenemedi' },
      { status: 500 }
    )
  }
}

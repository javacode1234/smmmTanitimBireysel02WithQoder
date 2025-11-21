import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.heroSection.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error: unknown) {
    console.error('Error fetching hero items:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const item = await prisma.heroSection.create({
      data,
    })
    return NextResponse.json(item)
  } catch (error: unknown) {
    console.error('Error creating hero item:', error)
    const msg = error instanceof Error ? error.message : String(error)
    if ((error as { code?: string })?.code === 'P2021' || msg.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Hero yönetimi mevcut veritabanı şemasında desteklenmiyor' },
        { status: 501 }
      )
    }
    return NextResponse.json(
      { error: 'Hero eklenemedi' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const item = await prisma.heroSection.update({
      where: { id },
      data,
    })

    return NextResponse.json(item)
  } catch (error: unknown) {
    console.error('Error updating hero item:', error)
    const msg = error instanceof Error ? error.message : String(error)
    if ((error as { code?: string })?.code === 'P2021' || msg.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Hero yönetimi mevcut veritabanı şemasında desteklenmiyor' },
        { status: 501 }
      )
    }
    return NextResponse.json(
      { error: 'Hero güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      )
    }

    await prisma.heroSection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting hero item:', error)
    const msg = error instanceof Error ? error.message : String(error)
    if ((error as { code?: string })?.code === 'P2021' || msg.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Hero yönetimi mevcut veritabanı şemasında desteklenmiyor' },
        { status: 501 }
      )
    }
    return NextResponse.json(
      { error: 'Hero silinemedi' },
      { status: 500 }
    )
  }
}

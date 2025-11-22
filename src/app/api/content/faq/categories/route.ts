import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Default categories
function getDefaultCategories() {
  return [
    { id: "default-1", name: "Genel", slug: "genel", order: 0 },
    { id: "default-2", name: "Hizmetler", slug: "hizmetler", order: 1 },
    { id: "default-3", name: "Ücretlendirme", slug: "ucretlendirme", order: 2 },
    { id: "default-4", name: "İşlemler", slug: "islemler", order: 3 },
    { id: "default-5", name: "Teknik", slug: "teknik", order: 4 }
  ];
}

export async function GET() {
  try {
    const categories = await prisma.faqcategory.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    if (!categories || categories.length === 0) {
      return NextResponse.json(getDefaultCategories())
    }

    return NextResponse.json(categories)
  } catch (error: unknown) {
    console.error('Error fetching FAQ categories:', error)
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      return NextResponse.json(getDefaultCategories())
    }
    return NextResponse.json(getDefaultCategories())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Name ve slug zorunludur' },
        { status: 400 }
      )
    }
    
    const category = await prisma.faqcategory.create({
      data: {
        id: randomUUID(),
        name: String(data.name),
        slug: String(data.slug),
        order: Number(data.order ?? 0),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating FAQ category:', error)
    return NextResponse.json(
      { error: 'Kategori eklenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
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
    
    try {
      const category = await prisma.faqcategory.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          order: data.order,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(category)
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to update does not exist')) {
        return NextResponse.json(
          { error: 'Kategori bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }
  } catch (error) {
    console.error('Error updating FAQ category:', error)
    return NextResponse.json(
      { error: 'Kategori güncellenemedi' },
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

    try {
      await prisma.faqcategory.delete({
        where: { id }
      })
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Kategori bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ category:', error)
    return NextResponse.json(
      { error: 'Kategori silinemedi' },
      { status: 500 }
    )
  }
}

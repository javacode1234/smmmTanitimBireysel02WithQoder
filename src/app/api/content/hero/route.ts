import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.heroSection.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error: any) {
    console.error('Error fetching hero items:', error)
    // Handle missing table (P2021) - return empty array
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json([])
    }
    return NextResponse.json(
      { error: 'Hero bölümü alınamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const item = await prisma.heroSection.create({
      data,
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating hero item:', error)
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
  } catch (error) {
    console.error('Error updating hero item:', error)
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
  } catch (error) {
    console.error('Error deleting hero item:', error)
    return NextResponse.json(
      { error: 'Hero silinemedi' },
      { status: 500 }
    )
  }
}

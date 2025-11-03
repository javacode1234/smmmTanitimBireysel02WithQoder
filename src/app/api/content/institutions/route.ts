import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.clientLogo.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error: any) {
    console.error('Error fetching client logos:', error)
    // Handle missing table (P2021) - return empty array
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json([])
    }
    return NextResponse.json(
      { error: 'Kurum logoları alınamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const item = await prisma.clientLogo.create({
      data,
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating client logo:', error)
    return NextResponse.json(
      { error: 'Kurum eklenemedi' },
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
    const item = await prisma.clientLogo.update({
      where: { id },
      data,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating client logo:', error)
    return NextResponse.json(
      { error: 'Kurum güncellenemedi' },
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

    await prisma.clientLogo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client logo:', error)
    return NextResponse.json(
      { error: 'Kurum silinemedi' },
      { status: 500 }
    )
  }
}

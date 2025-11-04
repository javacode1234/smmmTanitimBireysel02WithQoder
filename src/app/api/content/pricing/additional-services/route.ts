import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default additional services
function getDefaultServices() {
  return [
    {
      id: "default-1",
      text: "Şirket kuruluş işlemleri (2.500₺ - 5.000₺)",
      isActive: true,
      order: 0
    },
    {
      id: "default-2",
      text: "E-Dönüşüm danışmanlığı (1.500₺/ay)",
      isActive: true,
      order: 1
    },
    {
      id: "default-3",
      text: "Özel proje bazlı finansal analiz",
      isActive: true,
      order: 2
    },
    {
      id: "default-4",
      text: "Vergi incelemesi desteği",
      isActive: true,
      order: 3
    }
  ];
}

export async function GET() {
  try {
    const services = await prisma.additionalService.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    if (!services || services.length === 0) {
      return NextResponse.json(getDefaultServices())
    }

    return NextResponse.json(services)
  } catch (error: any) {
    console.error('Error fetching additional services:', error)
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(getDefaultServices())
    }
    return NextResponse.json(getDefaultServices())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.text) {
      return NextResponse.json(
        { error: 'Text zorunludur' },
        { status: 400 }
      )
    }
    
    const service = await prisma.additionalService.create({
      data: {
        text: String(data.text),
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0)
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating additional service:', error)
    return NextResponse.json(
      { error: 'Hizmet eklenemedi' },
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
    
    const service = await prisma.additionalService.update({
      where: { id },
      data: {
        text: data.text,
        isActive: data.isActive,
        order: data.order
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating additional service:', error)
    return NextResponse.json(
      { error: 'Hizmet güncellenemedi' },
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

    await prisma.additionalService.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting additional service:', error)
    return NextResponse.json(
      { error: 'Hizmet silinemedi' },
      { status: 500 }
    )
  }
}

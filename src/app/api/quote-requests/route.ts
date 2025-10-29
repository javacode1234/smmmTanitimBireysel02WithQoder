import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { QuoteStatus } from '@prisma/client'

export async function GET() {
  try {
    const requests = await prisma.quoteRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching quote requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, serviceType, message } = await request.json()

    if (!name || !email || !phone || !company || !serviceType) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        name,
        email,
        phone,
        company,
        serviceType,
        message,
        status: 'NEW' as QuoteStatus,
      },
    })

    return NextResponse.json(
      { message: 'Teklif talebiniz başarıyla gönderildi', quoteRequest },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating quote request:', error)
    return NextResponse.json(
      { error: 'Teklif talebi gönderilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    const quoteRequest = await prisma.quoteRequest.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(quoteRequest)
  } catch (error) {
    console.error('Error updating quote request:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
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
        { error: 'ID gereklidir' },
        { status: 400 }
      )
    }

    await prisma.quoteRequest.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Teklif talebi başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting quote request:', error)
    return NextResponse.json(
      { error: 'Teklif talebi silinirken hata oluştu' },
      { status: 500 }
    )
  }
}

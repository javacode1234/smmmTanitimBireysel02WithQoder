import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'
// import { QuoteStatus } from '@prisma/client' - using string literals instead

export async function GET() {
  try {
    // Check if the model exists
    if (!prisma.quoterequest) {
      console.log('quoterequest model not found in prisma schema')
      return NextResponse.json([])
    }
    
    const requests = await prisma.quoterequest.findMany({
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
    // Check if the model exists
    if (!prisma.quoterequest) {
      console.log('quoterequest model not found in prisma schema')
      return NextResponse.json(
        { error: 'Quote requests not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { name, email, phone, company, serviceType, message } = await request.json()

    if (!name || !email || !phone || !company || !serviceType) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    const quoteRequest = await prisma.quoterequest.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        company,
        serviceType,
        message,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
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
    // Check if the model exists
    if (!prisma.quoterequest) {
      console.log('quoterequest model not found in prisma schema')
      return NextResponse.json(
        { error: 'Quote requests not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { id, status } = await request.json()

    const quoteRequest = await prisma.quoterequest.update({
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
    // Check if the model exists
    if (!prisma.quoterequest) {
      console.log('quoterequest model not found in prisma schema')
      return NextResponse.json(
        { error: 'Quote requests not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gereklidir' },
        { status: 400 }
      )
    }

    await prisma.quoterequest.delete({
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
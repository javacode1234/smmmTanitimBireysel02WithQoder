import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { firstName, lastName, email, phone, companyName, packageType, message } = body

    console.log('Received data:', { firstName, lastName, email, phone, packageType })

    if (!firstName || !lastName || !email || !phone || !packageType) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Check if prisma.quoteRequest exists
    if (!prisma.quoteRequest) {
      console.error('Prisma QuoteRequest model not found!')
      return NextResponse.json(
        { error: 'Database model not available. Please restart the server.' },
        { status: 500 }
      )
    }

    // Save to database
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        companyName: companyName || null,
        packageType,
        message: message || null,
        status: 'PENDING',
      },
    })

    console.log('Quote request created:', quoteRequest.id)

    return NextResponse.json({ 
      success: true, 
      quoteRequest 
    })
  } catch (error) {
    console.error('Quote request error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: 'Teklif isteği kaydedilemedi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where = status ? { status: status as any } : {}
    
    const quoteRequests = await prisma.quoteRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ quoteRequests })
  } catch (error) {
    console.error('Get quote requests error:', error)
    return NextResponse.json(
      { error: 'Teklif istekleri yüklenemedi' },
      { status: 500 }
    )
  }
}

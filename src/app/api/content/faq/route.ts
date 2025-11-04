import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      include: {
        category: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(faqs)
  } catch (error: any) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('POST /api/content/faq - Received data:', JSON.stringify(data, null, 2))
    
    if (!data.categoryId || !data.question || !data.answer) {
      console.error('POST /api/content/faq - Missing required fields')
      return NextResponse.json(
        { error: 'CategoryId, question ve answer zorunludur', details: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const faq = await prisma.fAQ.create({
      data: {
        categoryId: String(data.categoryId),
        question: String(data.question),
        answer: String(data.answer),
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0)
      },
      include: {
        category: true
      }
    })

    console.log('POST /api/content/faq - FAQ created successfully:', faq.id)
    return NextResponse.json(faq)
  } catch (error) {
    console.error('POST /api/content/faq - Error creating FAQ:', error)
    return NextResponse.json(
      { 
        error: 'Soru eklenemedi', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
    
    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        question: data.question,
        answer: data.answer,
        isActive: data.isActive,
        order: data.order
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Soru güncellenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
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

    await prisma.fAQ.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Soru silinemedi' },
      { status: 500 }
    )
  }
}

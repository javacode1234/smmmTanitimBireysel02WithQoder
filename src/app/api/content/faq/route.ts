import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      include: {
        faqcategory: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    const normalized = faqs.map((f) => {
      const category = (f as { faqcategory?: unknown }).faqcategory
      return { ...f, category }
    })
    return NextResponse.json(normalized)
  } catch (error: unknown) {
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
    
    const faq = await prisma.faq.create({
      data: {
        id: randomUUID(),
        categoryId: String(data.categoryId),
        question: String(data.question),
        answer: String(data.answer),
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0),
        updatedAt: new Date()
      },
      include: {
        faqcategory: true
      }
    })

    console.log('POST /api/content/faq - FAQ created successfully:', faq.id)
    return NextResponse.json({ ...faq, category: (faq as { faqcategory?: unknown }).faqcategory })
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
    
    try {
      const faq = await prisma.faq.update({
        where: { id },
        data: {
          categoryId: data.categoryId,
          question: data.question,
          answer: data.answer,
          isActive: data.isActive,
          order: data.order,
          updatedAt: new Date()
        },
        include: {
          faqcategory: true
        }
      })
      return NextResponse.json({ ...faq, category: (faq as { faqcategory?: unknown }).faqcategory })
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to update does not exist')) {
        return NextResponse.json(
          { error: 'Soru bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }
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

    try {
      await prisma.faq.delete({
        where: { id }
      })
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Soru bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Soru silinemedi' },
      { status: 500 }
    )
  }
}

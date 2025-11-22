import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const DEFAULT_SECTION_DATA = {
  title: "Sıkça Sorulan Sorular",
  paragraph: "Mali müşavirlik hizmetlerimiz hakkında merak ettikleriniz. Sorunuzun cevabını bulamadıysanız, bize ulaşın."
}

export async function GET() {
  try {
    const section = await prisma.faqsection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: unknown) {
    console.error('Error fetching FAQ section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.faqsection.findFirst()
    
    let section
    if (existingSection) {
      section = await prisma.faqsection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph,
          updatedAt: new Date()
        }
      })
    } else {
      section = await prisma.faqsection.create({
        data: {
          id: randomUUID(),
          title: data.title,
          paragraph: data.paragraph,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error saving FAQ section:', error)
    return NextResponse.json(
      { error: 'Bölüm kaydedilemedi' },
      { status: 500 }
    )
  }
}

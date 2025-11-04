import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SECTION_DATA = {
  title: "Sıkça Sorulan Sorular",
  paragraph: "Mali müşavirlik hizmetlerimiz hakkında merak ettikleriniz. Sorunuzun cevabını bulamadıysanız, bize ulaşın."
}

export async function GET() {
  try {
    const section = await prisma.fAQSection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: any) {
    console.error('Error fetching FAQ section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.fAQSection.findFirst()
    
    let section
    if (existingSection) {
      section = await prisma.fAQSection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph
        }
      })
    } else {
      section = await prisma.fAQSection.create({
        data: {
          title: data.title,
          paragraph: data.paragraph
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

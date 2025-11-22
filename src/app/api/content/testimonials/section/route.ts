import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const DEFAULT_SECTION_DATA = {
  title: "Müşterilerimiz Ne Diyor?",
  paragraph: "500'den fazla mutlu müşterimizin deneyimleri. Güven ve memnuniyet odaklı hizmet anlayışımızın en büyük kanıtı."
}

export async function GET() {
  try {
    const section = await prisma.testimonialssection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: unknown) {
    console.error('Error fetching testimonials section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.testimonialssection.findFirst()
    
    let section
    if (existingSection) {
      section = await prisma.testimonialssection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph,
          updatedAt: new Date()
        }
      })
    } else {
      section = await prisma.testimonialssection.create({
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
    console.error('Error saving testimonials section:', error)
    return NextResponse.json(
      { error: 'Bölüm kaydedilemedi' },
      { status: 500 }
    )
  }
}

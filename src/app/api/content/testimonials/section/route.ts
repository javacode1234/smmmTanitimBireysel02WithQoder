import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SECTION_DATA = {
  title: "Müşterilerimiz Ne Diyor?",
  paragraph: "500'den fazla mutlu müşterimizin deneyimleri. Güven ve memnuniyet odaklı hizmet anlayışımızın en büyük kanıtı."
}

export async function GET() {
  try {
    const section = await prisma.testimonialsSection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: any) {
    console.error('Error fetching testimonials section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.testimonialsSection.findFirst()
    
    let section
    if (existingSection) {
      section = await prisma.testimonialsSection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph
        }
      })
    } else {
      section = await prisma.testimonialsSection.create({
        data: {
          title: data.title,
          paragraph: data.paragraph
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

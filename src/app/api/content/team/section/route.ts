import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SECTION_DATA = {
  title: "Uzman Ekibimiz",
  paragraph: "Alanında uzman, deneyimli ve sertifikalı mali müşavirlerimiz ile işletmenizin mali süreçlerini güvenle yönetiyoruz."
}

export async function GET() {
  try {
    const section = await prisma.teamSection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: any) {
    console.error('Error fetching team section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.teamSection.findFirst()
    
    let section
    if (existingSection) {
      section = await prisma.teamSection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph
        }
      })
    } else {
      section = await prisma.teamSection.create({
        data: {
          title: data.title,
          paragraph: data.paragraph
        }
      })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error saving team section:', error)
    return NextResponse.json(
      { error: 'Bölüm kaydedilemedi' },
      { status: 500 }
    )
  }
}

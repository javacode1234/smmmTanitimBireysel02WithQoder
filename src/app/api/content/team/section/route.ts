import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const DEFAULT_SECTION_DATA = {
  title: "Uzman Ekibimiz",
  paragraph: "Alanında uzman, deneyimli ve sertifikalı mali müşavirlerimiz ile işletmenizin mali süreçlerini güvenle yönetiyoruz."
}

export async function GET() {
  try {
    const section = await prisma.teamsection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: unknown) {
    console.error('Error fetching team section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.teamsection.findFirst()
    
    let section
    if (existingSection) {
      section = await prisma.teamsection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph,
          updatedAt: new Date()
        }
      })
    } else {
      section = await prisma.teamsection.create({
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
    console.error('Error saving team section:', error)
    return NextResponse.json(
      { error: 'Bölüm kaydedilemedi' },
      { status: 500 }
    )
  }
}

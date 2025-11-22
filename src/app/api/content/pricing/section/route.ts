import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const DEFAULT_SECTION_DATA = {
  title: "Fiyatlandırma",
  paragraph: "İşletmenizin büyüklüğüne ve ihtiyaçlarına göre esnek paketler. Tüm paketlerde şeffaf fiyatlandırma, gizli ücret yok.",
  additionalTitle: "Ek Hizmetler",
  additionalParagraph: "Tüm paketlere eklenebilecek özel hizmetler",
  footerText: "* Tüm fiyatlar KDV hariçtir. Özel ihtiyaçlarınız için size özel paket oluşturabiliriz. İlk ay ücretsiz danışmanlık hizmeti ile başlayabilirsiniz."
}

export async function GET() {
  try {
    const section = await prisma.pricingsection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: unknown) {
    console.error('Error fetching pricing section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.pricingsection.findFirst()
    
    let section
    if (existingSection) {
      section = await prisma.pricingsection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph,
          additionalTitle: data.additionalTitle,
          additionalParagraph: data.additionalParagraph,
          footerText: data.footerText,
          updatedAt: new Date()
        }
      })
    } else {
      section = await prisma.pricingsection.create({
        data: {
          id: randomUUID(),
          title: data.title,
          paragraph: data.paragraph,
          additionalTitle: data.additionalTitle,
          additionalParagraph: data.additionalParagraph,
          footerText: data.footerText,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error saving pricing section:', error)
    return NextResponse.json(
      { error: 'Bölüm kaydedilemedi' },
      { status: 500 }
    )
  }
}

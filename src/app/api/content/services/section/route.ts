import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// IMPORTANT: Before using this endpoint, run the following commands:
// 1. Stop the dev server (Ctrl+C)
// 2. Run: npx prisma generate
// 3. Run: npx prisma db push
// 4. Restart dev server: npm run dev

export async function GET() {
  try {
    const section = await prisma.servicesSection.findFirst({
      include: {
        values: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
    
    if (!section) {
      return NextResponse.json({
        title: "Hizmetlerimiz",
        paragraph: "İşletmenizin tüm mali ihtiyaçları için kapsamlı ve profesyonel çözümler sunuyoruz.",
        valuesTitle: "Hizmet Değerlerimiz",
        footerText: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
        footerSignature: "SMMM Ekibi",
        values: [
          { id: "value-1", text: "Müşteri memnuniyeti odaklı hizmet anlayışı", isActive: true, order: 0 },
          { id: "value-2", text: "Güncel mevzuat takibi ve uygulaması", isActive: true, order: 1 },
          { id: "value-3", text: "Hızlı ve güvenilir çözümler", isActive: true, order: 2 },
          { id: "value-4", text: "7/24 destek ve danışmanlık", isActive: true, order: 3 }
        ]
      })
    }
    
    return NextResponse.json(section)
  } catch (error: any) {
    console.error('Error fetching services section:', error)
    // If table doesn't exist, return default values instead of error
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        title: "Hizmetlerimiz",
        paragraph: "İşletmenizin tüm mali ihtiyaçları için kapsamlı ve profesyonel çözümler sunuyoruz.",
        valuesTitle: "Hizmet Değerlerimiz",
        footerText: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
        footerSignature: "SMMM Ekibi",
        values: [
          { id: "value-1", text: "Müşteri memnuniyeti odaklı hizmet anlayışı", isActive: true, order: 0 },
          { id: "value-2", text: "Güncel mevzuat takibi ve uygulaması", isActive: true, order: 1 },
          { id: "value-3", text: "Hızlı ve güvenilir çözümler", isActive: true, order: 2 },
          { id: "value-4", text: "7/24 destek ve danışmanlık", isActive: true, order: 3 }
        ]
      })
    }
    return NextResponse.json(
      { error: 'Hizmetler bölümü alınamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingSection = await prisma.servicesSection.findFirst()
    
    if (existingSection) {
      // Update section
      const section = await prisma.servicesSection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph,
          valuesTitle: data.valuesTitle,
          footerText: data.footerText,
          footerSignature: data.footerSignature
        }
      })
      
      // Delete existing values
      await prisma.serviceValue.deleteMany({
        where: { sectionId: existingSection.id }
      })
      
      // Create new values
      if (data.values && data.values.length > 0) {
        await prisma.serviceValue.createMany({
          data: data.values.map((value: any, index: number) => ({
            sectionId: existingSection.id,
            text: value.text,
            isActive: value.isActive !== undefined ? value.isActive : true,
            order: index
          }))
        })
      }
      
      // Return updated section with values
      const updatedSection = await prisma.servicesSection.findUnique({
        where: { id: existingSection.id },
        include: {
          values: { orderBy: { order: 'asc' } }
        }
      })
      
      return NextResponse.json(updatedSection)
    } else {
      // Create new section
      const section = await prisma.servicesSection.create({
        data: {
          title: data.title,
          paragraph: data.paragraph,
          valuesTitle: data.valuesTitle,
          footerText: data.footerText,
          footerSignature: data.footerSignature,
          values: {
            create: data.values ? data.values.map((value: any, index: number) => ({
              text: value.text,
              isActive: value.isActive !== undefined ? value.isActive : true,
              order: index
            })) : []
          }
        },
        include: {
          values: true
        }
      })
      return NextResponse.json(section)
    }
  } catch (error: any) {
    console.error('Error saving services section:', error)
    // If table doesn't exist, inform user to run migration
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database migration gerekiyor. Lütfen "npx prisma db push" komutunu çalıştırın.' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Hizmetler bölümü kaydedilemedi' },
      { status: 500 }
    )
  }
}

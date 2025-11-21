import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default section data
const DEFAULT_SECTION = {
  title: "İş Birliği Yaptığımız Kurumlar",
  paragraph: "Güçlü kurum ortaklıklarımız sayesinde size en kaliteli mali müşavirlik hizmetini sunuyoruz.",
}

export async function GET() {
  try {
    const section = await prisma.institutionsSection.findFirst()
    
    if (!section) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json(section)
  } catch (error: unknown) {
    console.error('Error fetching institutions section:', error)
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      return NextResponse.json(null)
    }
    return NextResponse.json(
      { error: 'Kurumlar bölüm bilgisi alınamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Check if section already exists
    const existing = await prisma.institutionsSection.findFirst()
    
    let section
    if (existing) {
      // Update existing
      section = await prisma.institutionsSection.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          paragraph: data.paragraph,
        },
      })
    } else {
      // Create new
      section = await prisma.institutionsSection.create({
        data: {
          title: data.title || DEFAULT_SECTION.title,
          paragraph: data.paragraph,
        },
      })
    }
    
    return NextResponse.json(section)
  } catch (error) {
    console.error('Error saving institutions section:', error)
    return NextResponse.json(
      { error: 'Kurumlar bölüm bilgisi kaydedilemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const existing = await prisma.institutionsSection.findFirst()
    
    if (existing) {
      await prisma.institutionsSection.delete({
        where: { id: existing.id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Kurumlar bölüm bilgisi silindi'
    })
  } catch (error) {
    console.error('Error deleting institutions section:', error)
    return NextResponse.json(
      { error: 'Kurumlar bölüm bilgisi silinemedi' },
      { status: 500 }
    )
  }
}

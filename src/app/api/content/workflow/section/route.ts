import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SECTION_DATA = {
  title: "Çalışma Sürecimiz",
  paragraph: "Basit ve şeffaf süreçlerimiz ile işletmenizin mali yönetimini profesyonel ellere emanet edin. Dört adımda sorunsuz bir iş birliği başlatın."
}

export async function GET() {
  try {
    const section = await prisma.workflowSection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: any) {
    console.error('Error fetching workflow section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Check if section already exists
    const existingSection = await prisma.workflowSection.findFirst()
    
    let section
    if (existingSection) {
      // Update existing
      section = await prisma.workflowSection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph
        }
      })
    } else {
      // Create new
      section = await prisma.workflowSection.create({
        data: {
          title: data.title,
          paragraph: data.paragraph
        }
      })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error saving workflow section:', error)
    return NextResponse.json(
      { error: 'Bölüm kaydedilemedi' },
      { status: 500 }
    )
  }
}

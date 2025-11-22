import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

const DEFAULT_SECTION_DATA = {
  title: "Çalışma Sürecimiz",
  paragraph: "Basit ve şeffaf süreçlerimiz ile işletmenizin mali yönetimini profesyonel ellere emanet edin. Dört adımda sorunsuz bir iş birliği başlatın."
}

export async function GET() {
  try {
    const section = await prisma.workflowsection.findFirst()
    
    if (!section) {
      return NextResponse.json(DEFAULT_SECTION_DATA)
    }

    return NextResponse.json(section)
  } catch (error: unknown) {
    console.error('Error fetching workflow section:', error)
    return NextResponse.json(DEFAULT_SECTION_DATA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Check if section already exists
    const existingSection = await prisma.workflowsection.findFirst()
    
    let section
    if (existingSection) {
      // Update existing
      section = await prisma.workflowsection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          paragraph: data.paragraph,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new
      section = await prisma.workflowsection.create({
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
    console.error('Error saving workflow section:', error)
    return NextResponse.json(
      { error: 'Bölüm kaydedilemedi' },
      { status: 500 }
    )
  }
}

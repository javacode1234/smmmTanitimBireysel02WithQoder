import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Default workflow steps
function getDefaultSteps() {
  return [
    {
      id: "default-1",
      number: "01",
      icon: "Phone",
      title: "İlk Görüşme",
      description: "Bizimle iletişime geçin. İhtiyaçlarınızı dinleyelim ve size özel çözümler sunalım.",
      color: "from-blue-500 to-blue-600",
      isActive: true,
      order: 0
    },
    {
      id: "default-2",
      number: "02",
      icon: "FileText",
      title: "Analiz ve Planlama",
      description: "İşletmenizin mali durumunu analiz eder, size özel bir hizmet planı oluştururuz.",
      color: "from-purple-500 to-purple-600",
      isActive: true,
      order: 1
    },
    {
      id: "default-3",
      number: "03",
      icon: "Users",
      title: "Uygulama",
      description: "Profesyonel ekibimiz, belirlenen plan doğrultusunda hizmetleri eksiksiz yerine getirir.",
      color: "from-orange-500 to-orange-600",
      isActive: true,
      order: 2
    },
    {
      id: "default-4",
      number: "04",
      icon: "CheckCircle2",
      title: "Takip ve Raporlama",
      description: "Sürekli takip ve düzenli raporlama ile işinizin her zaman kontrolünde olun.",
      color: "from-green-500 to-green-600",
      isActive: true,
      order: 3
    }
  ];
}

export async function GET() {
  try {
    const steps = await prisma.workflowstep.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    // If no steps exist, return default values
    if (!steps || steps.length === 0) {
      return NextResponse.json(getDefaultSteps())
    }

    return NextResponse.json(steps)
  } catch (error: unknown) {
    console.error('Error fetching workflow steps:', error)
    // Handle missing table - return default values
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      return NextResponse.json(getDefaultSteps())
    }
    // Return default values on error
    return NextResponse.json(getDefaultSteps())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('POST /api/content/workflow - Received data:', JSON.stringify(data, null, 2))
    
    // Validate required fields
    if (!data.number || !data.icon || !data.title || !data.description) {
      console.error('POST /api/content/workflow - Missing required fields')
      return NextResponse.json(
        { error: 'Number, icon, title ve description zorunludur', details: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    console.log('POST /api/content/workflow - Creating workflow step')
    
    const step = await prisma.workflowstep.create({
      data: {
        id: randomUUID(),
        number: String(data.number),
        icon: String(data.icon || 'Phone'),
        title: String(data.title),
        description: String(data.description),
        color: String(data.color || 'from-blue-500 to-blue-600'),
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0),
        updatedAt: new Date()
      }
    })

    console.log('POST /api/content/workflow - Step created successfully:', step.id)
    return NextResponse.json(step)
  } catch (error: unknown) {
    console.error('POST /api/content/workflow - Error creating step:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as { code?: string })?.code
    })
    return NextResponse.json(
      { 
        error: 'Adım eklenemedi', 
        details: error instanceof Error ? error.message : 'Unknown error',
        code: (error as { code?: string })?.code 
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    try {
      const step = await prisma.workflowstep.update({
        where: { id },
        data: {
          number: data.number,
          icon: data.icon || 'Phone',
          title: data.title,
          description: data.description,
          color: data.color || 'from-blue-500 to-blue-600',
          isActive: data.isActive,
          order: data.order,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(step)
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to update does not exist')) {
        return NextResponse.json(
          { error: 'Adım bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }
  } catch (error) {
    console.error('Error updating workflow step:', error)
    return NextResponse.json(
      { error: 'Adım güncellenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      )
    }

    try {
      await prisma.workflowstep.delete({
        where: { id }
      })
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Adım bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workflow step:', error)
    return NextResponse.json(
      { error: 'Adım silinemedi' },
      { status: 500 }
    )
  }
}

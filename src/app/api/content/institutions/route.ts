import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // First ensure section exists
    let section = await prisma.institutionsSection.findFirst()
    if (!section) {
      section = await prisma.institutionsSection.create({
        data: {
          title: "İş Birliği Yaptığımız Kurumlar",
          paragraph: "Güçlü kurum ortaklıklarımız sayesinde size en kaliteli mali müşavirlik hizmetini sunuyoruz.",
        },
      })
    }

    const items = await prisma.institutionItem.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error: any) {
    console.error('Error fetching institutions:', error)
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json([])
    }
    return NextResponse.json(
      { error: 'Kurumlar alınamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Ensure section exists
    let section = await prisma.institutionsSection.findFirst()
    if (!section) {
      section = await prisma.institutionsSection.create({
        data: {
          title: "İş Birliği Yaptığımız Kurumlar",
          paragraph: "Güçlü kurum ortaklıklarımız sayesinde size en kaliteli mali müşavirlik hizmetini sunuyoruz.",
        },
      })
    }

    const item = await prisma.institutionItem.create({
      data: {
        sectionId: section.id,
        name: data.name,
        description: data.description,
        url: data.url,
        logo: data.logo,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order !== undefined ? data.order : 0,
      },
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating institution:', error)
    return NextResponse.json(
      { error: 'Kurum eklenemedi' },
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
    const item = await prisma.institutionItem.update({
      where: { id },
      data,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating institution:', error)
    return NextResponse.json(
      { error: 'Kurum güncellenemedi' },
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

    await prisma.institutionItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting institution:', error)
    return NextResponse.json(
      { error: 'Kurum silinemedi' },
      { status: 500 }
    )
  }
}

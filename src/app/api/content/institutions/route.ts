import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type InstitutionPayload = {
  name: string
  description?: string
  url?: string
  logo?: string
  isActive?: boolean
  order?: number
}

function getDefaultInstitutionItems() {
  return [
    {
      id: 'default-1',
      name: 'Gelir İdaresi Başkanlığı (GİB)',
      description: 'Vergi beyannameleri ve e-beyan süreçleri için resmi platform.',
      url: 'https://www.gib.gov.tr',
      logo: '',
      isActive: true,
      order: 0,
    },
    {
      id: 'default-2',
      name: 'İnteraktif Vergi Dairesi (İVD)',
      description: 'Online vergi işlemleri ve tahsilatlar için hizmet.',
      url: 'https://ivd.gib.gov.tr',
      logo: '',
      isActive: true,
      order: 1,
    },
    {
      id: 'default-3',
      name: 'Sosyal Güvenlik Kurumu (SGK)',
      description: 'Bordro, prim ve personel süreçleri için resmi kurum.',
      url: 'https://www.sgk.gov.tr',
      logo: '',
      isActive: true,
      order: 2,
    },
    {
      id: 'default-4',
      name: 'Ticaret Bakanlığı / MERSİS',
      description: 'Şirket kuruluşu ve sicil işlemleri için merkezi sistem.',
      url: 'https://mersis.gtb.gov.tr',
      logo: '',
      isActive: true,
      order: 3,
    },
    {
      id: 'default-5',
      name: 'KOSGEB',
      description: 'KOBİ destekleri ve finansal teşvik programları.',
      url: 'https://www.kosgeb.gov.tr',
      logo: '',
      isActive: true,
      order: 4,
    },
    {
      id: 'default-6',
      name: 'e-Devlet Kapısı',
      description: 'Resmi kurum işlemlerinin tek noktadan yönetimi.',
      url: 'https://www.turkiye.gov.tr',
      logo: '',
      isActive: true,
      order: 5,
    },
  ]
}

export async function GET() {
  try {
    const items = await prisma.institutionItem.findMany({
      orderBy: { order: 'asc' },
    })
    if (!items || items.length === 0) {
      return NextResponse.json(getDefaultInstitutionItems())
    }
    return NextResponse.json(items)
  } catch {
    return NextResponse.json(getDefaultInstitutionItems())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: InstitutionPayload = await request.json()
    if (!data?.name) {
      return NextResponse.json(
        { error: 'İsim gerekli' },
        { status: 400 }
      )
    }
    const item = await prisma.$transaction(async (tx) => {
      let section = await tx.institutionsSection.findFirst()
      if (!section) {
        section = await tx.institutionsSection.create({
          data: {
            title: "İş Birliği Yaptığımız Kurumlar",
            paragraph: "Güçlü kurum ortaklıklarımız sayesinde size en kaliteli mali müşavirlik hizmetini sunuyoruz.",
          },
        })
      }

      return tx.institutionItem.create({
        data: {
          sectionId: section.id,
          name: data.name,
          description: data.description,
          url: data.url,
          logo: data.logo ?? '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          order: data.order !== undefined ? data.order : 0,
        },
      })
    })
    return NextResponse.json(item)
  } catch {
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

    const data: Partial<InstitutionPayload> = await request.json()
    try {
      const item = await prisma.institutionItem.update({
        where: { id },
        data,
      })
      return NextResponse.json(item)
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to update does not exist')) {
        return NextResponse.json(
          { error: 'Kurum bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }
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
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2025' || err.message?.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Kurum bulunamadı' },
        { status: 404 }
      )
    }
    console.error('Error deleting institution:', error)
    return NextResponse.json(
      { error: 'Kurum silinemedi' },
      { status: 500 }
    )
  }
}

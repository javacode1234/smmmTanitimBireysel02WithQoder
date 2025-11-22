import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Default pricing plans
function getDefaultPlans() {
  return [
    {
      id: "default-1",
      name: "Başlangıç",
      icon: "Star",
      price: "2.500",
      period: "/ay",
      description: "Küçük işletmeler için ideal paket",
      color: "from-blue-500 to-blue-600",
      isPopular: false,
      isActive: true,
      order: 0,
      features: [
        "Aylık beyanname hazırlama",
        "Temel muhasebe kayıtları",
        "E-posta desteği",
        "Aylık mali raporlama",
        "Vergi takvimi takibi"
      ]
    },
    {
      id: "default-2",
      name: "Profesyonel",
      icon: "Zap",
      price: "4.500",
      period: "/ay",
      description: "Orta ölçekli işletmeler için",
      color: "from-purple-500 to-purple-600",
      isPopular: true,
      isActive: true,
      order: 1,
      features: [
        "Tüm Başlangıç özellikleri",
        "Tam muhasebe hizmeti",
        "SGK ve bordro işlemleri",
        "7/24 telefon desteği",
        "Haftalık mali raporlama",
        "Stratejik mali danışmanlık",
        "Vergi optimizasyonu"
      ]
    },
    {
      id: "default-3",
      name: "Kurumsal",
      icon: "Crown",
      price: "Özel Fiyat",
      period: "",
      description: "Büyük işletmeler için özel çözüm",
      color: "from-orange-500 to-orange-600",
      isPopular: false,
      isActive: true,
      order: 2,
      features: [
        "Tüm Profesyonel özellikleri",
        "Özel hesap yöneticisi",
        "Denetim ve revizyon",
        "Gelişmiş finansal analiz",
        "Yatırım danışmanlığı",
        "İç kontrol sistemleri",
        "Özel eğitim programları",
        "Sınırsız danışmanlık"
      ]
    }
  ];
}

export async function GET() {
  try {
    const plans = await prisma.pricingplan.findMany({
      include: {
        pricingfeature: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    if (!plans || plans.length === 0) {
      return NextResponse.json(getDefaultPlans())
    }

    const normalized = plans.map((p) => {
      const featuresArr = (p as { pricingfeature?: { text: string }[] }).pricingfeature
      const features = Array.isArray(featuresArr) ? featuresArr.map((f) => f.text) : []
      return { ...p, features }
    })
    return NextResponse.json(normalized)
  } catch (error: unknown) {
    console.error('Error fetching pricing plans:', error)
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      return NextResponse.json(getDefaultPlans())
    }
    return NextResponse.json(getDefaultPlans())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('POST /api/content/pricing - Received data:', JSON.stringify(data, null, 2))
    
    if (!data.name || !data.price) {
      console.error('POST /api/content/pricing - Missing required fields')
      return NextResponse.json(
        { error: 'Name ve price zorunludur', details: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create plan without features first
    const plan = await prisma.pricingplan.create({
      data: {
        id: randomUUID(),
        name: String(data.name),
        icon: String(data.icon || 'Star'),
        price: String(data.price),
        period: String(data.period || '/ay'),
        description: data.description ? String(data.description) : null,
        color: String(data.color || 'from-blue-500 to-blue-600'),
        isPopular: Boolean(data.isPopular ?? false),
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0),
        updatedAt: new Date()
      }
    })

    // Add features if provided
    if (data.features && Array.isArray(data.features)) {
      for (let i = 0; i < data.features.length; i++) {
        await prisma.pricingfeature.create({
          data: {
            id: randomUUID(),
            planId: plan.id,
            text: String(data.features[i]),
            isIncluded: true,
            order: i
          }
        })
      }
    }

    // Fetch the complete plan with features
    const completePlan = await prisma.pricingplan.findUnique({
      where: { id: plan.id },
      include: {
        pricingfeature: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    console.log('POST /api/content/pricing - Plan created successfully:', plan.id)
    const normalized = completePlan ? {
      ...completePlan,
      features: Array.isArray((completePlan as { pricingfeature?: { text: string }[] }).pricingfeature)
        ? ((completePlan as { pricingfeature?: { text: string }[] }).pricingfeature as { text: string }[]).map((f) => f.text)
        : []
    } : completePlan
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('POST /api/content/pricing - Error creating plan:', error)
    return NextResponse.json(
      { 
        error: 'Plan eklenemedi', 
        details: error instanceof Error ? error.message : 'Unknown error'
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
      const plan = await prisma.pricingplan.update({
        where: { id },
        data: {
          name: data.name,
          icon: data.icon || 'Star',
          price: data.price,
          period: data.period || '/ay',
          description: data.description,
          color: data.color || 'from-blue-500 to-blue-600',
          isPopular: data.isPopular,
          isActive: data.isActive,
          order: data.order,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(plan)
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to update does not exist')) {
        return NextResponse.json(
          { error: 'Plan bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }
  } catch (error) {
    console.error('Error updating pricing plan:', error)
    return NextResponse.json(
      { error: 'Plan güncellenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
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
      await prisma.pricingplan.delete({
        where: { id }
      })
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Plan bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pricing plan:', error)
    return NextResponse.json(
      { error: 'Plan silinemedi' },
      { status: 500 }
    )
  }
}

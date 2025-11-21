import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default services
function getDefaultServices() {
  return [
    {
      id: "default-1",
      icon: "FileText",
      title: "Beyanname Hazırlama",
      description: "Tüm vergi beyannamelerinizi zamanında ve eksiksiz hazırlıyoruz.",
      features: [
        "Gelir vergisi beyannameleri",
        "KDV beyannameleri",
        "Muhtasar beyannameler",
        "Yıllık gelir beyannameleri"
      ],
      color: "from-blue-500 to-blue-600",
      isActive: true,
      order: 0
    },
    {
      id: "default-2",
      icon: "Calculator",
      title: "Muhasebe Hizmetleri",
      description: "Günlük muhasebe işlemlerinizi profesyonel ekibimizle yönetiyoruz.",
      features: [
        "Günlük muhasebe kayıtları",
        "Defter tutma işlemleri",
        "Mali tablo hazırlama",
        "Envanter çalışmaları"
      ],
      color: "from-green-500 to-green-600",
      isActive: true,
      order: 1
    },
    {
      id: "default-3",
      icon: "Building2",
      title: "Şirket Kuruluşu",
      description: "Şirket kuruluş süreçlerinizde baştan sona yanınızdayız.",
      features: [
        "Limited/Anonim şirket kuruluşu",
        "Ticaret sicil işlemleri",
        "Vergi dairesi işlemleri",
        "SGK işveren kayıt işlemleri"
      ],
      color: "from-purple-500 to-purple-600",
      isActive: true,
      order: 2
    },
    {
      id: "default-4",
      icon: "TrendingUp",
      title: "Mali Danışmanlık",
      description: "İşletmenizin büyümesi için stratejik mali danışmanlık sunuyoruz.",
      features: [
        "Finansal analiz ve raporlama",
        "Bütçe ve planlama",
        "Yatırım danışmanlığı",
        "Maliyet optimizasyonu"
      ],
      color: "from-orange-500 to-orange-600",
      isActive: true,
      order: 3
    },
    {
      id: "default-5",
      icon: "Shield",
      title: "Denetim ve Revizyon",
      description: "Mali tablolarınızın doğruluğunu garanti altına alıyoruz.",
      features: [
        "Mali tablo denetimi",
        "Bağımsız denetim hizmetleri",
        "İç kontrol sistemleri",
        "Risk analizi ve değerlendirme"
      ],
      color: "from-red-500 to-red-600",
      isActive: true,
      order: 4
    },
    {
      id: "default-6",
      icon: "Users",
      title: "Bordro Hizmetleri",
      description: "Personel bordro ve SGK işlemlerinizi eksiksiz yönetiyoruz.",
      features: [
        "Aylık bordro hesaplama",
        "SGK prim bildirgeleri",
        "Personel giriş/çıkış işlemleri",
        "İzin ve ücret hesaplamaları"
      ],
      color: "from-cyan-500 to-cyan-600",
      isActive: true,
      order: 5
    }
  ];
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    // If no services exist, return default values
    if (!services || services.length === 0) {
      return NextResponse.json(getDefaultServices())
    }

    return NextResponse.json(services)
  } catch (error: unknown) {
    console.error('Error fetching services:', error)
    // Handle missing table (P2021) - return default values
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      return NextResponse.json(getDefaultServices())
    }
    // Return default values on error
    return NextResponse.json(getDefaultServices())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('POST /api/content/services - Received data:', JSON.stringify(data, null, 2))
    
    // Validate required fields
    if (!data.icon || !data.title || !data.description) {
      console.error('POST /api/content/services - Missing required fields:', { icon: data.icon, title: data.title, description: data.description })
      return NextResponse.json(
        { error: 'Icon, title ve description zorunludur', details: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Parse features - ensure it's a string
    let featuresString: string
    if (typeof data.features === 'string') {
      featuresString = data.features
    } else if (Array.isArray(data.features)) {
      featuresString = JSON.stringify(data.features)
    } else {
      featuresString = JSON.stringify([])
    }
    
    console.log('POST /api/content/services - Creating service with icon and color')
    console.log('Features:', featuresString)
    
    // Include color field - it now exists in database
    const service = await prisma.service.create({
      data: {
        icon: String(data.icon || 'FileText'),
        title: String(data.title),
        description: String(data.description),
        features: featuresString,
        color: String(data.color || 'from-blue-500 to-blue-600'),
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0)
      }
    })

    console.log('POST /api/content/services - Service created successfully:', service.id)
    return NextResponse.json(service)
  } catch (error: unknown) {
    console.error('POST /api/content/services - Error creating service:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as { code?: string })?.code
    })
    return NextResponse.json(
      { 
        error: 'Hizmet eklenemedi', 
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
    
    // Parse features if it's a string
    const features = typeof data.features === 'string' 
      ? data.features 
      : JSON.stringify(data.features || [])
    
    const service = await prisma.service.update({
      where: { id },
      data: {
        icon: data.icon || 'FileText',
        title: data.title,
        description: data.description,
        features: features,
        color: data.color || 'from-blue-500 to-blue-600',
        isActive: data.isActive,
        order: data.order
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Hizmet güncellenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
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

    await prisma.service.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Hizmet silinemedi' },
      { status: 500 }
    )
  }
}

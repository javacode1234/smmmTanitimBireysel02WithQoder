import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Default testimonials
function getDefaultTestimonials() {
  return [
    {
      id: "default-1",
      name: "Ahmet Yılmaz",
      position: "Genel Müdür",
      company: "TechVision A.Ş.",
      content: "15 yıldır birlikte çalışıyoruz. Profesyonel yaklaşımları ve güvenilirlikleri sayesinde mali süreçlerimiz her zaman kontrol altında. Kesinlikle tavsiye ederim.",
      avatar: "",
      initials: "AY",
      color: "from-blue-500 to-blue-600",
      rating: 5,
      isActive: true,
      order: 0
    },
    {
      id: "default-2",
      name: "Zeynep Kaya",
      position: "İşletme Sahibi",
      company: "Kaya Tekstil",
      content: "Şirket kuruluş sürecimizde baştan sona yanımızda oldular. Tüm resmi işlemler sorunsuz tamamlandı. Muhasebe hizmetlerinden de çok memnunuz.",
      avatar: "",
      initials: "ZK",
      color: "from-purple-500 to-purple-600",
      rating: 5,
      isActive: true,
      order: 1
    },
    {
      id: "default-3",
      name: "Mehmet Demir",
      position: "Kurucu Ortak",
      company: "Demir E-Ticaret",
      content: "E-ticaret işimiz için özel çözümler sundular. Vergi optimizasyonu konusundaki tavsiyeleri ile önemli tasarruf sağladık. Çok teşekkür ederiz.",
      avatar: "",
      initials: "MD",
      color: "from-green-500 to-green-600",
      rating: 5,
      isActive: true,
      order: 2
    },
    {
      id: "default-4",
      name: "Ayşe Şahin",
      position: "Yönetim Kurulu Başkanı",
      company: "Şahin Danışmanlık",
      content: "7/24 destek hizmeti gerçekten çok değerli. Acil durumlarda her zaman ulaşabiliyoruz. Profesyonel ekipleri ve hızlı çözümleri için teşekkürler.",
      avatar: "",
      initials: "AŞ",
      color: "from-orange-500 to-orange-600",
      rating: 5,
      isActive: true,
      order: 3
    },
    {
      id: "default-5",
      name: "Can Öztürk",
      position: "CEO",
      company: "Öztürk Holding",
      content: "Holdingimizdeki tüm şirketlerin muhasebesini yönetiyorlar. Düzenli raporlama ve analiz hizmetleri stratejik kararlarımızda çok önemli rol oynuyor.",
      avatar: "",
      initials: "CÖ",
      color: "from-red-500 to-red-600",
      rating: 5,
      isActive: true,
      order: 4
    },
    {
      id: "default-6",
      name: "Elif Yıldız",
      position: "Muhasebe Müdürü",
      company: "Yıldız İnşaat",
      content: "Dijital altyapıları ve modern yaklaşımları sayesinde tüm işlemlerimiz çok hızlı ilerliyor. Ekibin bilgisi ve deneyimi gerçekten fark yaratıyor.",
      avatar: "",
      initials: "EY",
      color: "from-cyan-500 to-cyan-600",
      rating: 5,
      isActive: true,
      order: 5
    }
  ];
}

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    if (!testimonials || testimonials.length === 0) {
      return NextResponse.json(getDefaultTestimonials())
    }

    return NextResponse.json(testimonials)
  } catch (error: unknown) {
    console.error('Error fetching testimonials:', error)
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      return NextResponse.json(getDefaultTestimonials())
    }
    return NextResponse.json(getDefaultTestimonials())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('POST /api/content/testimonials - Received data:', JSON.stringify(data, null, 2))
    
    if (!data.name || !data.content) {
      console.error('POST /api/content/testimonials - Missing required fields')
      return NextResponse.json(
        { error: 'Name ve content zorunludur', details: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const testimonial = await prisma.testimonial.create({
      data: {
        id: randomUUID(),
        name: String(data.name),
        position: String(data.position || ''),
        company: data.company ? String(data.company) : null,
        content: String(data.content),
        avatar: data.avatar || null,
        initials: String(data.initials || '??'),
        color: String(data.color || 'from-blue-500 to-blue-600'),
        rating: Number(data.rating ?? 5),
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0),
        updatedAt: new Date()
      }
    })

    console.log('POST /api/content/testimonials - Testimonial created successfully:', testimonial.id)
    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('POST /api/content/testimonials - Error creating testimonial:', error)
    return NextResponse.json(
      { 
        error: 'Yorum eklenemedi', 
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
      const testimonial = await prisma.testimonial.update({
        where: { id },
        data: {
          name: data.name,
          position: data.position,
          company: data.company,
          content: data.content,
          avatar: data.avatar,
          initials: data.initials || '??',
          color: data.color || 'from-blue-500 to-blue-600',
          rating: data.rating,
          isActive: data.isActive,
          order: data.order,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(testimonial)
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to update does not exist')) {
        return NextResponse.json(
          { error: 'Yorum bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json(
      { error: 'Yorum güncellenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
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
      await prisma.testimonial.delete({
        where: { id }
      })
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'P2025' || e.message?.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Yorum bulunamadı' },
          { status: 404 }
        )
      }
      throw err
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json(
      { error: 'Yorum silinemedi' },
      { status: 500 }
    )
  }
}

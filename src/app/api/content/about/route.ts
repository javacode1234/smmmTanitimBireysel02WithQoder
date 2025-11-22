import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Add this helper function to get default features with isActive field
function getDefaultFeatures() {
  return [
    {
      id: "default-1",
      icon: "Award",
      title: "Profesyonel Deneyim",
      description: "15 yılı aşkın sektör tecrübesi ile işletmenize en iyi hizmeti sunuyoruz.",
      isActive: true,
      order: 0
    },
    {
      id: "default-2",
      icon: "Shield",
      title: "Güvenilir Hizmet",
      description: "Tüm finansal işlemleriniz gizlilik ve güvenlik garantisi altında.",
      isActive: true,
      order: 1
    },
    {
      id: "default-3",
      icon: "Users",
      title: "Uzman Kadro",
      description: "Alanında uzman, sertifikalı mali müşavirler ile çalışıyoruz.",
      isActive: true,
      order: 2
    },
    {
      id: "default-4",
      icon: "TrendingUp",
      title: "Sürekli Gelişim",
      description: "Güncel mevzuat ve teknoloji takibi ile hizmet kalitemizi artırıyoruz.",
      isActive: true,
      order: 3
    }
  ];
}

//

export async function GET() {
  try {
    const aboutSection = await prisma.aboutsection.findFirst({
      include: {
        aboutfeature: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    // If no about section exists, return default values
    if (!aboutSection) {
      return NextResponse.json({
        title: "Hakkımızda",
        subtitle: "Serbest Muhasebeci Mali Müşavir olarak, işletmelerin finansal süreçlerini en verimli şekilde yönetmelerine yardımcı oluyoruz.",
        description: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
        features: getDefaultFeatures()
      })
    }

    if (aboutSection) {
      return NextResponse.json({
        ...aboutSection,
        features: (aboutSection as unknown as { aboutfeature: unknown[] }).aboutfeature
      })
    }
    return NextResponse.json(null)
  } catch (error: unknown) {
    console.error('Error fetching about section:', error)
    return NextResponse.json({
      title: "Hakkımızda",
      subtitle: "Serbest Muhasebeci Mali Müşavir olarak, işletmelerin finansal süreçlerini en verimli şekilde yönetmelerine yardımcı oluyoruz.",
      description: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
      features: getDefaultFeatures()
    })
  }
}

// DELETE endpoint to reset to default values
export async function DELETE() {
  try {
    // Get existing section
    const existingSection = await prisma.aboutsection.findFirst()
    
    if (existingSection) {
      // Delete all features first
      await prisma.aboutfeature.deleteMany({
        where: { sectionId: existingSection.id }
      })
      
      // Delete the section
      await prisma.aboutsection.delete({
        where: { id: existingSection.id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Hakkımızda bölümü varsayılan değerlere sıfırlandı'
    })
  } catch (error) {
    console.error('Error resetting about section:', error)
    return NextResponse.json(
      { error: 'Hakkımızda bölümü sıfırlanamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Check if about section already exists
    const existingSection = await prisma.aboutsection.findFirst()
    
    if (existingSection) {
      // Update existing section and features atomically
      await prisma.$transaction(async (tx) => {
        await tx.aboutsection.update({
          where: { id: existingSection.id },
          data: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            image: data.image,
            updatedAt: new Date()
          }
        })
        await tx.aboutfeature.deleteMany({
          where: { sectionId: existingSection.id }
        })
        try {
          await tx.aboutfeature.createMany({
            data: (data.features as { icon: string; title: string; description: string; isActive?: boolean }[]).map((feature, index: number) => ({
              id: randomUUID(),
              sectionId: existingSection.id,
              icon: feature.icon,
              title: feature.title,
              description: feature.description,
              ...(feature.isActive !== undefined && { isActive: feature.isActive }),
              order: index
            }))
          })
        } catch {
          await tx.aboutfeature.createMany({
            data: (data.features as { icon: string; title: string; description: string }[]).map((feature, index: number) => ({
              id: randomUUID(),
              sectionId: existingSection.id,
              icon: feature.icon,
              title: feature.title,
              description: feature.description,
              order: index
            }))
          })
        }
      })
      const sectionWithFeatures = await prisma.aboutsection.findUnique({
        where: { id: existingSection.id },
        include: { 
          aboutfeature: { orderBy: { order: 'asc' } }
        }
      })
      if (sectionWithFeatures) {
        return NextResponse.json({
          ...sectionWithFeatures,
          features: (sectionWithFeatures as unknown as { aboutfeature: unknown[] }).aboutfeature
        })
      }
      return NextResponse.json(null)
    } else {
      // Create new section
      let newSection;
      try {
        newSection = await prisma.aboutsection.create({
          data: {
            id: randomUUID(),
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            image: data.image,
            updatedAt: new Date(),
            aboutfeature: {
              create: (data.features as { icon: string; title: string; description: string; isActive?: boolean }[]).map((feature, index: number) => ({
                id: randomUUID(),
                icon: feature.icon,
                title: feature.title,
                description: feature.description,
                ...(feature.isActive !== undefined && { isActive: feature.isActive }),
                order: index
              }))
            }
          },
          include: {
            aboutfeature: true
          }
        })
      } catch {
        // Fallback: create section without isActive field
        newSection = await prisma.aboutsection.create({
          data: {
            id: randomUUID(),
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            image: data.image,
            updatedAt: new Date(),
            aboutfeature: {
              create: (data.features as { icon: string; title: string; description: string }[]).map((feature, index: number) => ({
                id: randomUUID(),
                icon: feature.icon,
                title: feature.title,
                description: feature.description,
                order: index
              }))
            }
          },
          include: {
            aboutfeature: true
          }
        })
      }
      
      if (newSection) {
        return NextResponse.json({
          ...newSection,
          features: (newSection as unknown as { aboutfeature: unknown[] }).aboutfeature
        })
      }
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error('Error creating/updating about section:', error)
    return NextResponse.json(
      { error: 'Hakkımızda bölümü kaydedilemedi' },
      { status: 500 }
    )
  }
}

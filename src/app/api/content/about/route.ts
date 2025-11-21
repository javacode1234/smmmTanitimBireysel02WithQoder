import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const aboutSection = await prisma.aboutSection.findFirst({
      include: {
        features: {
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

    return NextResponse.json(aboutSection)
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
    const existingSection = await prisma.aboutSection.findFirst()
    
    if (existingSection) {
      // Delete all features first
      await prisma.aboutFeature.deleteMany({
        where: { sectionId: existingSection.id }
      })
      
      // Delete the section
      await prisma.aboutSection.delete({
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
    const existingSection = await prisma.aboutSection.findFirst()
    
    if (existingSection) {
      // Update existing section
      await prisma.aboutSection.update({
        where: { id: existingSection.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          image: data.image
        }
      })
      
      // Delete all existing features
      await prisma.aboutFeature.deleteMany({
        where: { sectionId: existingSection.id }
      })
      
      // Create new features
      // Try to create features with isActive field, fallback to without if it fails
      try {
        await prisma.aboutFeature.createMany({
          data: (data.features as { icon: string; title: string; description: string; isActive?: boolean }[]).map((feature, index: number) => ({
            sectionId: existingSection.id,
            icon: feature.icon,
            title: feature.title,
            description: feature.description,
            ...(feature.isActive !== undefined && { isActive: feature.isActive }),
            order: index
          }))
        })
      } catch {
        // Fallback: create features without isActive field
        await prisma.aboutFeature.createMany({
          data: (data.features as { icon: string; title: string; description: string }[]).map((feature, index: number) => ({
            sectionId: existingSection.id,
            icon: feature.icon,
            title: feature.title,
            description: feature.description,
            order: index
          }))
        })
      }
      
      // Return the updated section with features
      const sectionWithFeatures = await prisma.aboutSection.findUnique({
        where: { id: existingSection.id },
        include: { 
          features: { orderBy: { order: 'asc' } }
        }
      })
      
      return NextResponse.json(sectionWithFeatures)
    } else {
      // Create new section
      let newSection;
      try {
        newSection = await prisma.aboutSection.create({
          data: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            image: data.image,
            features: {
              create: (data.features as { icon: string; title: string; description: string; isActive?: boolean }[]).map((feature, index: number) => ({
                icon: feature.icon,
                title: feature.title,
                description: feature.description,
                ...(feature.isActive !== undefined && { isActive: feature.isActive }),
                order: index
              }))
            }
          },
          include: {
            features: true
          }
        })
      } catch {
        // Fallback: create section without isActive field
        newSection = await prisma.aboutSection.create({
          data: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            image: data.image,
            features: {
              create: (data.features as { icon: string; title: string; description: string }[]).map((feature, index: number) => ({
                icon: feature.icon,
                title: feature.title,
                description: feature.description,
                order: index
              }))
            }
          },
          include: {
            features: true
          }
        })
      }
      
      return NextResponse.json(newSection)
    }
  } catch (error) {
    console.error('Error creating/updating about section:', error)
    return NextResponse.json(
      { error: 'Hakkımızda bölümü kaydedilemedi' },
      { status: 500 }
    )
  }
}

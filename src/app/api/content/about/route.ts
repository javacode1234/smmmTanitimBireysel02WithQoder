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
  } catch (error) {
    console.error('Error fetching about section:', error)
    return NextResponse.json(
      { error: 'Hakkımızda bölümü alınamadı' },
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
      // First, update the main section data
      const updatedSection = await prisma.aboutSection.update({
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
          data: data.features.map((feature: any, index: number) => ({
            sectionId: existingSection.id,
            icon: feature.icon,
            title: feature.title,
            description: feature.description,
            ...(feature.isActive !== undefined && { isActive: feature.isActive }),
            order: index
          }))
        })
      } catch (error: any) {
        // Fallback: create features without isActive field
        await prisma.aboutFeature.createMany({
          data: data.features.map((feature: any, index: number) => ({
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
        include: { features: { orderBy: { order: 'asc' } } }
      })
      
      return NextResponse.json(sectionWithFeatures)
    } else {
      // Create new section
      // Try to create section with isActive field, fallback to without if it fails
      let newSection;
      try {
        newSection = await prisma.aboutSection.create({
          data: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            image: data.image,
            features: {
              create: data.features.map((feature: any, index: number) => ({
                icon: feature.icon,
                title: feature.title,
                description: feature.description,
                // Only include isActive if it exists in the Prisma schema
                ...(feature.isActive !== undefined && { isActive: feature.isActive }),
                order: index
              }))
            }
          },
          include: {
            features: true
          }
        })
      } catch (error: any) {
        // Fallback: create section without isActive field
        newSection = await prisma.aboutSection.create({
          data: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            image: data.image,
            features: {
              create: data.features.map((feature: any, index: number) => ({
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
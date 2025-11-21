import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'

// Default values
const DEFAULT_SETTINGS = {
  siteName: 'SMMM Ofisi',
  siteDescription: 'Profesyonel mali müşavirlik hizmetleri ile işletmenizin mali yönetiminde güvenilir çözüm ortağınız.',
  phone: '+90 (212) 123 45 67',
  email: 'info@smmmofisi.com',
  address: 'İstanbul, Türkiye',
  facebookUrl: 'https://facebook.com',
  xUrl: 'https://x.com',
  linkedinUrl: 'https://linkedin.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
  threadsUrl: 'https://threads.net',
}

export async function GET() {
  try {
    const settings = await prisma.sitesettings.findFirst()
    
    // Kayıt yoksa null dön (otomatik oluşturma)
    if (!settings) {
      return NextResponse.json(null)
    }

    // Kayıt varsa dön
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error fetching site settings:', error)
    // More detailed error handling
    let errorMessage = 'Site ayarları yüklenemedi'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.message
    } else if (typeof error === 'string') {
      errorDetails = error
    } else if (error && typeof error === 'object') {
      errorDetails = JSON.stringify(error)
    }
    
    // Handle missing table (P2021)
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        code: error?.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

// DELETE endpoint to reset to default values
export async function DELETE() {
  try {
    // Get existing settings
    const existing = await prisma.sitesettings.findFirst()
    
    if (existing) {
      // Delete the settings
      await prisma.sitesettings.delete({
        where: { id: existing.id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Site ayarları varsayılan değerlere sıfırlandı'
    })
  } catch (error: any) {
    console.error('Error resetting site settings:', error)
    // More detailed error handling
    let errorMessage = 'Site ayarları sıfırlanamadı'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.message
    } else if (typeof error === 'string') {
      errorDetails = error
    } else if (error && typeof error === 'object') {
      errorDetails = JSON.stringify(error)
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        code: error?.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received data:', JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data) {
      return NextResponse.json(
        { error: 'Geçersiz veri', message: 'İstek gövdesi boş olamaz' },
        { status: 400 }
      )
    }

    // Get existing settings first
    const existing = await prisma.sitesettings.findFirst()
    console.log('Existing record:', existing ? existing.id : 'none')

    let settings
    if (existing) {
      // Update existing record
      settings = await prisma.sitesettings.update({
        where: { id: existing.id },
        data: {
          siteName: data.siteName,
          siteDescription: data.siteDescription,
          favicon: data.favicon,
          brandIcon: data.brandIcon,
          phone: data.phone,
          email: data.email,
          address: data.address,
          mapLatitude: data.mapLatitude,
          mapLongitude: data.mapLongitude,
          mapEmbedUrl: data.mapEmbedUrl,
          facebookUrl: data.facebookUrl,
          xUrl: data.xUrl,
          linkedinUrl: data.linkedinUrl,
          instagramUrl: data.instagramUrl,
          youtubeUrl: data.youtubeUrl,
          threadsUrl: data.threadsUrl,
          updatedAt: new Date(),
        },
      })
      console.log('Updated successfully')
    } else {
      // Create new record
      settings = await prisma.sitesettings.create({
        data: {
          id: data.id || 'default-settings',
          siteName: data.siteName || 'SMMM Ofisi',
          siteDescription: data.siteDescription,
          favicon: data.favicon,
          brandIcon: data.brandIcon,
          phone: data.phone,
          email: data.email,
          address: data.address,
          mapLatitude: data.mapLatitude,
          mapLongitude: data.mapLongitude,
          mapEmbedUrl: data.mapEmbedUrl,
          facebookUrl: data.facebookUrl,
          xUrl: data.xUrl,
          linkedinUrl: data.linkedinUrl,
          instagramUrl: data.instagramUrl,
          youtubeUrl: data.youtubeUrl,
          threadsUrl: data.threadsUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log('Created successfully')
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error saving site settings:', error)
    
    // More detailed error handling
    let errorMessage = 'Site ayarları kaydedilemedi'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.message
    } else if (typeof error === 'string') {
      errorDetails = error
    } else if (error && typeof error === 'object') {
      errorDetails = JSON.stringify(error)
    }
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      errorMessage = 'Ayarlar zaten mevcut, güncellenemedi'
    } else if (error?.code === 'P2025') {
      errorMessage = 'Güncellenecek ayar bulunamadı'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        code: error?.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default values
const DEFAULT_SETTINGS = {
  siteName: 'SMMM Ofisi',
  siteDescription: 'Profesyonel mali müşavirlik hizmetleri ile işletmenizin mali yönetiminde güvenilir çözüm ortağınız.',
  phone: '+90 (212) 123 45 67',
  email: 'info@smmmofisi.com',
  address: 'İstanbul, Türkiye',
  facebookUrl: 'https://facebook.com',
  twitterUrl: 'https://twitter.com',
  linkedinUrl: 'https://linkedin.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
}

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst()
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: DEFAULT_SETTINGS,
      })
    }

    // Return settings with defaults for empty fields
    const responseSettings = {
      ...settings,
      siteName: settings.siteName || DEFAULT_SETTINGS.siteName,
      siteDescription: settings.siteDescription || DEFAULT_SETTINGS.siteDescription,
      phone: settings.phone || DEFAULT_SETTINGS.phone,
      email: settings.email || DEFAULT_SETTINGS.email,
      address: settings.address || DEFAULT_SETTINGS.address,
      facebookUrl: settings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
      twitterUrl: settings.twitterUrl || DEFAULT_SETTINGS.twitterUrl,
      linkedinUrl: settings.linkedinUrl || DEFAULT_SETTINGS.linkedinUrl,
      instagramUrl: settings.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
      youtubeUrl: settings.youtubeUrl || DEFAULT_SETTINGS.youtubeUrl,
    }

    return NextResponse.json(responseSettings)
  } catch (error: any) {
    console.error('Error fetching site settings:', error)
    // Handle missing table (P2021) - return default settings
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(DEFAULT_SETTINGS)
    }
    // Return default settings if there's an error
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

// DELETE endpoint to reset to default values
export async function DELETE() {
  try {
    // Get existing settings
    const existing = await prisma.siteSettings.findFirst()
    
    if (existing) {
      // Delete the settings
      await prisma.siteSettings.delete({
        where: { id: existing.id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Site ayarları varsayılan değerlere sıfırlandı'
    })
  } catch (error) {
    console.error('Error resetting site settings:', error)
    return NextResponse.json(
      { error: 'Site ayarları sıfırlanamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received data:', JSON.stringify(data, null, 2))

    // Get existing settings first
    const existing = await prisma.siteSettings.findFirst()
    console.log('Existing record:', existing ? existing.id : 'none')

    let settings
    if (existing) {
      // Update existing record
      settings = await prisma.siteSettings.update({
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
          twitterUrl: data.twitterUrl,
          linkedinUrl: data.linkedinUrl,
          instagramUrl: data.instagramUrl,
          youtubeUrl: data.youtubeUrl,
        },
      })
      console.log('Updated successfully')
    } else {
      // Create new record
      settings = await prisma.siteSettings.create({
        data: {
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
          twitterUrl: data.twitterUrl,
          linkedinUrl: data.linkedinUrl,
          instagramUrl: data.instagramUrl,
          youtubeUrl: data.youtubeUrl,
        },
      })
      console.log('Created successfully')
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving site settings:', error)
    return NextResponse.json(
      { error: 'Site ayarları kaydedilemedi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

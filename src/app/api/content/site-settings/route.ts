import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst()
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'SMMM Ofisi',
          siteDescription: '',
          phone: '',
          email: '',
          address: '',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Site ayarları alınamadı' },
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

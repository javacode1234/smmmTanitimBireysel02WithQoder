import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE all services (reset to empty)
export async function DELETE() {
  try {
    // Delete all services
    await prisma.service.deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: 'Hizmetler bölümü varsayılan değerlere sıfırlandı'
    })
  } catch (error) {
    console.error('Error resetting services:', error)
    return NextResponse.json(
      { error: 'Hizmetler bölümü sıfırlanamadı' },
      { status: 500 }
    )
  }
}

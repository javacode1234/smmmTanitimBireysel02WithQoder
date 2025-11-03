import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE all hero items (reset to empty)
export async function DELETE() {
  try {
    // Delete all hero items
    await prisma.heroSection.deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: 'Hero bölümü varsayılan değerlere sıfırlandı'
    })
  } catch (error) {
    console.error('Error resetting hero section:', error)
    return NextResponse.json(
      { error: 'Hero bölümü sıfırlanamadı' },
      { status: 500 }
    )
  }
}

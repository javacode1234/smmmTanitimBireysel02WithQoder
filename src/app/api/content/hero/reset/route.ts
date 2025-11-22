import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE all hero items (reset to empty)
export async function DELETE() {
  try {
    // Delete all hero items
    await prisma.herosection.deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: 'Hero bölümü varsayılan değerlere sıfırlandı'
    })
  } catch (error: unknown) {
    console.error('Error resetting hero section:', error)
    const msg = error instanceof Error ? error.message : String(error)
    if ((error as { code?: string })?.code === 'P2021' || msg.includes('does not exist')) {
      return NextResponse.json({ success: true, message: 'Hero bölümü zaten boş' })
    }
    return NextResponse.json(
      { error: 'Hero bölümü sıfırlanamadı' },
      { status: 500 }
    )
  }
}

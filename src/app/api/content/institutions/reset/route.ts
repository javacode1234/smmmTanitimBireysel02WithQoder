import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE all institutions (reset to empty)
export async function DELETE() {
  try {
    // Delete all institution items
    await prisma.institutionItem.deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: 'Kurumlar bölümü varsayılan değerlere sıfırlandı'
    })
  } catch (error) {
    console.error('Error resetting institutions:', error)
    return NextResponse.json(
      { error: 'Kurumlar bölümü sıfırlanamadı' },
      { status: 500 }
    )
  }
}

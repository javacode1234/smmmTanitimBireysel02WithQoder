import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { steps } = data

    if (!Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Steps array gerekli' },
        { status: 400 }
      )
    }

    await prisma.$transaction(
      steps.map((step: { id: string; order: number }) =>
        prisma.workflowstep.update({
          where: { id: step.id },
          data: { order: step.order }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2025' || err.message?.includes('Record to update does not exist')) {
      return NextResponse.json(
        { error: 'Güncellenecek adım bulunamadı' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Sıralama güncellenemedi' },
      { status: 500 }
    )
  }
}

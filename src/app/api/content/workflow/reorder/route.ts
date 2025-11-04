import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Update order for each step
    for (const step of steps) {
      await prisma.workflowStep.update({
        where: { id: step.id },
        data: { order: step.order }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering workflow steps:', error)
    return NextResponse.json(
      { error: 'Sıralama güncellenemedi' },
      { status: 500 }
    )
  }
}

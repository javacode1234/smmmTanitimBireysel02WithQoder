import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  try {
    // If the model exists, fetch from DB
    if (prisma.activitycode) {
      const items = await prisma.activitycode.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
        select: { id: true, code: true, name: true },
      })
      const codes = items.map(i => ({ id: i.id, name: `${i.code} - ${i.name}` }))
      return NextResponse.json({ codes })
    }
  } catch (error: unknown) {
    console.error('Error fetching activity codes:', error)
    return NextResponse.json({ error: 'Faaliyet kodları alınamadı' }, { status: 500 })
  }
  return NextResponse.json({ codes: [] })
}

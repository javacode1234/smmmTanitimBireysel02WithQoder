import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLocaleLowerCase('tr-TR')
    const rows = await prisma.$queryRaw<Array<{ id: string; code: string; name: string }>>`
      SELECT id, code, name FROM activitycode WHERE isActive = TRUE ORDER BY code ASC
    `
    const shaped = rows.map(it => ({ id: it.id, name: `${it.code} - ${it.name}` }))
    const filtered = q
      ? shaped.filter(it => it.name.toLocaleLowerCase('tr-TR').includes(q))
      : shaped

    return NextResponse.json({ codes: filtered })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes("doesn't exist") || msg.includes('P2021') || msg.includes('1146')) {
      return NextResponse.json({ codes: [] })
    }
    return NextResponse.json({ error: 'Activity codes fetch failed' }, { status: 500 })
  }
}

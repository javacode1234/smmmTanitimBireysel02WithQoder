import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { turkishTaxOffices } from '@/lib/tax-offices'
export const runtime = 'nodejs'
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (prisma.city) {
      try {
        const items = await prisma.city.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true, code: true },
        })
        return NextResponse.json({ cities: items })
      } catch (err) {
        const msg = String((err as { message?: string })?.message || '')
        if (/Unknown argument `code`/i.test(msg) || /column\s+.*city\.code.*\s+does not exist/i.test(msg)) {
          const items = await prisma.city.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
          return NextResponse.json({ cities: items })
        }
        throw err
      }
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    if (err?.code === 'P2021' || err?.message?.includes('does not exist')) {
      // Fall through to defaults
    } else {
      console.error('Error fetching cities:', error)
    }
  }

  const names = Array.from(new Set((turkishTaxOffices || []).map(o => (o.city || '').trim()).filter(Boolean)))
  const fallback = names.map((name, idx) => ({ id: `city-${idx}`, name }))
  return NextResponse.json({ cities: fallback })
}

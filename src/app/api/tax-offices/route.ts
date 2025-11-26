import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { turkishTaxOffices } from '@/lib/tax-offices'

export const runtime = 'nodejs'
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (prisma.taxOffice) {
      try {
        const items = await prisma.taxOffice.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true, city: true, district: true },
        })
        return NextResponse.json({ taxOffices: items })
      } catch (err) {
        const msg = String((err as { message?: string })?.message || '')
        if (msg.toLowerCase().includes('unknown')) {
          const items = await prisma.taxOffice.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
          return NextResponse.json({ taxOffices: items })
        }
        throw err
      }
    }
  } catch (error) {
    const e = error as { code?: string; message?: string }
    if (e?.code === 'P2021' || e?.message?.includes('does not exist')) {
    } else {
      console.error('Error fetching tax offices:', error)
    }
  }

  const fallback = (turkishTaxOffices || []).map((o, idx) => ({ id: `to-${idx}`, name: o.name, city: o.city, district: o.district }))
  return NextResponse.json({ taxOffices: fallback })
}

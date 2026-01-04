import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLocaleLowerCase('tr-TR')
    
    // Fetch from database
    const rows = await prisma.taxOffice.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        district: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const filtered = q
      ? rows.filter(it => it.name.toLocaleLowerCase('tr-TR').includes(q))
      : rows

    return NextResponse.json({ taxOffices: filtered })
  } catch (error: unknown) {
    console.error('Tax offices fetch error:', error)
    return NextResponse.json({ taxOffices: [] })
  }
}

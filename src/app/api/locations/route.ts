import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const city = searchParams.get('city')

    if (type === 'cities') {
      const cities = await prisma.city.findMany({
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(cities.map(c => c.name))
    }

    if (type === 'districts' && city) {
      const cityRecord = await prisma.city.findFirst({
        where: { name: city }
      })

      if (!cityRecord) {
        return NextResponse.json([])
      }

      const districts = await prisma.district.findMany({
        where: { cityId: cityRecord.id },
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(districts.map(d => d.name))
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  } catch (error) {
    console.error('Locations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

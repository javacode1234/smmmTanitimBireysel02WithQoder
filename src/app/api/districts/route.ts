import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { turkishTaxOffices } from '@/lib/tax-offices'
export const runtime = 'nodejs'
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityParam = (searchParams.get('city') || '').trim()
  const cityCodeParam = (searchParams.get('cityCode') || '').trim()
  if (!cityParam && !cityCodeParam) {
    return NextResponse.json({ districts: [] })
  }

  try {
    if (prisma.district && prisma.city) {
      // Resolve city by id/name/code
      let city: { id: string; name?: string | null; code?: string | null } | null = null
      const isId = cityParam ? /^c[a-z0-9]{24}$/i.test(cityParam) : false
      if (cityCodeParam) {
        try {
          city = await prisma.city.findUnique({ where: { code: cityCodeParam }, select: { id: true, name: true, code: true } })
        } catch (err) {
          const msg = String((err as { message?: string })?.message || '')
          if (/Unknown argument `code`/i.test(msg) || /column\s+.*city\.code.*\s+does not exist/i.test(msg)) {
            city = await prisma.city.findFirst({ where: { name: cityCodeParam }, select: { id: true, name: true } })
          } else {
            throw err
          }
        }
      }
      if (!city && cityParam) {
        city = isId
          ? await prisma.city.findUnique({ where: { id: cityParam }, select: { id: true, name: true, code: true } })
          : await prisma.city.findUnique({ where: { name: cityParam }, select: { id: true, name: true, code: true } })
      }
      if (city) {
        // Try Prisma with cityId first
        try {
          const items = await prisma.district.findMany({
            where: { cityId: city.id },
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
          })
          return NextResponse.json({ districts: items })
        } catch (err) {
          const msg = String((err as { message?: string })?.message || '')
          if (
            /Unknown argument `cityId`/i.test(msg) ||
            /column\s+.*district\.cityId.*\s+does not exist/i.test(msg) ||
            /Unknown column 'cityId'/i.test(msg)
          ) {
            // Detect linking column and referenced column
            try {
              const fkRows = await prisma.$queryRaw<Array<{ COLUMN_NAME: string; REFERENCED_TABLE_NAME: string | null; REFERENCED_COLUMN_NAME: string | null }>>(
                Prisma.sql`SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'district' AND COLUMN_NAME IN ('cityId','cityCode')`
              )
              let cityCol = 'cityId'
              let useValue: string | null = city.id
              const rCityId = fkRows.find(r => r.COLUMN_NAME === 'cityId')
              const rCityCode = fkRows.find(r => r.COLUMN_NAME === 'cityCode')
              if (!rCityId && rCityCode) {
                cityCol = 'cityCode'
                const refCol = (rCityCode.REFERENCED_COLUMN_NAME || '').toLowerCase()
                if (refCol === 'id') useValue = city.id
                else if (refCol === 'code') useValue = String(city.code || '') || cityCodeParam || null
              } else if (rCityId) {
                cityCol = 'cityId'
                useValue = city.id
              } else {
                const colInfoCity = await prisma.$queryRaw<Array<{ COLUMN_NAME: string }>>(
                  Prisma.sql`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'district' AND COLUMN_NAME IN ('cityId','cityCode')`
                )
                const hasCityId = !!colInfoCity.find(c => c.COLUMN_NAME === 'cityId')
                const hasCityCode = !!colInfoCity.find(c => c.COLUMN_NAME === 'cityCode')
                if (hasCityId) { cityCol = 'cityId'; useValue = city.id } else if (hasCityCode) { cityCol = 'cityCode'; useValue = String(city.code || '') || cityCodeParam || null }
              }
              if (!useValue) {
                return NextResponse.json({ districts: [] })
              }
              const rows = await prisma.$queryRaw<Array<{ id: string; name: string }>>(
                Prisma.sql`SELECT id, name FROM district WHERE ${Prisma.raw(cityCol)} = ${useValue} ORDER BY name ASC`
              )
              return NextResponse.json({ districts: rows })
            } catch (e) {
              console.error('Raw district query failed:', e)
            }
          } else {
            throw err
          }
        }
      }
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    if (err?.code === 'P2021' || err?.message?.includes('does not exist')) {
      // Fall through
    } else {
      console.error('Error fetching districts:', error)
    }
  }

  const names = Array.from(new Set((turkishTaxOffices || []).filter(o => (o.city || '').trim() === cityParam).map(o => (o.district || '').trim()).filter(Boolean)))
  const fallback = names.map((name, idx) => ({ id: `district-${idx}`, name }))
  return NextResponse.json({ districts: fallback })
}

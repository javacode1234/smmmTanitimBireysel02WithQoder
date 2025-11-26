import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
export const runtime = 'nodejs'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Dosya zorunlu' }, { status: 400 })
    const buf = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    let rows: Array<Record<string, unknown>> = []
  if (ext === 'csv') {
      const text = await decodeCSV(buf)
      rows = parseCSVFlexible(text)
    } else {
      const XLSXMod = await import('xlsx')
      const XLSX = XLSXMod.default || XLSXMod
      const wb = XLSX.read(buf, { type: 'buffer' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rawRows: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Array<Record<string, unknown>>
      if (!rawRows.length) return NextResponse.json({ error: 'Boş Excel' }, { status: 400 })
      const headers = Object.keys(rawRows[0] || {})
      const norm = (s: string) => {
        let t = String(s || '').trim().replace(/^[\uFEFF\"“”]+|[\uFEFF\"“”]+$/g, '')
        t = t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        t = t.toLocaleLowerCase('tr-TR').replace(/[ıİ]/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c')
        t = t.replace(/\s+/g, ' ').trim()
        return t
      }
      const findKey = (re: RegExp) => headers.find(k => re.test(norm(k)))
      const cityNameKey = findKey(/^(il|city|sehir|şehir)(\s*(adi|ad|name))?$/)
      const cityCodeKey = findKey(/^(city\s*code|il\s*kod(u)?|kod|code)$/)
      const distNameKey = findKey(/^(name|ilce|ilçe|district)(\s*(adi|ad|name))?$/)
      const distCodeKey = findKey(/^(district\s*code|ilce\s*kod(u)?|ilçe\s*kod(u)?|kod|code)$/)
      rows = rawRows.map(r => ({
        cityCode: cityCodeKey ? String((r as Record<string, unknown>)[cityCodeKey] ?? '').trim() : '',
        cityName: cityNameKey ? String((r as Record<string, unknown>)[cityNameKey] ?? '').trim() : '',
        districtCode: distCodeKey ? String((r as Record<string, unknown>)[distCodeKey] ?? '').trim() : '',
        districtName: distNameKey ? String((r as Record<string, unknown>)[distNameKey] ?? '').trim() : '',
      }))
    }
    let created = 0
    for (const r of rows) {
      const keys = Object.keys(r)
      const cityNameKey = keys.find(k => /^(il|city|şehir|sehir)$/i.test(k)) || 'cityName'
      const cityCodeKey = keys.find(k => /(^(cityCode)$)|(^il.*kod)|(^code$)/i.test(k)) || 'cityCode'
      const distNameKey = keys.find(k => /^(ilçe|ilce|district)$/i.test(k)) || 'districtName'
      const distCodeKey = keys.find(k => /(^(districtCode)$)|(^ilçe.*kod)|(^ilce.*kod)|(^code$)/i.test(k)) || 'districtCode'
      const rec = r as Record<string, unknown>
      const cityName = cityNameKey ? String(rec[cityNameKey] ?? '').trim() : ''
      const cityCode = cityCodeKey ? String(rec[cityCodeKey] ?? '').trim() : ''
      const distName = distNameKey ? String(rec[distNameKey] ?? '').trim() : ''
      const distCode = distCodeKey ? String(rec[distCodeKey] ?? '').trim() : ''
      if (!distName && !distCode) continue
      let city
      try {
        if (cityCode) {
          city = await prisma.city.upsert({ where: { code: cityCode }, update: { name: cityName || undefined }, create: { name: cityName || cityCode, code: cityCode } })
        } else if (cityName) {
          city = await prisma.city.upsert({ where: { name: cityName }, update: {}, create: { name: cityName } })
        } else {
          continue
        }
      } catch (err) {
        const msg = String((err as { message?: string })?.message || '')
        if (/Unknown argument `code`/i.test(msg) || /column\s+.*city\.code.*\s+does not exist/i.test(msg)) {
          if (cityName) {
            city = await prisma.city.upsert({ where: { name: cityName }, update: {}, create: { name: cityName } })
          } else if (cityCode) {
            const existingByName = await prisma.city.findFirst({ where: { name: cityCode }, select: { id: true, name: true } })
            if (existingByName) {
              city = existingByName as unknown as { id: string; name: string }
            } else {
              city = await prisma.city.create({ data: { name: cityCode } })
            }
          } else {
            continue
          }
        } else {
          throw err
        }
      }
      const cityCodeResolved = cityCode || String(((city as Record<string, unknown>).code ?? ''))
      if (distCode) {
        try {
          await prisma.district.upsert({ where: { code: distCode }, update: { name: distName || undefined, cityId: city.id }, create: { code: distCode, name: distName || distCode, cityId: city.id } })
        } catch (err) {
          const msg = String((err as { message?: string })?.message || '')
          if (
            /Unknown argument `code`/i.test(msg) ||
            /column\s+.*district\.code.*\s+does not exist/i.test(msg) ||
            /column\s+.*district\.cityId.*\s+does not exist/i.test(msg) ||
            /Unknown column 'cityId'/i.test(msg)
          ) {
            await upsertDistrictByCityRel(city.id as string, cityCodeResolved, distName || distCode, distCode)
          } else {
            throw err
          }
        }
      } else {
        try {
          await prisma.district.upsert({ where: { cityId_name: { cityId: city.id, name: distName } }, update: {}, create: { cityId: city.id, name: distName } })
        } catch (err) {
          const msg = String((err as { message?: string })?.message || '')
          if (
            /column\s+.*district\.cityId.*\s+does not exist/i.test(msg) ||
            /Unknown column 'cityId'/i.test(msg)
          ) {
            await upsertDistrictByCityRel(city.id as string, cityCodeResolved, distName)
          } else {
            const existingByName = await prisma.district.findFirst({ where: { cityId: city.id, name: distName }, select: { id: true } })
            if (existingByName?.id) {
              await prisma.district.update({ where: { id: existingByName.id }, data: { name: distName, cityId: city.id } })
            } else {
              await prisma.district.create({ data: { name: distName, cityId: city.id } })
            }
          }
        }
      }
      created++
    }
    return NextResponse.json({ message: `İlçeler içe aktarıldı: ${created}` })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `İlçe içe aktarma başarısız: ${msg}` }, { status: 500 })
  }
}

function parseCSVFlexible(input: string): Array<Record<string, unknown>> {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ','
  const rawHeaders = lines[0].split(delim).map(h => h.trim().replace(/^[\uFEFF\"“”]+|[\uFEFF\"“”]+$/g, ''))
  const norm = (s: string) => {
    let t = String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    t = t.toLocaleLowerCase('tr-TR').replace(/[ıİ]/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c')
    t = t.replace(/\s+/g, ' ').trim()
    return t
  }
  const headers = rawHeaders.map(norm)
  const cityNameIdx = headers.findIndex(h => /^(il|city|sehir|şehir)(\s*(adi|ad|name))?$/.test(h))
  const cityCodeIdx = headers.findIndex(h => /^(city\s*code|il\s*kod(u)?|kod|code)$/.test(h))
  const distNameIdx = headers.findIndex(h => /^(name|ilce|ilçe|district)(\s*(adi|ad|name))?$/.test(h))
  const distCodeIdx = headers.findIndex(h => /^(district\s*code|ilce\s*kod(u)?|ilçe\s*kod(u)?|kod|code)$/.test(h))
  if (distNameIdx < 0 && distCodeIdx < 0) {
    throw new Error("CSV başlıkları geçersiz. En azından ilçe adı veya ilçe kodu gereklidir")
  }
  const out: Array<Record<string, unknown>> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim).map(c => c.trim().replace(/^[\uFEFF\"“”]+|[\uFEFF\"“”]+$/g, ''))
    const row: Record<string, unknown> = {
      cityCode: cityCodeIdx >= 0 ? (cols[cityCodeIdx] ?? '') : '',
      cityName: cityNameIdx >= 0 ? (cols[cityNameIdx] ?? '') : '',
      districtCode: distCodeIdx >= 0 ? (cols[distCodeIdx] ?? '') : '',
      districtName: distNameIdx >= 0 ? (cols[distNameIdx] ?? '') : '',
    }
    out.push(row)
  }
  return out
}

async function decodeCSV(buf: Buffer): Promise<string> {
  try {
    const iconvMod: unknown = await import('iconv-lite')
    const iconv = (iconvMod as { default?: unknown }).default || iconvMod
    const decodeFn = (iconv as { decode: (b: Buffer, e: string) => string }).decode
    const tryDecode = (enc: string) => {
      try { return decodeFn(buf, enc) } catch { return '' }
    }
    const candidates = ['utf8', 'windows-1254', 'iso-8859-9']
    for (const enc of candidates) {
      const s = tryDecode(enc)
      if (s && !/\uFFFD/.test(s)) return s
    }
    return tryDecode('utf8') || buf.toString('utf8')
  } catch {
    return buf.toString('utf8')
  }
}

async function upsertDistrictByCityRel(cityId: string, cityCode: string, name: string, districtCode?: string) {
  if ((!cityId && !cityCode) || !name) return
  let targetId: unknown = undefined
  const fkRows = await prisma.$queryRaw<Array<{ COLUMN_NAME: string; REFERENCED_TABLE_NAME: string | null; REFERENCED_COLUMN_NAME: string | null }>>`
    SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'district' AND COLUMN_NAME IN ('cityId','cityCode')
  `
  let cityCol = 'cityId'
  let useValue: string | null = cityId || null
  let refCol: 'id' | 'code' | null = 'id'
  const rCityId = fkRows.find(r => r.COLUMN_NAME === 'cityId')
  const rCityCode = fkRows.find(r => r.COLUMN_NAME === 'cityCode')
  if (!rCityId && rCityCode) {
    cityCol = 'cityCode'
    refCol = ((rCityCode.REFERENCED_COLUMN_NAME || '').toLowerCase() === 'code') ? 'code' : 'id'
    useValue = refCol === 'id' ? (cityId || null) : (cityCode || null)
  } else if (rCityId) {
    cityCol = 'cityId'
    refCol = 'id'
    useValue = cityId || null
  } else {
    const colInfoCity = await prisma.$queryRaw<Array<{ COLUMN_NAME: string }>>`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'district' AND COLUMN_NAME IN ('cityId','cityCode')
    `
    const hasCityId = !!colInfoCity.find(c => c.COLUMN_NAME === 'cityId')
    const hasCityCode = !!colInfoCity.find(c => c.COLUMN_NAME === 'cityCode')
    if (hasCityId) { cityCol = 'cityId'; refCol = 'id'; useValue = cityId || null } else if (hasCityCode) { cityCol = 'cityCode'; refCol = 'code'; useValue = cityCode || null }
  }
  if (!useValue) return

  // Ensure the reference value exists in city table according to FK target
  try {
    if (refCol === 'id') {
      const exists = await prisma.$queryRaw<Array<{ id: unknown }>>(Prisma.sql`SELECT id FROM city WHERE id = ${useValue} LIMIT 1`)
      if (!exists[0]?.id && cityCode) {
        const byCode = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`SELECT id FROM city WHERE code = ${cityCode} LIMIT 1`)
        if (byCode[0]?.id) useValue = byCode[0].id
      }
    } else if (refCol === 'code') {
      const exists = await prisma.$queryRaw<Array<{ code: unknown }>>(Prisma.sql`SELECT code FROM city WHERE code = ${useValue} LIMIT 1`)
      if (!exists[0]?.code && cityId) {
        const byId = await prisma.$queryRaw<Array<{ code: string | null }>>(Prisma.sql`SELECT code FROM city WHERE id = ${cityId} LIMIT 1`)
        if (byId[0]?.code) useValue = byId[0].code as string
      }
    }
  } catch {}
  if (districtCode) {
    const rowsByCode = await prisma.$queryRaw<Array<{ id: unknown }>>(Prisma.sql`SELECT id FROM district WHERE districtCode = ${districtCode} LIMIT 1`)
    targetId = rowsByCode[0]?.id
  }
  if (!targetId) {
    const rowsByName = await prisma.$queryRaw<Array<{ id: unknown }>>(Prisma.sql`SELECT id FROM district WHERE ${Prisma.raw(cityCol)} = ${useValue} AND name = ${name} LIMIT 1`)
    targetId = rowsByName[0]?.id
  }
  if (targetId) {
    if (districtCode) {
      await prisma.$executeRaw(Prisma.sql`UPDATE district SET name = ${name}, ${Prisma.raw(cityCol)} = ${useValue}, districtCode = ${districtCode}, updatedAt = NOW() WHERE id = ${targetId}`)
    } else {
      await prisma.$executeRaw(Prisma.sql`UPDATE district SET name = ${name}, ${Prisma.raw(cityCol)} = ${useValue}, updatedAt = NOW() WHERE id = ${targetId}`)
    }
  } else {
    const colInfo = await prisma.$queryRaw<Array<{ DATA_TYPE: string; COLUMN_DEFAULT: string | null; EXTRA: string }>>`
      SELECT DATA_TYPE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'district' AND COLUMN_NAME = 'id'
      LIMIT 1
    `
    const meta = colInfo[0]
    const needsExplicitId = !!meta && (!meta.COLUMN_DEFAULT || meta.COLUMN_DEFAULT === null) && !String(meta.EXTRA || '').toLowerCase().includes('auto_increment')
    if (needsExplicitId) {
      const dt = String(meta.DATA_TYPE || '').toLowerCase()
      const isInt = ['int', 'bigint', 'mediumint', 'smallint', 'tinyint'].includes(dt)
      if (isInt) {
        const nextIdRows = await prisma.$queryRaw<Array<{ nextId: number }>>`SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM district`
        const nextId = nextIdRows[0]?.nextId || 1
        if (districtCode) {
          await prisma.$executeRaw(Prisma.sql`INSERT INTO district (id, name, ${Prisma.raw(cityCol)}, districtCode, createdAt, updatedAt) VALUES (${nextId}, ${name}, ${useValue}, ${districtCode}, NOW(), NOW())`)
        } else {
          await prisma.$executeRaw(Prisma.sql`INSERT INTO district (id, name, ${Prisma.raw(cityCol)}, createdAt, updatedAt) VALUES (${nextId}, ${name}, ${useValue}, NOW(), NOW())`)
        }
      } else {
        if (districtCode) {
          await prisma.$executeRaw(Prisma.sql`INSERT INTO district (id, name, ${Prisma.raw(cityCol)}, districtCode, createdAt, updatedAt) VALUES (UUID(), ${name}, ${useValue}, ${districtCode}, NOW(), NOW())`)
        } else {
          await prisma.$executeRaw(Prisma.sql`INSERT INTO district (id, name, ${Prisma.raw(cityCol)}, createdAt, updatedAt) VALUES (UUID(), ${name}, ${useValue}, NOW(), NOW())`)
        }
      }
    } else {
      if (districtCode) {
        await prisma.$executeRaw(Prisma.sql`INSERT INTO district (name, ${Prisma.raw(cityCol)}, districtCode, createdAt, updatedAt) VALUES (${name}, ${useValue}, ${districtCode}, NOW(), NOW())`)
      } else {
        await prisma.$executeRaw(Prisma.sql`INSERT INTO district (name, ${Prisma.raw(cityCol)}, createdAt, updatedAt) VALUES (${name}, ${useValue}, NOW(), NOW())`)
      }
    }
  }
}

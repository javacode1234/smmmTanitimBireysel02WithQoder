import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
      const codeKey = headers.find(k => /^code$/i.test(k))
      const nameKey = headers.find(k => /^name$/i.test(k))
      const cityKey = headers.find(k => /^city$/i.test(k))
      const distKey = headers.find(k => /^district$/i.test(k))
      if (!codeKey || !nameKey) {
        return NextResponse.json({ error: "Başlıklar geçersiz. Lütfen en az iki sütun kullanın: 'code' ve 'name' (opsiyonel: 'city','district')" }, { status: 400 })
      }
      rows = rawRows.map(r => ({
        code: String(r[codeKey] ?? '').trim(),
        name: String(r[nameKey] ?? '').trim(),
        city: cityKey ? String(r[cityKey] ?? '').trim() : '',
        district: distKey ? String(r[distKey] ?? '').trim() : '',
      }))
    }
    let created = 0
    for (const r of rows) {
      const code = String((r['code'] ?? '') as string).trim()
      const name = String((r['name'] ?? '') as string).trim()
      const cityName = String((r['city'] ?? '') as string).trim()
      const distName = String((r['district'] ?? '') as string).trim()
      if (!name) continue
      try {
        if (code) {
          await prisma.taxOffice.upsert({
            where: { code },
            update: { name, city: cityName || null, district: distName || null },
            create: { code, name, city: cityName || null, district: distName || null },
          })
        } else {
          await prisma.taxOffice.upsert({
            where: { name },
            update: { city: cityName || null, district: distName || null },
            create: { name, city: cityName || null, district: distName || null },
          })
        }
        created++
      } catch (err) {
        const e = err as { message?: string; code?: string; meta?: unknown }
        const msg = String(e?.message || '')
        if (code && /Unknown argument `code`/i.test(msg)) {
          await prisma.taxOffice.upsert({
            where: { name },
            update: { city: cityName || null, district: distName || null },
            create: { name, city: cityName || null, district: distName || null },
          })
          created++
        } else if (/Unique constraint failed/i.test(msg) && /TaxOffice_name_key/i.test(msg)) {
          try {
            await prisma.taxOffice.update({
              where: { name },
              data: { city: cityName || null, district: distName || null, ...(code ? { code } : {}) },
            })
            created++
          } catch (err2) {
            const e2 = err2 as { message?: string }
            const msg2 = String(e2?.message || '')
            if (/Unique constraint failed/i.test(msg2) && /TaxOffice_code_key/i.test(msg2)) {
              await prisma.taxOffice.update({
                where: { name },
                data: { city: cityName || null, district: distName || null },
              })
              created++
            } else {
              throw err2
            }
          }
        } else {
          throw err
        }
      }
    }
    return NextResponse.json({ message: `Vergi daireleri içe aktarıldı: ${created}` })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `Vergi dairesi içe aktarma başarısız: ${msg}` }, { status: 500 })
  }
}

function parseCSVFlexible(input: string): Array<Record<string, unknown>> {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ','
  const headers = lines[0].split(delim).map(h => h.trim())
  const codeIdx = headers.findIndex(h => /^code$/i.test(h))
  const nameIdx = headers.findIndex(h => /^name$/i.test(h))
  const cityIdx = headers.findIndex(h => /^city$/i.test(h))
  const distIdx = headers.findIndex(h => /^district$/i.test(h))
  if (codeIdx < 0 || nameIdx < 0) {
    throw new Error("CSV başlıkları geçersiz. Lütfen en az: 'code' ve 'name' kullanın (opsiyonel: 'city','district')")
  }
  const out: Array<Record<string, unknown>> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim)
    const row: Record<string, unknown> = {
      code: (cols[codeIdx] ?? '').trim(),
      name: (cols[nameIdx] ?? '').trim(),
    }
    if (cityIdx >= 0) row['city'] = (cols[cityIdx] ?? '').trim()
    if (distIdx >= 0) row['district'] = (cols[distIdx] ?? '').trim()
    out.push(row)
  }
  return out
}

async function decodeCSV(buf: Buffer): Promise<string> {
  try {
    const iconvMod: unknown = await import('iconv-lite')
    const iconv = (iconvMod as { default?: { decode: (b: Buffer, enc: string) => string }; decode?: (b: Buffer, enc: string) => string }).default || (iconvMod as { decode: (b: Buffer, enc: string) => string })
    const tryDecode = (enc: string) => {
      try { return iconv.decode(buf, enc) } catch { return '' }
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

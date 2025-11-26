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
      const rawRows: unknown[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (!rawRows.length) return NextResponse.json({ error: 'Boş Excel' }, { status: 400 })
      const headers = Object.keys(rawRows[0] as Record<string, unknown>)
      const codeKey = headers.find(k => /^(code|il\s*kodu|city\s*code)$/i.test(k))
      const nameKey = headers.find(k => /^(name|il\s*adı|il\s*adi|city|şehir|sehir)$/i.test(k))
      rows = (rawRows as Record<string, unknown>[]).map(r => ({
        code: codeKey ? String(r[codeKey] ?? '').trim() : '',
        name: nameKey ? String(r[nameKey] ?? '').trim() : '',
      }))
    }
    let count = 0
    for (const r of rows) {
      const keys = Object.keys(r)
      const nameKey = keys.find(k => /^(name|il\s*adı|il\s*adi|city|şehir|sehir)$/i.test(k)) || 'name'
      const codeKey = keys.find(k => /^(code|il\s*kodu|city\s*code)$/i.test(k)) || 'code'
      const name = String((r as Record<string, unknown>)[nameKey] ?? '').trim()
      const code = String((r as Record<string, unknown>)[codeKey] ?? '').trim()
      if (!name && !code) continue
      const where = code ? { code } : { name }
      await prisma.city.upsert({ where, update: { name: name || undefined, code: code || null }, create: { name: name || code, code: code || null } })
      count++
    }
    return NextResponse.json({ message: `İller içe aktarıldı: ${count}` })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `İl içe aktarma başarısız: ${msg}` }, { status: 500 })
  }
}

function parseCSVFlexible(input: string): Array<Record<string, unknown>> {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ','
  const rawHeaders = lines[0].split(delim).map(h => h.trim().replace(/^[\uFEFF\"“”]+|[\uFEFF\"“”]+$/g, ''))
  const norm = (s: string) => {
    let t = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    t = t.toLocaleLowerCase('tr-TR').replace(/[ıİ]/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c')
    t = t.replace(/\s+/g, ' ').trim()
    return t
  }
  const headers = rawHeaders.map(norm)
  const codeIdx = headers.findIndex(h => /^(code|il\s*kodu|il\s*kod|city\s*code)$/.test(h))
  const nameIdx = headers.findIndex(h => /^(name|il\s*adi|il\s*ad|city|sehir)$/.test(h) || /^(il|sehir|city)$/.test(h))
  if (codeIdx < 0 && nameIdx < 0) {
    throw new Error("CSV başlıkları geçersiz. En azından 'code' veya 'name' gereklidir")
  }
  const out: Array<Record<string, unknown>> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim).map(c => c.trim().replace(/^[\uFEFF\"“”]+|[\uFEFF\"“”]+$/g, ''))
    const row: Record<string, unknown> = {
      code: codeIdx >= 0 ? (cols[codeIdx] ?? '') : '',
      name: nameIdx >= 0 ? (cols[nameIdx] ?? '') : '',
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

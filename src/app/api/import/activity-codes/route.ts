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
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (!rawRows.length) return NextResponse.json({ error: 'Boş Excel' }, { status: 400 })
      const headers = Object.keys(rawRows[0] || {})
      const codeKey = headers.find(k => /^code$/i.test(k))
      const descKey = headers.find(k => /^tanim$/i.test(k))
      if (!codeKey || !descKey) {
        return NextResponse.json({ error: "Başlıklar geçersiz. Lütfen iki sütun kullanın: 'code' ve 'tanim'" }, { status: 400 })
      }
      rows = rawRows.map(r => ({ code: String(r[codeKey] ?? '').trim(), name: String(r[descKey] ?? '').trim() }))
    }
    let count = 0
    for (const r of rows) {
      const keys = Object.keys(r)
      const codeKey = keys.find(k => /^code$/i.test(k)) || keys.find(k => /^kod$/i.test(k)) || keys[0]
      const descKey = keys.find(k => /^tanim$/i.test(k)) || keys.find(k => /^name$/i.test(k)) || keys[1]
      const rawCode = String(r[codeKey as string] ?? '').trim()
      let code = normalizeCode(rawCode)
      const tr = descKey ? String(r[descKey as string] ?? '').trim() : ''
      if (!code) continue
      await prisma.activitycode.upsert({
        where: { code },
        update: { name: tr || code, isActive: true },
        create: { code, name: tr || code, isActive: true },
      })
      count++
    }
    return NextResponse.json({ message: `NACE kodları içe aktarıldı: ${count}` })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `NACE içe aktarma başarısız: ${msg}` }, { status: 500 })
  }
}

function normalizeCode(raw: string): string | null {
  if (!raw) return null
  const digits = raw.replace(/[^0-9]/g, '')
  if (digits.length === 4) return `${digits.slice(0,2)}.${digits.slice(2,4)}`
  if (digits.length >= 6) return `${digits.slice(0,2)}.${digits.slice(2,4)}.${digits.slice(4,6)}`
  return null
}

function parseCSVFlexible(input: string): Array<Record<string, unknown>> {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ','
  const headers = lines[0].split(delim).map(h => h.trim())
  if (headers.length < 2 || !/^code$/i.test(headers[0]) || !/^tanim$/i.test(headers[1])) {
    throw new Error("CSV başlıkları geçersiz. Lütfen iki sütun kullanın: 'code' ve 'tanim'")
  }
  const out: Array<Record<string, unknown>> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim)
    const row: Record<string, unknown> = { code: (cols[0] ?? '').trim(), name: (cols[1] ?? '').trim() }
    out.push(row)
  }
  return out
}
async function decodeCSV(buf: Buffer): Promise<string> {
  try {
    const iconvMod: any = await import('iconv-lite')
    const iconv = iconvMod.default || iconvMod
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

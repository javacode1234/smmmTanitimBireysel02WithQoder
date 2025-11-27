import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'
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
      const descKey = headers.find(k => /^(name|tanim)$/i.test(k))
      if (!codeKey || !descKey) {
        return NextResponse.json({ error: "Başlıklar geçersiz. Lütfen iki sütun kullanın: 'code' ve 'name'" }, { status: 400 })
      }
      rows = rawRows.map(r => ({ code: String(r[codeKey] ?? '').trim(), name: String(r[descKey] ?? '').trim() }))
    }
    // Detect schema differences (e.g., missing trName column)
    let hasTrName = true
    try {
      const col = await prisma.$queryRaw<Array<{ COLUMN_NAME: string }>>`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'activitycode' AND COLUMN_NAME = 'trName'
        LIMIT 1
      `
      hasTrName = !!col[0]
    } catch {
      hasTrName = true
    }

    let needsExplicitId = false
    let idIsInt = false
    try {
      const colInfo = await prisma.$queryRaw<Array<{ DATA_TYPE: string; COLUMN_DEFAULT: string | null; EXTRA: string }>>`
        SELECT DATA_TYPE, COLUMN_DEFAULT, EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'activitycode' AND COLUMN_NAME = 'id'
        LIMIT 1
      `
      const meta = colInfo[0]
      needsExplicitId = !!meta && (!meta.COLUMN_DEFAULT || meta.COLUMN_DEFAULT === null) && !String(meta.EXTRA || '').toLowerCase().includes('auto_increment')
      if (needsExplicitId) {
        const dt = String(meta.DATA_TYPE || '').toLowerCase()
        idIsInt = ['int', 'bigint', 'mediumint', 'smallint', 'tinyint'].includes(dt)
      }
    } catch {}

    let count = 0
    for (const r of rows) {
      const keys = Object.keys(r)
      const codeKey = keys.find(k => /^code$/i.test(k)) || keys.find(k => /^kod$/i.test(k)) || keys[0]
      const descKey = keys.find(k => /^tanim$/i.test(k)) || keys.find(k => /^name$/i.test(k)) || keys[1]
      const rawCode = String(r[codeKey as string] ?? '').trim()
      let code = normalizeCode(rawCode)
      const tr = descKey ? String(r[descKey as string] ?? '').trim() : ''
      if (!code) continue
      try {
        if (hasTrName) {
          await prisma.activitycode.upsert({
            where: { code },
            update: { name: tr || code, isActive: true },
            create: { code, name: tr || code, isActive: true },
          })
        } else {
          if (needsExplicitId) {
            let idVal: string | number
            if (idIsInt) {
              const nextIdRows = await prisma.$queryRaw<Array<{ nextId: number }>>`SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM activitycode`
              idVal = nextIdRows[0]?.nextId || 1
            } else {
              idVal = crypto.randomUUID()
            }
            await prisma.$executeRaw(
              Prisma.sql`INSERT INTO activitycode (id, code, name, isActive, createdAt, updatedAt)
                          VALUES (${idVal}, ${code}, ${tr || code}, TRUE, NOW(), NOW())
                          ON DUPLICATE KEY UPDATE name = VALUES(name), isActive = VALUES(isActive), updatedAt = NOW()`
            )
          } else {
            await prisma.$executeRaw(
              Prisma.sql`INSERT INTO activitycode (code, name, isActive, createdAt, updatedAt)
                          VALUES (${code}, ${tr || code}, TRUE, NOW(), NOW())
                          ON DUPLICATE KEY UPDATE name = VALUES(name), isActive = VALUES(isActive), updatedAt = NOW()`
            )
          }
        }
      } catch (err) {
        const msg = String((err as { message?: string })?.message || '')
        if (/Unknown column 'trName'|activitycode\.trName/i.test(msg)) {
          if (needsExplicitId) {
            let idVal: string | number
            if (idIsInt) {
              const nextIdRows = await prisma.$queryRaw<Array<{ nextId: number }>>`SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM activitycode`
              idVal = nextIdRows[0]?.nextId || 1
            } else {
              idVal = crypto.randomUUID()
            }
            await prisma.$executeRaw(
              Prisma.sql`INSERT INTO activitycode (id, code, name, isActive, createdAt, updatedAt)
                          VALUES (${idVal}, ${code}, ${tr || code}, TRUE, NOW(), NOW())
                          ON DUPLICATE KEY UPDATE name = VALUES(name), isActive = VALUES(isActive), updatedAt = NOW()`
            )
          } else {
            await prisma.$executeRaw(
              Prisma.sql`INSERT INTO activitycode (code, name, isActive, createdAt, updatedAt)
                          VALUES (${code}, ${tr || code}, TRUE, NOW(), NOW())
                          ON DUPLICATE KEY UPDATE name = VALUES(name), isActive = VALUES(isActive), updatedAt = NOW()`
            )
          }
        } else {
          throw err
        }
      }
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
  const cleaned = input.replace(/^\uFEFF/, '')
  const lines = cleaned.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ','
  const rawHeaders = lines[0].split(delim)
  const headers = rawHeaders.map(h => h.replace(/^\uFEFF/, '').replace(/^\s*"|"\s*$/g, '').replace(/^\s*'|'\s*$/g, '').trim())
  let codeIdx = headers.findIndex(h => /^code$/i.test(h))
  let nameIdx = headers.findIndex(h => /^(name|tanim)$/i.test(h))
  if (codeIdx < 0 || nameIdx < 0) {
    if (headers.length >= 2) {
      codeIdx = 0
      nameIdx = 1
    } else {
      throw new Error("CSV başlıkları geçersiz. Lütfen iki sütun kullanın: 'code' ve 'name'")
    }
  }
  const out: Array<Record<string, unknown>> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim).map(c => c.replace(/^\uFEFF/, '').replace(/^\s*"|"\s*$/g, '').replace(/^\s*'|'\s*$/g, '').trim())
    const row: Record<string, unknown> = {
      code: (cols[codeIdx] ?? '').trim(),
      name: (cols[nameIdx] ?? '').trim()
    }
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

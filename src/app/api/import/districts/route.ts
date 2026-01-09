import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decodeCSV, normalizeHeader, cleanCSVValue } from '@/lib/csv'

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
      rows = rawRows
    }
    let created = 0
    const errors: string[] = []

    for (const r of rows) {
      const keys = Object.keys(r)
      const idKey = keys.find(k => /^id$/i.test(k)) || 'id'
      const nameKey = keys.find(k => /^(ilce|ilçe|name|district)$/i.test(k)) || 'ilce'
      const cityIdKey = keys.find(k => /^(il_id|cityId|city_id)$/i.test(k)) || 'il_id'
      
      const idStr = String((r as Record<string, unknown>)[idKey] ?? '').trim()
      const name = String((r as Record<string, unknown>)[nameKey] ?? '').trim()
      const cityIdStr = String((r as Record<string, unknown>)[cityIdKey] ?? '').trim()
      
      const id = parseInt(idStr, 10)
      const cityId = parseInt(cityIdStr, 10)

      if (!name || isNaN(id) || isNaN(cityId)) {
        // Sadece dolu satırlar için hata kaydı tut, tamamen boş satırları geç
        if (idStr || name || cityIdStr) {
           // errors.push(`Satır atlandı (Eksik veri): ID=${idStr}, Ad=${name}, İl=${cityIdStr}`)
        }
        continue
      }

      try {
        await prisma.district.upsert({ 
          where: { id }, 
          update: { name, cityId }, 
          create: { id, name, cityId } 
        })
        created++
      } catch (err: any) {
        console.error(`District import error for ID ${id}:`, err)
        if (err.code === 'P2003') {
           errors.push(`ID ${id}: ${cityId} nolu il bulunamadı (Önce illeri yükleyiniz).`)
        } else {
           errors.push(`ID ${id}: ${err.message}`)
        }
      }
    }

    if (created === 0) {
       if (errors.length > 0) {
         return NextResponse.json({ 
           error: `Hiçbir kayıt aktarılamadı. İlk 5 hata: ${errors.slice(0, 5).join('; ')}` 
         }, { status: 400 })
       }
       return NextResponse.json({ error: 'Hiçbir kayıt aktarılamadı. Dosya formatını kontrol ediniz.' }, { status: 400 })
    }

    return NextResponse.json({ 
        message: `İlçeler içe aktarıldı: ${created}` + (errors.length > 0 ? `. ${errors.length} kayıt başarısız oldu.` : '') 
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `İlçe içe aktarma başarısız: ${msg}` }, { status: 500 })
  }
}

function parseCSVFlexible(input: string): Array<Record<string, unknown>> {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ','
  const rawHeaders = lines[0].split(delim).map(cleanCSVValue)
  
  const headers = rawHeaders.map(normalizeHeader)
  
  const idIdx = headers.findIndex(h => /^id$/.test(h))
  const nameIdx = headers.findIndex(h => /^(ilce|ilçe|name|district)$/.test(h))
  const cityIdIdx = headers.findIndex(h => /^(il_id|cityid|city_id)$/.test(h))

  const out: Array<Record<string, unknown>> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delim).map(cleanCSVValue)
    const row: Record<string, unknown> = {
      id: idIdx >= 0 ? (cols[idIdx] ?? '') : '',
      ilce: nameIdx >= 0 ? (cols[nameIdx] ?? '') : '',
      il_id: cityIdIdx >= 0 ? (cols[cityIdIdx] ?? '') : '',
    }
    out.push(row)
  }
  return out
}

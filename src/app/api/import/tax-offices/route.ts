import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decodeCSV, cleanCSVValue, normalizeHeader } from '@/lib/csv'

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
      rows = await parseCSVFlexible(text)
    } else {
      // Excel support - simplified for now, assuming standard headers match our logic
      // Ideally we should apply similar header normalization for Excel too
      const XLSXMod = await import('xlsx')
      const XLSX = XLSXMod.default || XLSXMod
      const wb = XLSX.read(buf, { type: 'buffer' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rawRows: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Array<Record<string, unknown>>
      if (!rawRows.length) return NextResponse.json({ error: 'Boş Excel' }, { status: 400 })
      
      // Map Excel headers to our standard keys
      const headers = Object.keys(rawRows[0] || {})
      const normalizedHeaders = headers.map(h => ({ original: h, normalized: normalizeHeader(h) }))
      
      const codeKey = normalizedHeaders.find(h => /^(code|say_kodu|vergi_dairesi_kodu)$/.test(h.normalized))?.original
      const nameKey = normalizedHeaders.find(h => /^(name|vergi_dairesi|vergi_dairesi_adi)$/.test(h.normalized))?.original
      const cityIdKey = normalizedHeaders.find(h => /^(cityid|il_id|city_id|ilid)$/.test(h.normalized))?.original
      const distKey = normalizedHeaders.find(h => /^(district|ilce|ilce)$/.test(h.normalized))?.original
      
      if (!codeKey || !nameKey) {
         // Try 5-column fallback logic for Excel if headers don't match? 
         // For now, return error if strict headers missing, or try flexible mapping
         return NextResponse.json({ error: "Excel başlıkları tanınamadı. Lütfen 'say_kodu' ve 'vergi_dairesi' sütunlarını kontrol edin." }, { status: 400 })
      }
      
      rows = rawRows.map(r => ({
        code: String(r[codeKey!] ?? '').trim(),
        name: String(r[nameKey!] ?? '').trim(),
        cityId: cityIdKey ? String(r[cityIdKey] ?? '').trim() : undefined,
        district: distKey ? String(r[distKey] ?? '').trim() : undefined,
      }))
    }
    
    // Collect all potential City IDs to validate them
    const potentialCityIds = new Set<number>()
    rows.forEach(r => {
      if (r.cityId) {
        const c = parseInt(String(r.cityId), 10)
        if (!isNaN(c)) potentialCityIds.add(c)
      }
      // Also check 'cityCode' from flexible CSV parser
      if (r.cityCode) {
        const c = parseInt(String(r.cityCode), 10)
        if (!isNaN(c)) potentialCityIds.add(c)
      }
    })

    const validCityIds = new Set<number>()
    if (potentialCityIds.size > 0) {
      const cities = await prisma.city.findMany({
        where: { id: { in: Array.from(potentialCityIds) } },
        select: { id: true }
      })
      cities.forEach(c => validCityIds.add(c.id))
    }

    let created = 0
    let updated = 0
    let errors = 0

    for (const r of rows) {
      let code = String((r['code'] ?? '')).trim()
      let name = String((r['name'] ?? '')).trim()
      let distName = String((r['district'] ?? '')).trim()
      
      // Determine City ID
      let cityId: number | null = null
      const rawCityId = r.cityId || r.cityCode
      if (rawCityId) {
        const c = parseInt(String(rawCityId), 10)
        if (validCityIds.has(c)) {
          cityId = c
        }
      }

      if (!name) continue
      
      // Upsert logic
      try {
        if (code) {
          // Smart Upsert:
          // 1. Try to find by code
          // 2. If not found, try to find by name (to fix existing records with null codes)
          // 3. If neither, create new
          
          const existingByCode = await prisma.taxOffice.findUnique({ 
            where: { code } 
          })

          if (existingByCode) {
            await prisma.taxOffice.update({
              where: { id: existingByCode.id },
              data: { 
                name, 
                district: distName || null, 
                cityId: cityId // Update cityId if valid
              }
            })
            updated++
          } else {
            // Check if exists by name to avoid duplicates and repair bad data
            const existingByName = await prisma.taxOffice.findFirst({
              where: { name }
            })

            if (existingByName) {
              await prisma.taxOffice.update({
                where: { id: existingByName.id },
                data: {
                  code, // Set the missing code
                  district: distName || null,
                  cityId: cityId || existingByName.cityId
                }
              })
              updated++
            } else {
              await prisma.taxOffice.create({ 
                data: { 
                  code, 
                  name, 
                  district: distName || null, 
                  cityId: cityId 
                } 
              })
              created++
            }
          }
        } else {
          // If no code, we can't safely upsert because name is not unique anymore.
          // However, we can try to find by name (and maybe cityId) and update, or create new.
          // Since this is a specialized import, we strongly prefer having a code.
          // If name is present, check if it exists
          const existing = await prisma.taxOffice.findFirst({
            where: { name: name } // We could add cityId filter too if needed
          })
          
          if (existing) {
             await prisma.taxOffice.update({
               where: { id: existing.id },
               data: {
                 district: distName || null,
                 cityId: cityId || existing.cityId,
                 // Don't update code if it's missing in CSV
               }
             })
             updated++
          } else {
             // Create new without code? Code is optional in schema now but logic demands it.
             // If we create without code, it's fine for now.
             await prisma.taxOffice.create({
               data: {
                 name,
                 district: distName || null,
                 cityId: cityId,
                 code: null
               }
             })
             created++
          }
        }
      } catch (err) {
        console.error(`TaxOffice import error for ${name}:`, err)
        errors++
      }
    }
    
    return NextResponse.json({ 
      message: `İşlem tamamlandı.`,
      details: `Eklenen/Güncellenen: ${created + updated}, Hatalı: ${errors}`
    })
    
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `İçe aktarma başarısız: ${msg}` }, { status: 500 })
  }
}

async function parseCSVFlexible(input: string): Promise<Array<Record<string, unknown>>> {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const delim = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ','
  
  const rawHeaders = lines[0].split(delim).map(cleanCSVValue)
  const headers = rawHeaders.map(normalizeHeader)
  
  // Regex matchers for headers
  const codeIdx = headers.findIndex(h => /^(code|say_kodu|say kodu|vergi_dairesi_kodu|vergi dairesi kodu|kod|kodu)$/.test(h))
  const nameIdx = headers.findIndex(h => /^(name|vergi_dairesi|vergi dairesi|vergi_dairesi_adi|vergi dairesi adi|ad|adi)$/.test(h))
  const cityIdIdx = headers.findIndex(h => /^(cityid|il_id|il id|city_id|ilid|plaka|il_kodu|il kodu|il|sehir)$/.test(h))
  const distIdx = headers.findIndex(h => /^(district|ilce|ilçe|semt)$/.test(h))

  const out: Array<Record<string, unknown>> = []

  // If standard headers are detected
  if (codeIdx >= 0 && nameIdx >= 0) {
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delim).map(cleanCSVValue)
      const row: Record<string, unknown> = {
        code: (cols[codeIdx] ?? '').trim(),
        name: (cols[nameIdx] ?? '').trim(),
      }
      if (cityIdIdx >= 0) row['cityId'] = (cols[cityIdIdx] ?? '').trim()
      if (distIdx >= 0) row['district'] = (cols[distIdx] ?? '').trim()
      out.push(row)
    }
  } else {
    // Fallback: Check for 5-column format (Seq;CityCode;District;Code;Name)
    // SQL Dump Format: (id, il_id, ilce, say_kodu, vergi_dairesi)
    // Index mapping: 0:id, 1:il_id, 2:ilce, 3:say_kodu, 4:vergi_dairesi
    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split(delim).map(cleanCSVValue)
      
      if (cols.length >= 5) {
        const cityCode = cols[1].trim()
        const district = cols[2].trim()
        const code = cols[3].trim()
        const name = cols[4].trim()

        if (code && name) {
           out.push({
             cityCode, // Will be mapped to cityId in main function
             district,
             code,
             name
           })
        }
      } else if (cols.length === 4) {
        // New format: say_kodu, il_id, ilce, vergi_dairesi
        const code = cols[0].trim()
        const cityCode = cols[1].trim()
        const district = cols[2].trim()
        const name = cols[3].trim()

        if (code && name) {
           out.push({
             code,
             cityCode,
             district,
             name
           })
        }
      }
    }
  }
  
  return out
}

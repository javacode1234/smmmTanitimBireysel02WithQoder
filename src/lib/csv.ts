import { Buffer } from 'buffer'

export async function decodeCSV(buf: Buffer): Promise<string> {
  try {
    const iconvMod: unknown = await import('iconv-lite')
    // Handle different import styles (ESM/CJS)
    const iconv = (iconvMod as { default?: { decode: (b: Buffer, enc: string) => string }; decode?: (b: Buffer, enc: string) => string }).default || (iconvMod as { decode: (b: Buffer, enc: string) => string })
    
    const tryDecode = (enc: string) => {
      try { return iconv.decode(buf, enc) } catch { return '' }
    }
    
    // Common encodings in Turkey
    const candidates = ['utf8', 'windows-1254', 'iso-8859-9']
    for (const enc of candidates) {
      const s = tryDecode(enc)
      // Check if decoding resulted in replacement characters which indicate failure
      if (s && !/\uFFFD/.test(s)) return s
    }
    
    return tryDecode('utf8') || buf.toString('utf8')
  } catch {
    return buf.toString('utf8')
  }
}

export function normalizeHeader(s: string): string {
  let t = String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  t = t.toLocaleLowerCase('tr-TR')
    .replace(/[ıİ]/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

export function cleanCSVValue(val: string): string {
  return val.trim().replace(/^[\uFEFF\"“”]+|[\uFEFF\"“”]+$/g, '')
}

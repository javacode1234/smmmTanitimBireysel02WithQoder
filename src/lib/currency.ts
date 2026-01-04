export const formatTL = (val: string | number): string => {
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.,-]/g, '').replace(',', '.')) : Number(val)
  if (!isFinite(num)) return typeof val === 'string' ? val : ''
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL'
}

export const parseTLInput = (input: string): string => {
  const cleaned = (input || '').replace(/[^\d.,-]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isFinite(num) ? String(num) : ''
}

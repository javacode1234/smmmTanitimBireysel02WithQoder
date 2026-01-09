export const makeSnapshot = async (file: File) => {
  const buf = await file.arrayBuffer()
  const blob = new Blob([buf], { type: file.type || 'application/octet-stream' })
  return new File([blob], file.name, { type: file.type || 'application/octet-stream', lastModified: Date.now() })
}

export const downloadCSV = (filename: string, headers: string[], rows: string[][], delim: string = ';') => {
  const encode = (v: string) => {
    const s = String(v ?? '')
    if (s.includes(delim) || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const content = [headers.map(encode).join(delim), ...rows.map(r => r.map(encode).join(delim))].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

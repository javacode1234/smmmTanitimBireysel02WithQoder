"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function SettingsPage() {
  const [citiesFile, setCitiesFile] = useState<File | null>(null)
  const [districtsFile, setDistrictsFile] = useState<File | null>(null)
  const [taxOfficesFile, setTaxOfficesFile] = useState<File | null>(null)
  const [activityCodesFile, setActivityCodesFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const makeSnapshot = async (file: File) => {
    const buf = await file.arrayBuffer()
    const blob = new Blob([buf], { type: file.type || 'application/octet-stream' })
    return new File([blob], file.name, { type: file.type || 'application/octet-stream', lastModified: Date.now() })
  }

  const upload = async (endpoint: string, file: File | null, label?: string) => {
    if (!file) { toast.error("Dosya seçin"); return }
    setLoading(true)
    try {
      const fd = new FormData()
      const buf = await file.arrayBuffer()
      const blob = new Blob([buf], { type: file.type || 'application/octet-stream' })
      const snapshot = new File([blob], file.name, { type: file.type || 'application/octet-stream', lastModified: Date.now() })
      fd.append("file", snapshot)
      const res = await fetch(endpoint, { method: "POST", body: fd, cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `${label || 'İçe aktarma'} başarısız`)
      toast.success(label ? `${label}: ${data?.message || 'İçe aktarma tamamlandı'}` : (data?.message || "İçe aktarma tamamlandı"))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast.error(label ? `${label}: ${msg}` : msg)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = (filename: string, headers: string[], rows: string[][], delim: string = ';') => {
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

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ayarlar / Veri İçe Aktarma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 [&_[data-slot=input]]:h-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>İller (CSV/XLS/XLSX)</Label>
              <Input type="file" accept=".csv,.xls,.xlsx" onChange={async (e) => {
                const f = e.target.files?.[0] || null
                if (!f) { setCitiesFile(null); return }
                try { const snap = await makeSnapshot(f); setCitiesFile(snap) } catch { toast.error('Dosya okunamadı') }
              }} disabled={loading} />
            </div>
            <div className="flex items-end gap-2">
              <Button disabled={loading} onClick={() => upload('/api/import/cities', citiesFile, 'İller')}>Yükle</Button>
              <Button variant="outline" disabled={loading} onClick={() => downloadCSV('iller.csv', ['code','name'], [['34','İstanbul'],['06','Ankara'],['35','İzmir']], ';')}>Örnek CSV indir</Button>
            </div>
            <div>
              <Label>İlçeler (CSV/XLS/XLSX)</Label>
              <Input type="file" accept=".csv,.xls,.xlsx" onChange={async (e) => {
                const f = e.target.files?.[0] || null
                if (!f) { setDistrictsFile(null); return }
                try { const snap = await makeSnapshot(f); setDistrictsFile(snap) } catch { toast.error('Dosya okunamadı') }
              }} disabled={loading} />
            </div>
            <div className="flex items-end gap-2">
              <Button disabled={loading} onClick={() => upload('/api/import/districts', districtsFile, 'İlçeler')}>Yükle</Button>
              <Button variant="outline" disabled={loading} onClick={() => downloadCSV('ilceler.csv', ['districtCode','cityCode','name'], [['3401','34','Kadıköy'],['3402','34','Üsküdar'],['0610','06','Çankaya']], ';')}>Örnek CSV indir</Button>
            </div>
            <div>
              <Label>Vergi Daireleri (CSV/XLS/XLSX)</Label>
              <Input type="file" accept=".csv,.xls,.xlsx" onChange={async (e) => {
                const f = e.target.files?.[0] || null
                if (!f) { setTaxOfficesFile(null); return }
                try { const snap = await makeSnapshot(f); setTaxOfficesFile(snap) } catch { toast.error('Dosya okunamadı') }
              }} disabled={loading} />
            </div>
            <div className="flex items-end gap-2">
              <Button disabled={loading} onClick={() => upload('/api/import/tax-offices', taxOfficesFile, 'Vergi Daireleri')}>Yükle</Button>
              <Button variant="outline" disabled={loading} onClick={() => downloadCSV('vergi_daireleri.csv', ['code','name','city','district'], [['340101','Kadıköy VDB','İstanbul','Kadıköy'],['340201','Üsküdar VDB','İstanbul','Üsküdar']], ';')}>Örnek CSV indir</Button>
            </div>
            <div>
              <Label>NACE Kodları (CSV/XLS/XLSX)</Label>
              <Input type="file" accept=".csv,.xls,.xlsx" onChange={async (e) => {
                const f = e.target.files?.[0] || null
                if (!f) { setActivityCodesFile(null); return }
                try { const snap = await makeSnapshot(f); setActivityCodesFile(snap) } catch { toast.error('Dosya okunamadı') }
              }} disabled={loading} />
            </div>
            <div className="flex items-end gap-2">
              <Button disabled={loading} onClick={() => upload('/api/import/activity-codes', activityCodesFile, 'NACE')}>Yükle</Button>
              <Button variant="outline" disabled={loading} onClick={() => downloadCSV('nace_kodlari.csv', ['code','tanim'], [['62.01','Bilgisayar programlama faaliyetleri'],['62.02','Bilgi teknolojisi danışmanlık faaliyetleri'],['69.20','Muhasebe, defter tutma ve denetim faaliyetleri']], ';')}>Örnek CSV indir</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

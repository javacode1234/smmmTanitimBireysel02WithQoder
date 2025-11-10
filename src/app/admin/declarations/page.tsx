"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function DeclarationsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // form state
  const [type, setType] = useState("")
  const [frequency, setFrequency] = useState("MONTHLY")
  const [enabled, setEnabled] = useState(true)
  const [dueDay, setDueDay] = useState<string>("")
  const [dueHour, setDueHour] = useState<string>("")
  const [dueMinute, setDueMinute] = useState<string>("")
  const [dueMonth, setDueMonth] = useState<string>("")
  const [quarterOffset, setQuarterOffset] = useState<string>("")
  const [yearlyCount, setYearlyCount] = useState<string>("")
  const [skipQuarter, setSkipQuarter] = useState(false)
  const [optional, setOptional] = useState(false)

  // modal + edit state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // filter + pagination
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState<number>(5)
  const [currentPage, setCurrentPage] = useState<number>(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/declarations-config")
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      } else {
        toast.error("Beyannameler yüklenemedi")
      }
    } catch (e) {
      console.error(e)
      toast.error("Beyannameler yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const resetForm = () => {
    setType("")
    setFrequency("MONTHLY")
    setEnabled(true)
    setDueDay("")
    setDueHour("")
    setDueMinute("")
    setDueMonth("")
    setQuarterOffset("")
    setYearlyCount("")
    setSkipQuarter(false)
    setOptional(false)
  }

  const handleSaveConfig = async () => {
    if (!type.trim()) { toast.error("Tür zorunludur"); return }
    try {
      if (editingId) {
        const res = await fetch("/api/declarations-config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            type,
            frequency,
            enabled,
            dueDay: dueDay ? Number(dueDay) : undefined,
            dueHour: dueHour ? Number(dueHour) : undefined,
            dueMinute: dueMinute ? Number(dueMinute) : undefined,
            dueMonth: dueMonth ? Number(dueMonth) : undefined,
            quarterOffset: quarterOffset ? Number(quarterOffset) : undefined,
            yearlyCount: yearlyCount ? Number(yearlyCount) : undefined,
            skipQuarter,
            optional,
          })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Güncellenemedi" }))
          toast.error(err.error || "Güncellenemedi")
          return
        }
        toast.success("Beyanname güncellendi")
      } else {
        const res = await fetch("/api/declarations-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            frequency,
            enabled,
            dueDay: dueDay ? Number(dueDay) : undefined,
            dueHour: dueHour ? Number(dueHour) : undefined,
            dueMinute: dueMinute ? Number(dueMinute) : undefined,
            dueMonth: dueMonth ? Number(dueMonth) : undefined,
            quarterOffset: quarterOffset ? Number(quarterOffset) : undefined,
            yearlyCount: yearlyCount ? Number(yearlyCount) : undefined,
            skipQuarter,
            optional,
          })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Kaydedilemedi" }))
          toast.error(err.error || "Kaydedilemedi")
          return
        }
        toast.success("Beyanname eklendi")
      }
      setIsModalOpen(false)
      setEditingId(null)
      resetForm()
      fetchItems()
    } catch (e) {
      console.error(e)
      toast.error("Kaydedilemedi")
    }
  }

  const toggleEnabled = async (id: string, next: boolean) => {
    try {
      const res = await fetch("/api/declarations-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: next })
      })
      if (!res.ok) throw new Error("update failed")
      setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: next } : i))
    } catch (e) {
      toast.error("Güncellenemedi")
    }
  }

  const removeItem = async (id: string) => {
    try {
      const res = await fetch(`/api/declarations-config?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
      toast.success("Silindi")
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) {
      toast.error("Silinemedi")
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Beyannameler</h1>
        <p className="text-muted-foreground mt-2">Genel beyanname türlerini ve özelliklerini tanımlayın.</p>
      </div>


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-6 md:p-8">
          <DialogHeader>
            <DialogTitle>{editingId ? "Beyannameyi Düzenle" : "Yeni Beyanname Tanımı"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm">Tür *</label>
                <Input value={type} onChange={e => setType(e.target.value)} placeholder="Örn: KDV" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Sıklık</label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Aylık</SelectItem>
                    <SelectItem value="QUARTERLY">3 Aylık</SelectItem>
                    <SelectItem value="YEARLY">Yıllık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={enabled} onCheckedChange={setEnabled} />
                <span className="text-sm">Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={optional} onCheckedChange={setOptional} />
                <span className="text-sm">İsteğe bağlı</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="space-y-2">
                <label className="text-sm">Gün</label>
                <Input value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="1-31" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Saat</label>
                <Input value={dueHour} onChange={e => setDueHour(e.target.value)} placeholder="0-23" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Dakika</label>
                <Input value={dueMinute} onChange={e => setDueMinute(e.target.value)} placeholder="0-59" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Ay (Yıllık için)</label>
                <Input value={dueMonth} onChange={e => setDueMonth(e.target.value)} placeholder="1-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-sm">Çeyrek Offset (Ay)</label>
                <Input value={quarterOffset} onChange={e => setQuarterOffset(e.target.value)} placeholder="Örn: 1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Yıllık Adet</label>
                <Input value={yearlyCount} onChange={e => setYearlyCount(e.target.value)} placeholder="Örn: 1" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={skipQuarter} onCheckedChange={setSkipQuarter} />
                <span className="text-sm">Çeyrek Atlama</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); setEditingId(null) }}>İptal</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveConfig}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Tanimli Beyannameler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3 mb-4">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { resetForm(); setEditingId(null); setIsModalOpen(true) }}>Yeni Beyanname</Button>
            <div className="flex items-center gap-3">
              <Input placeholder="Tür ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-[220px]" />
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1) }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Kayıt Sayısı" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tür</TableHead>
                  <TableHead>Sıklık</TableHead>
                  <TableHead>Gün/Saat/Dakika</TableHead>
                  <TableHead>Ay</TableHead>
                  <TableHead>Çeyrek Offset</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  if (loading) {
                    return (<TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Yükleniyor...</TableCell></TableRow>)
                  }
                  const q = search.toLowerCase()
                  const filtered = items.filter((i) => (i.type || "").toLowerCase().includes(q))
                  if (filtered.length === 0) {
                    return (<TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Tanım yok</TableCell></TableRow>)
                  }
                  const start = (currentPage - 1) * pageSize
                  const pageItems = filtered.slice(start, start + pageSize)
                  return pageItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell>{item.frequency}</TableCell>
                      <TableCell>{[item.dueDay ?? "-", item.dueHour ?? "-", item.dueMinute ?? "-"].join("/")}</TableCell>
                      <TableCell>{item.dueMonth ?? "-"}</TableCell>
                      <TableCell>{item.quarterOffset ?? "-"}</TableCell>
                      <TableCell>
                        <Switch checked={item.enabled} onCheckedChange={(v) => toggleEnabled(item.id, v)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setEditingId(item.id)
                            setType(item.type || "")
                            setFrequency(item.frequency || "MONTHLY")
                            setEnabled(!!item.enabled)
                            setDueDay(String(item.dueDay ?? ""))
                            setDueHour(String(item.dueHour ?? ""))
                            setDueMinute(String(item.dueMinute ?? ""))
                            setDueMonth(String(item.dueMonth ?? ""))
                            setQuarterOffset(String(item.quarterOffset ?? ""))
                            setYearlyCount(String(item.yearlyCount ?? ""))
                            setSkipQuarter(!!item.skipQuarter)
                            setOptional(!!item.optional)
                            setIsModalOpen(true)
                          }}>Düzenle</Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => removeItem(item.id)}>Sil</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                })()}
              </TableBody>
            </Table>
          </div>
          {(() => {
            const q = search.toLowerCase()
            const filtered = items.filter((i) => (i.type || "").toLowerCase().includes(q))
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
            const start = (currentPage - 1) * pageSize
            const end = Math.min(start + pageSize, filtered.length)
            if (filtered.length === 0) return null
            return (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Toplam {filtered.length} kayıt, {start + 1}-{end}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Önceki</Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" className="w-8" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sonraki</Button>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}

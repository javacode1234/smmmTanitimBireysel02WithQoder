"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Pencil, Trash2, Plus } from "lucide-react"

export default function DeclarationsPage() {
  interface DeclarationConfig {
    id: string
    type: string
    frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    enabled: boolean
    dueDay?: number
    dueHour?: number
    dueMinute?: number
    dueMonth?: number
    quarterOffset?: number
    yearlyCount?: number
    skipQuarter?: boolean
    optional?: boolean
    quarters?: string
    taxPeriodType?: string
    createdAt: string
    updatedAt: string
  }

  const [items, setItems] = useState<DeclarationConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [declarationTypes, setDeclarationTypes] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Frequency mapping
  const getFrequencyLabel = (frequency: string) => {
    const map: Record<string, string> = {
      'MONTHLY': 'Aylık',
      'QUARTERLY': '3 Aylık',
      'YEARLY': 'Yıllık'
    }
    return map[frequency] || frequency
  }

  

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
  const [quarters, setQuarters] = useState<number[]>([])
  const [taxPeriodType, setTaxPeriodType] = useState<string>("")

  // modal + edit state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // filter + pagination
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState<number>(5)
  const [currentPage, setCurrentPage] = useState<number>(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/declarations-config")
      if (res.ok) {
        const data: DeclarationConfig[] = await res.json()
        setItems(data)
        setDeclarationTypes(Array.from(new Set(data.map(item => item.type).filter(Boolean))))
      } else {
        toast.error("Beyannameler yüklenemedi")
      }
    } catch (e) {
      console.error(e)
      toast.error("Beyannameler yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

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
    setQuarters([])
    setTaxPeriodType("")
  }

  const validateForm = () => {
    if (!type.trim()) {
      toast.error("Beyanname türü zorunludur")
      return false
    }
    
    if (dueDay && (isNaN(Number(dueDay)) || Number(dueDay) < 1 || Number(dueDay) > 31)) {
      toast.error("Gün değeri 1-31 arasında olmalıdır")
      return false
    }
    
    if (dueHour && (isNaN(Number(dueHour)) || Number(dueHour) < 0 || Number(dueHour) > 23)) {
      toast.error("Saat değeri 0-23 arasında olmalıdır")
      return false
    }
    
    if (dueMinute && (isNaN(Number(dueMinute)) || Number(dueMinute) < 0 || Number(dueMinute) > 59)) {
      toast.error("Dakika değeri 0-59 arasında olmalıdır")
      return false
    }
    
    if (dueMonth && (isNaN(Number(dueMonth)) || Number(dueMonth) < 1 || Number(dueMonth) > 12)) {
      toast.error("Ay değeri 1-12 arasında olmalıdır")
      return false
    }
    
    if (quarterOffset && (isNaN(Number(quarterOffset)) || Number(quarterOffset) < 1 || Number(quarterOffset) > 3)) {
      toast.error("Çeyrek offset değeri 1-3 arasında olmalıdır")
      return false
    }
    
    if (yearlyCount && (isNaN(Number(yearlyCount)) || Number(yearlyCount) < 1)) {
      toast.error("Yıllık adet değeri en az 1 olmalıdır")
      return false
    }
    
    return true
  }

  const handleSaveConfig = async () => {
    if (!validateForm()) return
    
    try {
      const formData = {
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
        quarters: quarters.length > 0 ? JSON.stringify(quarters) : undefined,
        taxPeriodType: taxPeriodType || undefined,
      }

      if (editingId) {
        const res = await fetch("/api/declarations-config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            ...formData
          })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Güncellenemedi" }))
          toast.error(err.error || "Güncellenemedi")
          return
        }
        toast.success("Beyanname başarıyla güncellendi")
      } else {
        const res = await fetch("/api/declarations-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Kaydedilemedi" }))
          toast.error(err.error || "Kaydedilemedi")
          return
        }
        toast.success("Beyanname başarıyla eklendi")
      }
      setIsModalOpen(false)
      setEditingId(null)
      resetForm()
      fetchItems()
    } catch (e) {
      console.error(e)
      toast.error("İşlem sırasında bir hata oluştu")
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
      toast.success(`Beyanname ${next ? 'aktif' : 'pasif'} hale getirildi`)
    } catch {
      toast.error("Güncellenemedi")
    }
  }

  const removeItem = async (id: string) => {
    try {
      const res = await fetch(`/api/declarations-config?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
      toast.success("Beyanname başarıyla silindi")
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      toast.error("Silinemedi")
    }
  }

  // Frequency options
  const frequencyOptions = [
    { value: "MONTHLY", label: "Aylık" },
    { value: "QUARTERLY", label: "3 Aylık" },
    { value: "YEARLY", label: "Yıllık" }
  ]

  // Tax period type options
  const taxPeriodTypeOptions = [
    { value: "NORMAL", label: "Normal Dönem (Ocak-Aralık)" },
    { value: "SPECIAL", label: "Özel Dönem" }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Beyannameler</h1>
        <p className="text-muted-foreground mt-2">Genel beyanname türlerini ve özelliklerini tanımlayın.</p>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
          setEditingId(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 flex-shrink-0">
            <DialogTitle>{editingId ? "Beyannameyi Düzenle" : "Yeni Beyanname Tanımı"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="declaration-type">Beyanname Türü *</Label>
                  <Input 
                    id="declaration-type"
                    value={type} 
                    onChange={e => setType(e.target.value)} 
                    placeholder="Örn: KDV Beyannamesi" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Sıklık</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="tax-period-type">Dönem Tipi</Label>
                  <Select value={taxPeriodType} onValueChange={setTaxPeriodType}>
                    <SelectTrigger id="tax-period-type">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxPeriodTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Sadece Kurumlar Vergisi ve Gelir Vergisi için</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="enabled" 
                      checked={enabled} 
                      onCheckedChange={setEnabled} 
                    />
                    <Label htmlFor="enabled" className="text-sm cursor-pointer">
                      Aktif
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="optional" 
                      checked={optional} 
                      onCheckedChange={setOptional} 
                    />
                    <Label htmlFor="optional" className="text-sm cursor-pointer">
                      İsteğe Bağlı
                    </Label>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/10">
                <h3 className="font-medium mb-3">Zamanlama Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due-day">Son Gün</Label>
                    <Input 
                      id="due-day"
                      value={dueDay} 
                      onChange={e => setDueDay(e.target.value)} 
                      placeholder="1-31" 
                      type="number"
                      min="1"
                      max="31"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-hour">Saat</Label>
                    <Input 
                      id="due-hour"
                      value={dueHour} 
                      onChange={e => setDueHour(e.target.value)} 
                      placeholder="0-23" 
                      type="number"
                      min="0"
                      max="23"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-minute">Dakika</Label>
                    <Input 
                      id="due-minute"
                      value={dueMinute} 
                      onChange={e => setDueMinute(e.target.value)} 
                      placeholder="0-59" 
                      type="number"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="due-month">Ay (Yıllık için)</Label>
                  <Input 
                    id="due-month"
                    value={dueMonth} 
                    onChange={e => setDueMonth(e.target.value)} 
                    placeholder="1-12" 
                    type="number"
                    min="1"
                    max="12"
                  />
                </div>
              </div>

              {frequency === "QUARTERLY" && (
                <div className="border rounded-lg p-4 bg-muted/10">
                  <h3 className="font-medium mb-3">3 Aylık Beyanname Ayarları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quarter-offset">Çeyrek Offset (Ay)</Label>
                      <Input 
                        id="quarter-offset"
                        value={quarterOffset} 
                        onChange={e => setQuarterOffset(e.target.value)} 
                        placeholder="Örn: 1" 
                        type="number"
                        min="1"
                        max="3"
                      />
                      <p className="text-xs text-muted-foreground">
                        Dönem bitiminden sonra kaç ay içinde verilmeli (örn: 1 = sonraki ay)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="skip-quarter"
                          checked={skipQuarter}
                          onCheckedChange={(checked) => setSkipQuarter(checked as boolean)}
                        />
                        <Label htmlFor="skip-quarter" className="text-sm cursor-pointer">
                          Yıl Sonu Çeyreğini Atla
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Yıl sonu çeyreği (Ekim-Kasım-Aralık) için beyanname oluşturulmaz
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Çeyrek Seçimi</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[1, 2, 3, 4].map(q => (
                        <div key={q} className="flex items-center gap-2">
                          <Checkbox
                            id={`quarter-${q}`}
                            checked={quarters.includes(q)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setQuarters([...quarters, q])
                              } else {
                                setQuarters(quarters.filter(item => item !== q))
                              }
                            }}
                          />
                          <Label htmlFor={`quarter-${q}`} className="text-sm cursor-pointer">
                            Q{q}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Hangi çeyrekler için beyanname oluşturulacağını seçin (boş bırakılırsa tüm çeyrekler)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => { 
                setIsModalOpen(false)
                setEditingId(null)
                resetForm()
              }}
            >
              İptal
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleSaveConfig}
            >
              {editingId ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Tanımlı Beyannameler</CardTitle>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" 
              onClick={() => { 
                resetForm()
                setEditingId(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Beyanname
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Improved filter controls layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input 
                placeholder="Tür ara..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="w-full md:w-[220px]" 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Type Filter with Combobox */}
              {declarationTypes.length > 0 && (
                <div className="w-full md:w-[220px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Beyanname Türü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Beyannameler</SelectItem>
                      {declarationTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="w-full md:w-[140px]">
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1) }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kayıt Sayısı" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beyanname Türü</TableHead>
                  <TableHead>Sıklık</TableHead>
                  <TableHead>Zamanlama</TableHead>
                  <TableHead>Dönem Tipi</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  if (loading) {
                    return (<TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Yükleniyor...</TableCell></TableRow>)
                  }
                  const q = search.toLowerCase()
                  let filtered = items.filter((i) => (i.type || "").toLowerCase().includes(q))
                  
                  // Apply type filter
                  if (typeFilter !== 'all') {
                    filtered = filtered.filter(item => item.type === typeFilter)
                  }
                  
                  if (filtered.length === 0) {
                    return (<TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Tanım bulunamadı</TableCell></TableRow>)
                  }
                  const start = (currentPage - 1) * pageSize
                  const pageItems = filtered.slice(start, start + pageSize)
                  return pageItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell>{getFrequencyLabel(item.frequency)}</TableCell>
                      <TableCell>
                        {item.dueDay && `${item.dueDay}/${item.dueHour || 0}/${item.dueMinute || 0}`}
                        {item.dueMonth && ` Ay: ${item.dueMonth}`}
                      </TableCell>
                      <TableCell>{item.taxPeriodType ? (item.taxPeriodType === 'NORMAL' ? 'Normal' : 'Özel') : '-'}</TableCell>
                      <TableCell>
                        <Switch checked={item.enabled} onCheckedChange={(v) => toggleEnabled(item.id, v)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => {
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
                              // Parse quarters from JSON string
                              try {
                                const q = item.quarters ? JSON.parse(item.quarters) : []
                                setQuarters(Array.isArray(q) ? q : [])
                              } catch {
                                setQuarters([])
                              }
                              setTaxPeriodType(item.taxPeriodType || "")
                              setIsModalOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50" 
                            onClick={() => {
                              if (confirm(`${item.type} beyannamesini silmek istediğinize emin misiniz?`)) {
                                removeItem(item.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                })()}
              </TableBody>
            </Table>
          </div>
          {(() => {
            // Apply search filter
            const q = search.toLowerCase()
            let filtered = items.filter((i) => (i.type || "").toLowerCase().includes(q))
            
            // Apply type filter
            if (typeFilter !== 'all') {
              filtered = filtered.filter(item => item.type === typeFilter)
            }
            
            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
            const start = (currentPage - 1) * pageSize
            const end = Math.min(start + pageSize, filtered.length)
            if (filtered.length === 0) return null
            return (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                  Toplam {filtered.length} kayıt, {start + 1}-{end}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                  >
                    Önceki
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button 
                        key={i} 
                        variant={currentPage === i + 1 ? "default" : "outline"} 
                        size="sm" 
                        className="w-8" 
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}

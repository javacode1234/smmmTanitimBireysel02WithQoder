"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Save, Edit2, X, Check, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"

interface DeclarationSetting {
  id?: string
  type: string
  enabled: boolean
  frequency: 'monthly' | 'quarterly' | 'yearly'
  dueDay: number
  dueHour: number
  dueMinute: number
  dueMonth?: number
  quarterOffset?: number
  yearlyCount?: number
  skipQuarter?: number
  quarters?: number[] // Seçili çeyrekler
}

interface DeclarationSettingsProps {
  settings: DeclarationSetting[]
  customerId: string
  establishmentDate: string | null
  onUpdate: (settings: DeclarationSetting[]) => void
}

export function DeclarationSettings({ settings, customerId, establishmentDate, onUpdate }: DeclarationSettingsProps) {
  const [localSettings, setLocalSettings] = useState<DeclarationSetting[]>(settings)
  const [availableDeclarations, setAvailableDeclarations] = useState<DeclarationSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<DeclarationSetting | null>(null)
  const [generating, setGenerating] = useState(false)

  // Tanımlı beyannameleri çek
  useEffect(() => {
    const fetchDeclarations = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/declarations-config')
        if (res.ok) {
          const data = await res.json()
          // API'den gelen beyannameleri dönüştür
          const declarations = data.map((d: any) => ({
            id: d.id,
            type: d.type,
            enabled: false, // Varsayılan olarak kapalı
            frequency: d.frequency.toLowerCase(),
            dueDay: d.dueDay || 26,
            dueHour: d.dueHour || 23,
            dueMinute: d.dueMinute || 59,
            dueMonth: d.dueMonth,
            quarterOffset: d.quarterOffset,
            yearlyCount: d.yearlyCount,
            skipQuarter: d.skipQuarter,
            quarters: d.quarters ? JSON.parse(d.quarters) : undefined
          }))
          
          setAvailableDeclarations(declarations)
          
          // Eğer müşteri için ayar varsa, enabled durumlarını güncelle
          if (settings.length > 0) {
            const merged = declarations.map((decl: DeclarationSetting) => {
              const existing = settings.find(s => s.type === decl.type)
              return existing ? { ...decl, enabled: existing.enabled } : decl
            })
            setLocalSettings(merged)
          } else {
            setLocalSettings(declarations)
          }
        } else {
          toast.error("Beyanname listesi yüklenemedi")
        }
      } catch (error) {
        console.error('Error fetching declarations:', error)
        toast.error("Beyanname listesi yüklenemedi")
      } finally {
        setLoading(false)
      }
    }

    fetchDeclarations()
  }, [])

  // settings değiştiğinde enabled durumlarını güncelle
  useEffect(() => {
    if (availableDeclarations.length > 0 && settings.length > 0) {
      const merged = availableDeclarations.map(decl => {
        const existing = settings.find(s => s.type === decl.type)
        return existing ? { ...decl, enabled: existing.enabled } : decl
      })
      setLocalSettings(merged)
    }
  }, [settings, availableDeclarations])

  const toggleDeclaration = (type: string) => {
    const updated = localSettings.map(d =>
      d.type === type ? { ...d, enabled: !d.enabled } : d
    )
    setLocalSettings(updated)
    setHasChanges(true)
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditForm({ ...localSettings[index] })
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditForm(null)
  }

  const saveEdit = () => {
    if (editingIndex !== null && editForm) {
      const updated = [...localSettings]
      updated[editingIndex] = editForm
      setLocalSettings(updated)
      setHasChanges(true)
      setEditingIndex(null)
      setEditForm(null)
      toast.success("Beyanname ayarları güncellendi")
    }
  }

  const updateEditForm = (field: keyof DeclarationSetting, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/customer-declaration-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          settings: localSettings
        })
      })

      if (res.ok) {
        onUpdate(localSettings)
        setHasChanges(false)
        toast.success("Beyanname ayarları kaydedildi")
        
        // Kaydettikten sonra kullanıcıya beyannameleri oluşturmasını öner
        const enabledCount = localSettings.filter(d => d.enabled).length
        if (enabledCount > 0) {
          toast.info("Şimdi 'Beyannameleri Oluştur' butonuna tıklayarak takip kayıtlarını oluşturabilirsiniz")
        }
      } else {
        toast.error("Kaydetme başarısız")
      }
    } catch (error) {
      console.error('Error saving declaration settings:', error)
      toast.error("Kaydetme başarısız")
    }
  }

  const generateTaxReturns = async () => {
    if (!establishmentDate) {
      toast.error("Lütfen önce şirket kuruluş tarihini girin")
      return
    }

    const enabledDeclarations = localSettings.filter(d => d.enabled)
    if (enabledDeclarations.length === 0) {
      toast.error("Lütfen önce beyanname seçin")
      return
    }

    setGenerating(true)
    try {
      // Kuruluş tarihini parse et
      const estDate = new Date(establishmentDate)
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      
      const taxReturns = []

      for (const declaration of enabledDeclarations) {
        if (declaration.frequency === 'monthly') {
          // Aylık beyannameler - kuruluş tarihinden itibaren
          const estYear = estDate.getFullYear()
          const estMonth = estDate.getMonth() + 1
          
          // Kuruluş yılından başla
          for (let year = estYear; year <= currentYear; year++) {
            const startMonth = year === estYear ? estMonth : 1
            const endMonth = year === currentYear ? currentMonth : 12
            
            for (let month = startMonth; month <= endMonth; month++) {
              const dueDate = new Date(year, month, declaration.dueDay, declaration.dueHour, declaration.dueMinute)
              const period = `${year}-${String(month).padStart(2, '0')}`
              
              taxReturns.push({
                customerId,
                type: declaration.type,
                period,
                year,
                month,
                dueDate: dueDate.toISOString(),
                submittedDate: null,
                isSubmitted: false,
                notes: "Otomatik oluşturuldu"
              })
            }
          }
        } else if (declaration.frequency === 'quarterly') {
          // 3 aylık beyannameler
          const selectedQuarters = declaration.quarters && declaration.quarters.length > 0 
            ? declaration.quarters 
            : [1, 2, 3, 4]
          
          for (const q of selectedQuarters) {
            // Eğer bu çeyrek atlanacaksa devam et
            if (declaration.skipQuarter && q === declaration.skipQuarter) continue
            
            const quarterEndMonth = q * 3 // 3, 6, 9, 12
            const dueMonth = quarterEndMonth + (declaration.quarterOffset || 1) // +1 veya +2
            
            // Duedate ayı yılı aşarsa sonraki yıla geç
            const dueYear = dueMonth > 12 ? currentYear + 1 : currentYear
            const actualDueMonth = dueMonth > 12 ? dueMonth - 12 : dueMonth
            
            const dueDate = new Date(dueYear, actualDueMonth - 1, declaration.dueDay, declaration.dueHour, declaration.dueMinute)
            
            // Şirket kuruluş tarihinden önceki tarihler için beyanname oluşturma
            if (dueDate < estDate) continue
            
            const period = `${currentYear}-Q${q}`
            
            taxReturns.push({
              customerId,
              type: declaration.type,
              period,
              year: currentYear,
              month: null,
              dueDate: dueDate.toISOString(),
              submittedDate: null,
              isSubmitted: false,
              notes: `Otomatik oluşturuldu (${q}. Çeyrek)`
            })
          }
        } else if (declaration.frequency === 'yearly') {
          // Yıllık beyannameler
          const month = declaration.dueMonth || 3
          const dueDate = new Date(currentYear + 1, month - 1, declaration.dueDay, declaration.dueHour, declaration.dueMinute)
          const period = `${currentYear}`
          
          // Şirket kuruluş tarihinden önceki tarihler için beyanname oluşturma
          if (dueDate < estDate) {
            // Kuruluş yılından sonraki ilk yıl için
            const estYear = estDate.getFullYear()
            const yearlyDueDate = new Date(estYear + 1, month - 1, declaration.dueDay, declaration.dueHour, declaration.dueMinute)
            if (yearlyDueDate >= estDate) {
              taxReturns.push({
                customerId,
                type: declaration.type,
                period: `${estYear}`,
                year: estYear,
                month: null,
                dueDate: yearlyDueDate.toISOString(),
                submittedDate: null,
                isSubmitted: false,
                notes: `Otomatik oluşturuldu (${estYear} yılı)`
              })
            }
          } else {
            taxReturns.push({
              customerId,
              type: declaration.type,
              period,
              year: currentYear,
              month: null,
              dueDate: dueDate.toISOString(),
              submittedDate: null,
              isSubmitted: false,
              notes: `Otomatik oluşturuldu (${currentYear} yılı)`
            })
          }
        }
      }

      // Önce mevcut beyannameleri kontrol et
      let existingTaxReturns: any[] = []
      try {
        const checkRes = await fetch(`/api/tax-returns?customerId=${customerId}&currentPeriod=false`)
        if (checkRes.ok) {
          existingTaxReturns = await checkRes.json()
        }
      } catch (e) {
        // Hata olursa devam et, duplicate check API'de yapılacak
      }

      // Sadece mevcut olmayan beyannameleri filtrele
      const newTaxReturns = taxReturns.filter(tr => {
        return !existingTaxReturns.some(existing => 
          existing.customerId === tr.customerId &&
          existing.type === tr.type &&
          existing.period === tr.period
        )
      })

      if (newTaxReturns.length === 0) {
        toast.info("Tüm beyannameler zaten mevcut")
        return
      }

      // API'ye toplu ekleme isteği gönder
      let successCount = 0
      let duplicateCount = 0
      let errorCount = 0
      
      // Debug için ilk birkaç tax return'i logla
      console.log('Creating tax returns (first 3):', JSON.stringify(newTaxReturns.slice(0, 3), null, 2))
      
      for (const tr of newTaxReturns) {
        try {
          const res = await fetch('/api/tax-returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tr)
          })
          
          if (res.ok) {
            successCount++
          } else if (res.status === 409) {
            // Duplicate - zaten var (bu beklenen bir durum)
            duplicateCount++
          } else {
            // Diğer hatalar
            errorCount++
            
            // Response'u text olarak oku önce
            const responseText = await res.text()
            console.log('Raw response text:', responseText)
            
            // JSON parse etmeyi dene
            let errorData: any = {}
            try {
              errorData = JSON.parse(responseText)
            } catch (parseError) {
              console.log('Failed to parse response as JSON:', parseError)
              errorData = { error: `HTTP ${res.status}: ${res.statusText}`, rawResponse: responseText }
            }
            
            // Şirket kuruluş tarihi hatası için özel mesaj (artık oluşmayacak)
            if (errorData?.error && typeof errorData.error === 'string' && errorData.error.includes('kuruluş tarihinden')) {
              // Bu hata artık oluşmayacak çünkü frontend'de filtreleniyor
              console.log('Unexpected establishment date error:', errorData.error)
            } else {
              console.error('Tax return creation failed:', {
                status: res.status,
                statusText: res.statusText,
                errorData,
                requestData: tr
              })
              toast.error(`Beyanname oluşturulamadı (${res.status}): ${errorData?.error || 'Bilinmeyen hata'}`)
            }
          }
        } catch (err) {
          errorCount++
          console.error('Network error:', err)
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} adet beyanname oluşturuldu`)
      }
      if (duplicateCount > 0) {
        toast.info(`${duplicateCount} beyanname zaten mevcut`)
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} beyanname oluşturulamadı. Detaylar için konsolu kontrol edin.`)
      }
      if (successCount === 0 && duplicateCount === 0 && errorCount === 0) {
        toast.info("Hiç beyanname oluşturulmadı")
      }
    } catch (error) {
      console.error('Error generating tax returns:', error)
      toast.error("Beyannameler oluşturulurken hata oluştu")
    } finally {
      setGenerating(false)
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Aylık'
      case 'quarterly': return '3 Aylık'
      case 'yearly': return 'Yıllık'
      default: return frequency
    }
  }

  const getDueDateInfo = (declaration: DeclarationSetting) => {
    const time = `${String(declaration.dueHour).padStart(2, '0')}:${String(declaration.dueMinute).padStart(2, '0')}`
    
    if (declaration.frequency === 'yearly' && declaration.dueMonth) {
      const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
      return `${declaration.dueDay} ${months[declaration.dueMonth]} ${time}`
    }
    
    if (declaration.frequency === 'quarterly' && declaration.quarterOffset) {
      const offsetText = declaration.quarterOffset === 1 ? 'takip eden ay' : `takip eden ${declaration.quarterOffset}. ay`
      const noteText = declaration.yearlyCount ? ` (Yılda ${declaration.yearlyCount} kere)` : ''
      return `Dönem ${offsetText}ın ${declaration.dueDay}'si ${time}${noteText}`
    }
    
    return `Ayın ${declaration.dueDay}'si ${time}`
  }

  const getMonthName = (monthNum: number) => {
    const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    return months[monthNum]
  }

  const handleReset = async () => {
    // Reset to default settings from available declarations
    const resetSettings = availableDeclarations.map(decl => ({
      ...decl,
      enabled: false
    }))
    setLocalSettings(resetSettings)
    setHasChanges(true)
    
    // Also delete all customer's tax returns
    try {
      const res = await fetch(`/api/tax-returns?customerId=${customerId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Ayarlar sıfırlandı ve müşteri beyannameleri silindi")
      } else {
        toast.success("Ayarlar sıfırlandı")
        toast.info("Müşteri beyannameleri silinemedi")
      }
    } catch (e) {
      console.error(e)
      toast.success("Ayarlar sıfırlandı")
      toast.info("Müşteri beyannameleri silinemedi")
    }
  }

  const enabledCount = localSettings.filter(d => d.enabled).length

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-3">Beyannameler yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Bu müşteri için geçerli olan beyannameleri seçin
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Seçili: <span className="font-semibold text-primary">{enabledCount}</span> beyanname
          </p>
        </div>
        <div className="flex gap-2">
          {enabledCount > 0 && (
            <Button 
              onClick={generateTaxReturns} 
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {generating ? "Oluşturuluyor..." : "Beyannameleri Oluştur"}
            </Button>
          )}
          {hasChanges && (
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          )}
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            Ayarları Sıfırla
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localSettings.map((declaration, index) => (
          <Card
            key={`${declaration.type}-${index}`}
            className={`transition-all ${
              declaration.enabled
                ? 'border-primary bg-primary/5'
                : 'hover:border-gray-300'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={declaration.enabled}
                    onCheckedChange={() => toggleDeclaration(declaration.type)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className={`h-5 w-5 ${
                        declaration.enabled ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <CardTitle className="text-base">
                        {declaration.type}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                {editingIndex === index ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={saveEdit}
                      title="Kaydet"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={cancelEdit}
                      title="İptal"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEdit(index)
                    }}
                    title="Düzenle"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="ml-11">
              {editingIndex === index && editForm ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-20">
                      <Label className="text-xs">Gün</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={editForm.dueDay}
                        onChange={(e) => updateEditForm('dueDay', parseInt(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Saat</Label>
                      <div className="flex gap-1 items-center">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={editForm.dueHour}
                          onChange={(e) => updateEditForm('dueHour', parseInt(e.target.value))}
                          className="h-8 w-16"
                        />
                        <span className="text-lg">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={editForm.dueMinute}
                          onChange={(e) => updateEditForm('dueMinute', parseInt(e.target.value))}
                          className="h-8 w-16"
                        />
                      </div>
                    </div>
                  </div>

                  {editForm.frequency === 'yearly' && (
                    <div>
                      <Label className="text-xs">Ay</Label>
                      <Select
                        value={editForm.dueMonth?.toString()}
                        onValueChange={(v) => updateEditForm('dueMonth', parseInt(v))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Ocak</SelectItem>
                          <SelectItem value="2">Şubat</SelectItem>
                          <SelectItem value="3">Mart</SelectItem>
                          <SelectItem value="4">Nisan</SelectItem>
                          <SelectItem value="5">Mayıs</SelectItem>
                          <SelectItem value="6">Haziran</SelectItem>
                          <SelectItem value="7">Temmuz</SelectItem>
                          <SelectItem value="8">Ağustos</SelectItem>
                          <SelectItem value="9">Eylül</SelectItem>
                          <SelectItem value="10">Ekim</SelectItem>
                          <SelectItem value="11">Kasım</SelectItem>
                          <SelectItem value="12">Aralık</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {editForm.frequency === 'quarterly' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Dönem Sonrası (Ay)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="3"
                          value={editForm.quarterOffset || 1}
                          onChange={(e) => updateEditForm('quarterOffset', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      {editForm.yearlyCount !== undefined && (
                        <div>
                          <Label className="text-xs">Yılda Kaç Kere</Label>
                          <Input
                            type="number"
                            min="1"
                            max="4"
                            value={editForm.yearlyCount}
                            onChange={(e) => updateEditForm('yearlyCount', parseInt(e.target.value))}
                            className="h-8"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Dönem:</span>
                    <span>{getFrequencyLabel(declaration.frequency)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Son Tarih:</span>
                    <span className="text-xs">{getDueDateInfo(declaration)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {enabledCount === 0 && (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Henüz beyanname seçilmemiş</p>
          <p className="text-sm text-muted-foreground mt-1">
            Yukarıdaki kartlara tıklayarak beyanname seçin
          </p>
        </div>
      )}
    </div>
  )
}

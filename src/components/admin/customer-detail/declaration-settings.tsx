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
  type: string
  enabled: boolean
  frequency: 'monthly' | 'quarterly' | 'yearly' // Aylık, 3 Aylık, Yıllık
  dueDay: number // Ayın kaçında verilir (örn: 26)
  dueHour: number // Saat (23)
  dueMinute: number // Dakika (59)
  dueMonth?: number // Yıllık beyannameler için ay (örn: 3 = Mart, 4 = Nisan)
  quarterOffset?: number // 3 aylık beyannameler için kaç ay sonra (örn: 2 = 2. ay)
  yearlyCount?: number // Yılda kaç kere verilir (örn: 3)
  skipQuarter?: number // Hangi çeyreği atla (örn: 4 = 4. çeyrek yok)
}

interface DeclarationSettingsProps {
  settings: DeclarationSetting[]
  customerId: string
  establishmentDate: string | null
  onUpdate: (settings: DeclarationSetting[]) => void
}

// Varsayılan beyanname türleri ve ayarları
const defaultDeclarations: DeclarationSetting[] = [
  // KDV Beyannameleri
  { 
    type: "KDV1 Beyannamesi", 
    enabled: false, 
    frequency: 'monthly', 
    dueDay: 28, 
    dueHour: 23, 
    dueMinute: 59 
  },
  { 
    type: "KDV2 Beyannamesi", 
    enabled: false, 
    frequency: 'monthly', 
    dueDay: 23, 
    dueHour: 23, 
    dueMinute: 59 
  },
  { 
    type: "KDV3 Beyannamesi", 
    enabled: false, 
    frequency: 'monthly', 
    dueDay: 26, 
    dueHour: 23, 
    dueMinute: 59 
  },
  { 
    type: "KDV4 Beyannamesi", 
    enabled: false, 
    frequency: 'monthly', 
    dueDay: 26, 
    dueHour: 23, 
    dueMinute: 59 
  },
  
  // Muhtasar Prim Hizmet Beyannamesi
  { 
    type: "Muhtasar Prim Hizmet Beyannamesi (Aylık)", 
    enabled: false, 
    frequency: 'monthly', 
    dueDay: 26, 
    dueHour: 23, 
    dueMinute: 59 
  },
  { 
    type: "Muhtasar Prim Hizmet Beyannamesi (3 Aylık)", 
    enabled: false, 
    frequency: 'quarterly', 
    dueDay: 26, 
    dueHour: 23, 
    dueMinute: 59,
    quarterOffset: 1 // Dönemi takip eden ayın 26'sı
  },
  
  // Gelir Vergisi Beyannameleri
  { 
    type: "Gelir Geçici Vergi Beyannamesi", 
    enabled: false, 
    frequency: 'quarterly', 
    dueDay: 17, 
    dueHour: 23, 
    dueMinute: 59,
    quarterOffset: 2, // Dönemi takip eden 2. ayın 17'si
    yearlyCount: 3, // Yılda 3 kere
    skipQuarter: 4 // 4. çeyrek yok
  },
  { 
    type: "Yıllık Gelir Vergisi Beyannamesi", 
    enabled: false, 
    frequency: 'yearly', 
    dueDay: 31, // Son gün (dinamik)
    dueHour: 23, 
    dueMinute: 59,
    dueMonth: 3 // Mart ayı
  },
  
  // Kurumlar Vergisi Beyannameleri
  { 
    type: "Kurum Geçici Vergi Beyannamesi", 
    enabled: false, 
    frequency: 'quarterly', 
    dueDay: 17, 
    dueHour: 23, 
    dueMinute: 59,
    quarterOffset: 2, // Dönemi takip eden 2. ayın 17'si
    yearlyCount: 3, // Yılda 3 kere
    skipQuarter: 4 // 4. çeyrek yok
  },
  { 
    type: "Yıllık Kurumlar Vergisi Beyannamesi", 
    enabled: false, 
    frequency: 'yearly', 
    dueDay: 30, // Nisan 30 (sabit)
    dueHour: 23, 
    dueMinute: 59,
    dueMonth: 4 // Nisan ayı
  },
  
  // Diğer Beyannameler
  { 
    type: "Ba-Bs Formu", 
    enabled: false, 
    frequency: 'monthly', 
    dueDay: 23, 
    dueHour: 23, 
    dueMinute: 59 
  },
]

export function DeclarationSettings({ settings, customerId, establishmentDate, onUpdate }: DeclarationSettingsProps) {
  const [localSettings, setLocalSettings] = useState<DeclarationSetting[]>(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<DeclarationSetting | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Eğer settings boş ise varsayılan değerleri kullan
    if (settings.length === 0) {
      setLocalSettings(defaultDeclarations)
    } else {
      setLocalSettings(settings)
    }
  }, [settings])

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

  const handleSave = () => {
    onUpdate(localSettings)
    setHasChanges(false)
    toast.success("Beyanname ayarları kaydedildi")
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
      // Her enabled beyanname için 2025 yılı beyannamelerini oluştur
      const currentYear = new Date().getFullYear()
      const taxReturns = []

      for (const declaration of enabledDeclarations) {
        if (declaration.frequency === 'monthly') {
          // Aylık beyannameler - 12 tane
          for (let month = 1; month <= 12; month++) {
            const dueDate = new Date(currentYear, month, declaration.dueDay, declaration.dueHour, declaration.dueMinute)
            const period = `${currentYear}-${String(month).padStart(2, '0')}`
            
            taxReturns.push({
              customerId,
              type: declaration.type,
              period,
              dueDate: dueDate.toISOString(),
              submittedDate: null,
              isSubmitted: false,
              notes: "Otomatik oluşturuldu"
            })
          }
        } else if (declaration.frequency === 'quarterly') {
          // 3 aylık beyannameler
          const quarters = declaration.yearlyCount || 4
          for (let q = 1; q <= quarters; q++) {
            if (declaration.skipQuarter && q === declaration.skipQuarter) continue
            
            const quarterEndMonth = q * 3
            const dueMonth = quarterEndMonth + (declaration.quarterOffset || 1)
            const dueDate = new Date(currentYear, dueMonth - 1, declaration.dueDay, declaration.dueHour, declaration.dueMinute)
            const period = `${currentYear}-Q${q}`
            
            taxReturns.push({
              customerId,
              type: declaration.type,
              period,
              dueDate: dueDate.toISOString(),
              submittedDate: null,
              isSubmitted: false,
              notes: "Otomatik oluşturuldu"
            })
          }
        } else if (declaration.frequency === 'yearly') {
          // Yıllık beyannameler
          const month = declaration.dueMonth || 3
          const dueDate = new Date(currentYear, month, declaration.dueDay, declaration.dueHour, declaration.dueMinute)
          const period = `${currentYear}`
          
          taxReturns.push({
            customerId,
            type: declaration.type,
            period,
            dueDate: dueDate.toISOString(),
            submittedDate: null,
            isSubmitted: false,
            notes: "Otomatik oluşturuldu"
          })
        }
      }

      // API'ye toplu ekleme isteği gönder
      const promises = taxReturns.map(tr => 
        fetch('/api/tax-returns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tr)
        })
      )

      await Promise.all(promises)
      toast.success(`${taxReturns.length} adet beyanname oluşturuldu`)
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

  const enabledCount = localSettings.filter(d => d.enabled).length

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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
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
                    <div>
                      <Label className="text-xs">Saat</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={editForm.dueHour}
                          onChange={(e) => updateEditForm('dueHour', parseInt(e.target.value))}
                          className="h-8 w-14"
                        />
                        <span className="self-center">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={editForm.dueMinute}
                          onChange={(e) => updateEditForm('dueMinute', parseInt(e.target.value))}
                          className="h-8 w-14"
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

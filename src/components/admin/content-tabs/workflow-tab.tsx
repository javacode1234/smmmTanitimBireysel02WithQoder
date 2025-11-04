"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Phone,
  FileText,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Search,
  Edit3,
  Check,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// Available icons
const AVAILABLE_ICONS = [
  { name: "Phone", component: Phone, label: "Telefon" },
  { name: "FileText", component: FileText, label: "Dosya" },
  { name: "Users", component: Users, label: "Kullanıcılar" },
  { name: "CheckCircle2", component: CheckCircle2, label: "Onay" },
]

// Color gradients
const COLOR_GRADIENTS = [
  { value: "from-blue-500 to-blue-600", label: "Mavi", preview: "bg-gradient-to-r from-blue-500 to-blue-600" },
  { value: "from-green-500 to-green-600", label: "Yeşil", preview: "bg-gradient-to-r from-green-500 to-green-600" },
  { value: "from-purple-500 to-purple-600", label: "Mor", preview: "bg-gradient-to-r from-purple-500 to-purple-600" },
  { value: "from-orange-500 to-orange-600", label: "Turuncu", preview: "bg-gradient-to-r from-orange-500 to-orange-600" },
  { value: "from-red-500 to-red-600", label: "Kırmızı", preview: "bg-gradient-to-r from-red-500 to-red-600" },
  { value: "from-cyan-500 to-cyan-600", label: "Camgöbeği", preview: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
  { value: "from-pink-500 to-pink-600", label: "Pembe", preview: "bg-gradient-to-r from-pink-500 to-pink-600" },
  { value: "from-yellow-500 to-yellow-600", label: "Sarı", preview: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
]

interface WorkflowStep {
  id: string
  number: string
  icon: string
  title: string
  description: string
  color: string
  isActive: boolean
  order: number
}

// Default steps
const DEFAULT_STEPS: WorkflowStep[] = [
  {
    id: "default-1",
    number: "01",
    icon: "Phone",
    title: "İlk Görüşme",
    description: "Bizimle iletişime geçin. İhtiyaçlarınızı dinleyelim ve size özel çözümler sunalım.",
    color: "from-blue-500 to-blue-600",
    isActive: true,
    order: 0
  },
  {
    id: "default-2",
    number: "02",
    icon: "FileText",
    title: "Analiz ve Planlama",
    description: "İşletmenizin mali durumunu analiz eder, size özel bir hizmet planı oluştururuz.",
    color: "from-purple-500 to-purple-600",
    isActive: true,
    order: 1
  },
  {
    id: "default-3",
    number: "03",
    icon: "Users",
    title: "Uygulama",
    description: "Profesyonel ekibimiz, belirlenen plan doğrultusunda hizmetleri eksiksiz yerine getirir.",
    color: "from-orange-500 to-orange-600",
    isActive: true,
    order: 2
  },
  {
    id: "default-4",
    number: "04",
    icon: "CheckCircle2",
    title: "Takip ve Raporlama",
    description: "Sürekli takip ve düzenli raporlama ile işinizin her zaman kontrolünde olun.",
    color: "from-green-500 to-green-600",
    isActive: true,
    order: 3
  }
]

const DEFAULT_SECTION_DATA = {
  title: "Çalışma Sürecimiz",
  paragraph: "Basit ve şeffaf süreçlerimiz ile işletmenizin mali yönetimini profesyonel ellere emanet edin. Dört adımda sorunsuz bir iş birliği başlatın."
}

export function WorkflowTab() {
  const [steps, setSteps] = useState<WorkflowStep[]>(DEFAULT_STEPS)
  const [sectionData, setSectionData] = useState(DEFAULT_SECTION_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [editingStep, setEditingStep] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stepToDelete, setStepToDelete] = useState<WorkflowStep | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)

  useEffect(() => {
    fetchSteps()
    fetchSectionData()
    
    return () => {
      setIsDialogOpen(false)
      setIsDeleteDialogOpen(false)
      setIsResetDialogOpen(false)
    }
  }, [])

  const fetchSectionData = async () => {
    try {
      const response = await fetch('/api/content/workflow/section')
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          setSectionData({
            title: data.title || DEFAULT_SECTION_DATA.title,
            paragraph: data.paragraph || DEFAULT_SECTION_DATA.paragraph
          })
        } else {
          setSectionData(DEFAULT_SECTION_DATA)
        }
      } else {
        setSectionData(DEFAULT_SECTION_DATA)
      }
    } catch (error) {
      console.error('Error fetching section data:', error)
      setSectionData(DEFAULT_SECTION_DATA)
    }
  }

  const saveAllChanges = async () => {
    setSaving(true)
    try {
      console.log('Starting save process...')
      console.log('Current steps:', steps)
      
      // 1. Delete all existing steps
      const existingSteps = await fetch('/api/content/workflow')
      if (existingSteps.ok) {
        const existingData = await existingSteps.json()
        console.log('Existing steps from DB:', existingData)
        
        for (const step of existingData) {
          console.log('Deleting step:', step.id)
          const deleteResponse = await fetch(`/api/content/workflow?id=${step.id}`, {
            method: 'DELETE'
          })
          if (!deleteResponse.ok) {
            console.error('Failed to delete step:', step.id)
          }
        }
      }

      // 2. Create all steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        console.log(`Creating step ${i + 1}/${steps.length}:`, step.title)
        
        const payload = {
          number: step.number,
          icon: step.icon,
          title: step.title,
          description: step.description,
          color: step.color,
          isActive: step.isActive,
          order: i
        }
        
        console.log('Step payload:', payload)

        const createResponse = await fetch('/api/content/workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.error('Failed to create step - Response text:', errorText)
          
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch (e) {
            errorData = { error: 'Parse error', details: errorText }
          }
          
          console.error('Failed to create step - Parsed error:', errorData)
          toast.error(`Adım oluşturulamadı: ${errorData.details || errorData.error || 'Bilinmeyen hata'}`)
          throw new Error(`Failed to create step: ${JSON.stringify(errorData)}`)
        }
        
        const created = await createResponse.json()
        console.log('Step created:', created.id)
      }

      // 3. Save section data
      console.log('Saving section data...')
      const sectionResponse = await fetch('/api/content/workflow/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      })

      if (sectionResponse.ok) {
        console.log('All changes saved successfully!')
        toast.success('Tüm değişiklikler başarıyla kaydedildi!')
        setIsDatabaseEmpty(false)
        await fetchSteps()
        await fetchSectionData()
      } else {
        const errorData = await sectionResponse.json()
        console.error('Failed to save section data:', errorData)
        toast.error('Bölüm bilgileri kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error(`Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setSaving(false)
    }
  }

  const saveDefaultsToDatabase = async () => {
    setIsSavingDefaults(true)
    try {
      console.log('Saving default values to database...')
      
      // 1. Delete all existing steps
      const existingSteps = await fetch('/api/content/workflow')
      if (existingSteps.ok) {
        const existingData = await existingSteps.json()
        for (const step of existingData) {
          await fetch(`/api/content/workflow?id=${step.id}`, {
            method: 'DELETE'
          })
        }
      }

      // 2. Save default steps
      for (let i = 0; i < DEFAULT_STEPS.length; i++) {
        const step = DEFAULT_STEPS[i]
        const payload = {
          number: step.number,
          icon: step.icon,
          title: step.title,
          description: step.description,
          color: step.color,
          isActive: step.isActive,
          order: i
        }

        const createResponse = await fetch('/api/content/workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!createResponse.ok) {
          throw new Error('Varsayılan adım kaydedilemedi')
        }
      }

      // 3. Save default section data
      const sectionResponse = await fetch('/api/content/workflow/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_SECTION_DATA),
      })

      if (!sectionResponse.ok) {
        throw new Error('Bölüm bilgileri kaydedilemedi')
      }

      toast.success('Varsayılan değerler veritabanına kaydedildi!')
      setIsDatabaseEmpty(false)
      
      await fetchSteps()
      await fetchSectionData()
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error(`Varsayılan değerler kaydedilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setIsSavingDefaults(false)
    }
  }

  const fetchSteps = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/workflow')
      if (response.ok) {
        const data = await response.json()
        console.log('Workflow steps data:', data)
        
        if (data && data.length > 0) {
          const allDefaults = data.every((s: any) => s.id?.startsWith('default-'))
          setSteps(data)
          
          if (allDefaults) {
            setIsDatabaseEmpty(true)
            console.log('Database IS empty - all steps are defaults')
          } else {
            setIsDatabaseEmpty(false)
            console.log('Database NOT empty - count:', data.length)
          }
        } else {
          setSteps(DEFAULT_STEPS)
          setIsDatabaseEmpty(true)
          console.log('Database IS empty - showing defaults')
        }
      } else {
        setSteps(DEFAULT_STEPS)
        setIsDatabaseEmpty(true)
        console.log('Database IS empty - API error')
      }
    } catch (error) {
      console.error('Error fetching workflow steps:', error)
      toast.error('Adımlar yüklenirken hata oluştu, varsayılan değerler gösteriliyor')
      setSteps(DEFAULT_STEPS)
      setIsDatabaseEmpty(true)
      console.log('Database IS empty - exception')
    } finally {
      setLoading(false)
    }
  }

  const filteredSteps = steps.filter((step) =>
    step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredSteps.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSteps = filteredSteps.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleOpenDialog = (step?: WorkflowStep) => {
    if (step) {
      setEditingStep({ ...step })
    } else {
      setEditingStep({
        number: String(steps.length + 1).padStart(2, '0'),
        icon: "Phone",
        title: "",
        description: "",
        color: "from-blue-500 to-blue-600",
        isActive: true,
        order: steps.length
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingStep.number || !editingStep.title || !editingStep.description) {
      toast.error('Numara, başlık ve açıklama zorunludur')
      return
    }

    const payload = { ...editingStep }

    if (editingStep.id && !editingStep.id.startsWith('default-')) {
      setSteps(steps.map(s => 
        s.id === editingStep.id ? payload : s
      ))
      toast.success('Adım güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    } else {
      const newStep = {
        ...payload,
        id: `temp-${Date.now()}`,
        order: steps.length
      }
      setSteps([...steps, newStep])
      toast.success('Yeni adım eklendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    }
    
    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    setSteps(steps.filter(s => s.id !== id))
    toast.success('Adım silindi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsDeleteDialogOpen(false)
    setStepToDelete(null)
  }

  const handleReset = () => {
    setSteps(DEFAULT_STEPS)
    setSectionData(DEFAULT_SECTION_DATA)
    setIsDatabaseEmpty(true)
    
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const moveStep = (step: WorkflowStep, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(s => s.id === step.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= steps.length) return

    const newSteps = [...steps]
    const [movedStep] = newSteps.splice(currentIndex, 1)
    newSteps.splice(newIndex, 0, movedStep)

    const stepsWithNewOrder = newSteps.map((s, index) => ({
      ...s,
      order: index
    }))

    handleReorder(stepsWithNewOrder)
  }

  const handleReorder = async (newSteps: WorkflowStep[]) => {
    setSteps(newSteps)
    toast.success('Sıralama güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Süreç Bölümü Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Bölüm Başlığı</Label>
              <Input
                value={sectionData.title}
                onChange={(e) => {
                  setSectionData({ ...sectionData, title: e.target.value })
                }}
                placeholder="Çalışma Sürecimiz"
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={sectionData.paragraph || ""}
                onChange={(e) => {
                  setSectionData({ ...sectionData, paragraph: e.target.value })
                }}
                placeholder="Süreç bölümü açıklaması"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Table */}
      <Card>
        <CardHeader>
          <CardTitle>Süreç Adımları Tablosu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Adım ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">Sayfa başına:</Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Adım Ekle
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">No</TableHead>
                <TableHead className="w-[80px]">Icon</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[200px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSteps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Arama kriterlerine uygun sonuç bulunamadı" : "Henüz adım eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSteps.map((step) => {
                  const IconComponent = AVAILABLE_ICONS.find(i => i.name === step.icon)?.component || Phone
                  const actualIndex = steps.findIndex(s => s.id === step.id)
                  
                  return (
                    <TableRow key={step.id}>
                      <TableCell>
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold`}>
                          {step.number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{step.title}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground" title={step.description}>
                          {step.description.length > 80 
                            ? `${step.description.substring(0, 80)}...` 
                            : step.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {step.isActive ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300">Aktif</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pasif</Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveStep(step, 'up')}
                            disabled={actualIndex === 0}
                            title="Yukarı Taşı"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveStep(step, 'down')}
                            disabled={actualIndex === steps.length - 1}
                            title="Aşağı Taşı"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(step)}
                            title="Düzenle"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setStepToDelete(step)
                              setIsDeleteDialogOpen(true)
                            }}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredSteps.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredSteps.length} kayıttan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSteps.length)} arası gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-8"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsResetDialogOpen(true)} 
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Varsayılan Değerlere Sıfırla
          </Button>
          
          <Button 
            onClick={saveDefaultsToDatabase} 
            disabled={!isDatabaseEmpty || isSavingDefaults}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSavingDefaults ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Varsayılan Değerleri Veritabanına Kaydet
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={saveAllChanges} disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tüm Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) setEditingStep(null)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingStep?.id ? 'Adım Düzenle' : 'Yeni Adım Ekle'}
            </DialogTitle>
          </DialogHeader>
          
          {editingStep && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Numara *</Label>
                  <Input
                    value={editingStep.number}
                    onChange={(e) => setEditingStep({ ...editingStep, number: e.target.value })}
                    placeholder="01"
                    maxLength={2}
                  />
                </div>
                
                <div>
                  <Label>Icon</Label>
                  <Select
                    value={editingStep.icon}
                    onValueChange={(value) => setEditingStep({ ...editingStep, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map((icon) => {
                        const Icon = icon.component
                        return (
                          <SelectItem key={icon.name} value={icon.name}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{icon.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Renk</Label>
                  <Select
                    value={editingStep.color}
                    onValueChange={(value) => setEditingStep({ ...editingStep, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_GRADIENTS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-4 w-8 rounded ${color.preview}`}></div>
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Başlık *</Label>
                <Input
                  value={editingStep.title}
                  onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                  placeholder="Adım başlığı"
                />
              </div>
              
              <div>
                <Label>Açıklama *</Label>
                <Textarea
                  value={editingStep.description}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  placeholder="Adım açıklaması"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stepActive"
                  checked={editingStep.isActive}
                  onCheckedChange={(checked) => 
                    setEditingStep({ ...editingStep, isActive: checked === true })
                  }
                />
                <Label htmlFor="stepActive" className="cursor-pointer">
                  Adım aktif
                </Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              {editingStep?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setStepToDelete(null)
        }}
        onConfirm={() => stepToDelete && handleDelete(stepToDelete.id)}
        title="Adım Sil"
        description={stepToDelete ? `"${stepToDelete.title}" adımını silmek istediğinizden emin misiniz?` : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Tüm adımları silmek ve bölümü varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  )
}

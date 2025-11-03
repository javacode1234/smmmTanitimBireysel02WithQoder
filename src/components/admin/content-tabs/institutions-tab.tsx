"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, Edit, Trash2, Plus, Loader2, ArrowUp, ArrowDown, X, Search, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Institution {
  id: string
  name: string
  description?: string
  url?: string
  logo: string
  isActive: boolean
  order: number
}

interface SectionData {
  id?: string
  title: string
  paragraph: string
}

const DEFAULT_SECTION: SectionData = {
  title: "İş Birliği Yaptığımız Kurumlar",
  paragraph: "Güçlü kurum ortaklıklarımız sayesinde size en kaliteli mali müşavirlik hizmetini sunuyoruz.",
}

const DEFAULT_INSTITUTIONS: Omit<Institution, 'id'>[] = [
  {
    name: "TOBB",
    description: "Türkiye Odalar ve Borsalar Birliği",
    url: "https://www.tobb.org.tr",
    logo: "",
    isActive: true,
    order: 0,
  },
  {
    name: "TÜRMÖB",
    description: "Türkiye Serbest Muhasebeci Mali Müşavirler ve Yeminli Mali Müşavirler Odaları Birliği",
    url: "https://www.turmob.org.tr",
    logo: "",
    isActive: true,
    order: 1,
  },
  {
    name: "GIB",
    description: "Gelir İdaresi Başkanlığı",
    url: "https://www.gib.gov.tr",
    logo: "",
    isActive: true,
    order: 2,
  },
  {
    name: "SGK",
    description: "Sosyal Güvenlik Kurumu",
    url: "https://www.sgk.gov.tr",
    logo: "",
    isActive: true,
    order: 3,
  },
]

export function InstitutionsTab() {
  // Section state
  const [sectionData, setSectionData] = useState<SectionData>(DEFAULT_SECTION)
  
  // Items state - tüm değişiklikler burada tutulur
  const [items, setItems] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Institution | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingItem, setEditingItem] = useState<Institution | null>(null)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [formData, setFormData] = useState<Partial<Institution>>({
    name: "",
    description: "",
    url: "",
    logo: "",
    isActive: true,
    order: 0,
  })
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    fetchData()
    
    // Cleanup function to close dialogs on unmount
    return () => {
      setIsModalOpen(false)
      setIsDeleteDialogOpen(false)
      setIsResetDialogOpen(false)
    }
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch section data
      const sectionResponse = await fetch('/api/content/institutions/section')
      if (sectionResponse.ok) {
        const sectionJson = await sectionResponse.json()
        if (sectionJson && sectionJson.id) {
          setSectionData(sectionJson)
        } else {
          setSectionData(DEFAULT_SECTION)
        }
      } else {
        setSectionData(DEFAULT_SECTION)
      }

      // Fetch items
      const itemsResponse = await fetch('/api/content/institutions')
      if (itemsResponse.ok) {
        const itemsJson = await itemsResponse.json()
        if (itemsJson && itemsJson.length > 0) {
          setItems(itemsJson)
          setIsDatabaseEmpty(false)
        } else {
          // Database boş - default değerleri göster
          setItems(DEFAULT_INSTITUTIONS.map((inst, idx) => ({
            id: `temp-${idx}`,
            ...inst
          })))
          setIsDatabaseEmpty(true)
        }
      } else {
        // Hata durumunda default değerleri göster
        setItems(DEFAULT_INSTITUTIONS.map((inst, idx) => ({
          id: `temp-${idx}`,
          ...inst
        })))
        setIsDatabaseEmpty(true)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setSectionData(DEFAULT_SECTION)
      setItems(DEFAULT_INSTITUTIONS.map((inst, idx) => ({
        id: `temp-${idx}`,
        ...inst
      })))
      setIsDatabaseEmpty(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and paginate items
  const filteredAndPaginatedItems = useMemo(() => {
    // Filter items based on search term and status
    const filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && item.isActive) || 
                           (statusFilter === "inactive" && !item.isActive)
      return matchesSearch && matchesStatus
    })
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filtered.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage, searchTerm, statusFilter])

  // Calculate total pages
  const totalPages = useMemo(() => {
    const filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && item.isActive) || 
                           (statusFilter === "inactive" && !item.isActive)
      return matchesSearch && matchesStatus
    })
    return Math.ceil(filtered.length / itemsPerPage)
  }, [items, searchTerm, statusFilter, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, itemsPerPage])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Resim boyutu en fazla 2MB olabilir')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleOpenModal = (item?: Institution) => {
    if (item) {
      setEditingItem(item)
      setFormData(item)
    } else {
      setEditingItem(null)
      setFormData({
        name: "",
        description: "",
        url: "",
        logo: "",
        isActive: true,
        order: items.length,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.logo) {
      toast.error('Kurum adı ve logo zorunludur')
      return
    }

    if (editingItem) {
      // Güncelleme - state'de değiştir
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...formData as Institution } : item
      ))
      toast.success('Değişiklikler kaydedildi (Kaydet butonuna basın)')
    } else {
      // Yeni ekleme - state'e ekle
      const newItem: Institution = {
        id: `temp-${Date.now()}`,
        name: formData.name!,
        description: formData.description,
        url: formData.url,
        logo: formData.logo!,
        isActive: formData.isActive ?? true,
        order: items.length
      }
      setItems(prev => [...prev, newItem])
      toast.success('Kurum eklendi (Kaydet butonuna basın)')
    }
    
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    // State'den sil
    setItems(prev => prev.filter(item => item.id !== id))
    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
    toast.success('Kurum silindi (Kaydet butonuna basın)')
  }

  const moveItem = (item: Institution, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(i => i.id === item.id)
    if (currentIndex === -1) return

    let newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    // Boundary checks
    if (newIndex < 0 || newIndex >= items.length) return

    // Create a new array with items in the correct order
    const newItems = [...items]
    // Remove item from current position
    const [movedItem] = newItems.splice(currentIndex, 1)
    // Insert at new position
    newItems.splice(newIndex, 0, movedItem)

    // Update order property for all items
    const itemsWithNewOrder = newItems.map((item, index) => ({
      ...item,
      order: index
    }))

    setItems(itemsWithNewOrder)
  }

  // Bulk save - Tüm değişiklikleri kaydet
  const handleBulkSave = async () => {
    setIsSaving(true)
    try {
      // 1. Section bilgilerini kaydet
      const sectionResponse = await fetch('/api/content/institutions/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      })

      if (!sectionResponse.ok) {
        throw new Error('Section kaydedilemedi')
      }

      // 2. Tüm items'ı sil
      await fetch('/api/content/institutions/reset', {
        method: 'DELETE',
      })

      // 3. Tüm items'ı yeniden oluştur
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const payload = {
          name: item.name,
          description: item.description,
          url: item.url,
          logo: item.logo,
          isActive: item.isActive,
          order: i
        }

        const response = await fetch('/api/content/institutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`Kurum kaydedilemedi: ${item.name}`)
        }
      }

      toast.success('Tüm değişiklikler kaydedildi!')
      
      // Reload
      await fetchData()
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Kaydetme sırasında bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to default
  const handleReset = () => {
    setSectionData(DEFAULT_SECTION)
    setItems(DEFAULT_INSTITUTIONS.map((inst, idx) => ({
      id: `temp-${idx}`,
      ...inst
    })))
    toast.success('Varsayılan değerlere sıfırlandı (Kaydet butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const saveDefaultsToDatabase = async () => {
    setIsSavingDefaults(true)
    try {
      // 1. Section bilgilerini kaydet
      await fetch('/api/content/institutions/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_SECTION),
      })

      // 2. Tüm items'ı sil
      await fetch('/api/content/institutions/reset', {
        method: 'DELETE',
      })

      // 3. Varsayılan kurumları kaydet
      for (let i = 0; i < DEFAULT_INSTITUTIONS.length; i++) {
        const institution = DEFAULT_INSTITUTIONS[i]
        const response = await fetch('/api/content/institutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(institution),
        })

        if (!response.ok) {
          throw new Error('Varsayılan kurum kaydedilemedi')
        }
      }

      toast.success('Varsayılan değerler veritabanına kaydedildi!')
      await fetchData()
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error('Varsayılan değerler kaydedilemedi')
    } finally {
      setIsSavingDefaults(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bölüm Ayarları</CardTitle>
          <CardDescription>Kurumlar bölümünün başlık ve açıklamasını düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Başlık</Label>
            <Input
              id="section-title"
              value={sectionData.title}
              onChange={(e) => setSectionData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="İş Birliği Yaptığımız Kurumlar"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="section-paragraph">Açıklama</Label>
            <Textarea
              id="section-paragraph"
              value={sectionData.paragraph}
              onChange={(e) => setSectionData(prev => ({ ...prev, paragraph: e.target.value }))}
              placeholder="Güçlü kurum ortaklıklarımız sayesinde..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Institutions List Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kurumlar Bölümü</CardTitle>
              <CardDescription>Ana sayfada görüntülenecek kurum logolarını yönetin</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Kurum adı veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sayfa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 / sayfa</SelectItem>
                  <SelectItem value="10">10 / sayfa</SelectItem>
                  <SelectItem value="20">20 / sayfa</SelectItem>
                  <SelectItem value="50">50 / sayfa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Kurum Adı</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Web Sitesi</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[150px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndPaginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm || statusFilter !== "all" 
                      ? "Arama kriterlerine uygun sonuç bulunamadı" 
                      : "Henüz kurum logosu eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedItems.map((item, index) => {
                  // Calculate the actual index in the full items array for reordering
                  const actualIndex = items.findIndex(i => i.id === item.id)
                  return (
                    <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 border">
                          {item.logo && (
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.description ? (
                          <span className="text-sm text-muted-foreground" title={item.description}>
                            {item.description.length > 60 
                              ? `${item.description.substring(0, 60)}...` 
                              : item.description}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.url ? (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {new URL(item.url).hostname}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={item.isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-amber-100 text-amber-700 border-amber-300"}
                        >
                          {item.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveItem(item, 'up')}
                            disabled={actualIndex === 0}
                            title="Yukarı taşı"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveItem(item, 'down')}
                            disabled={actualIndex === items.length - 1}
                            title="Aşağı taşı"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenModal(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setItemToDelete(item)
                              setIsDeleteDialogOpen(true)
                            }}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {items.length} kurum - Sayfa {currentPage} / {totalPages}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1
                  // Show first, last, current, and nearby pages
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={currentPage === pageNumber ? "bg-blue-600 text-white" : ""}
                      >
                        {pageNumber}
                      </Button>
                    )
                  }
                  // Show ellipsis for gaps
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return (
                      <span key={pageNumber} className="px-2 py-1 text-muted-foreground">
                        ...
                      </span>
                    )
                  }
                  return null
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsResetDialogOpen(true)} 
            disabled={isResetting}
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isResetting && <RotateCcw className="mr-2 h-4 w-4" />}
            Varsayılan Değerlere Sıfırla
          </Button>
          
          <Button 
            onClick={saveDefaultsToDatabase} 
            disabled={isSavingDefaults}
            variant="default"
            className={`bg-blue-600 hover:bg-blue-700 ${!isDatabaseEmpty ? 'opacity-50' : ''}`}
          >
            {isSavingDefaults ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Varsayılan Değerleri Veritabanına Kaydet {!isDatabaseEmpty && '(Zaten kayıtlı)'}
              </>
            )}
          </Button>
        </div>

        <Button onClick={handleBulkSave} disabled={isSaving} size="lg" className="bg-green-600 hover:bg-green-700">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Tüm Değişiklikleri Kaydet
        </Button>
      </div>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Kurum Düzenle' : 'Yeni Kurum Ekle'}</DialogTitle>
            <DialogDescription>
              Kurum bilgilerini girin ve logo yükleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <div className="space-y-6">
              {/* Logo Upload Section - Modern Design */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Kurum Logosu *</Label>
                <div className="relative">
                  {formData.logo ? (
                    <div className="group relative">
                      <div className="relative w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center p-8">
                        <img
                          src={formData.logo}
                          alt="Logo Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Değiştir
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Logo yüklemek için tıklayın</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG veya SVG (maks. 2MB)</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Önerilen: Şeffaf arka planlı PNG formatında logo
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium">Kurum Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="örn: ABC Muhasebe Ltd. Şti."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">Açıklama</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="örn: Profesyonel muhasebe ve danışmanlık hizmetleri"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="url" className="text-sm font-medium">Web Sitesi</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Active/Inactive Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                    Anasayfada Göster
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isActive ? 'Logo anasayfada görünür olacak' : 'Logo anasayfada gizlenecek'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.logo || !formData.name} className="bg-blue-600 hover:bg-blue-700">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete.id)}
        title="Kurum Logosu Sil"
        description={itemToDelete ? `"${itemToDelete.name}" kurumunu silmek istediğinizden emin misiniz?` : undefined}
      />

      {/* Reset Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Tüm kurumları silmek ve bölümü varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm kurum verileri kaybolacaktır."
      />

    </div>
  )
}
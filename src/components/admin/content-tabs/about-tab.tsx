"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Award, 
  Shield, 
  Users, 
  TrendingUp,
  Plus,
  Trash2,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  X,
  RotateCcw
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Badge } from "@/components/ui/badge"

// Available icons for selection
const AVAILABLE_ICONS = [
  { name: "Award", component: Award },
  { name: "Shield", component: Shield },
  { name: "Users", component: Users },
  { name: "TrendingUp", component: TrendingUp },
  { name: "Star", component: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
  { name: "Heart", component: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> },
  { name: "Lightbulb", component: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6m-3-11a6 6 0 1 1 0 12H9a6 6 0 1 1 0-12Z"></path><path d="M12 7v1"></path><path d="M10 15h.01"></path><path d="M14 15h.01"></path><path d="M10 11h.01"></path><path d="M14 11h.01"></path></svg> },
  { name: "Target", component: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> },
  { name: "Globe", component: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
  { name: "Clock", component: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> }
]

// Default values for the about section
const DEFAULT_FEATURES = [
  {
    id: "default-1",
    icon: "Award",
    title: "Profesyonel Deneyim",
    description: "15 yılı aşkın sektör tecrübesi ile işletmenize en iyi hizmeti sunuyoruz.",
    isActive: true
  },
  {
    id: "default-2",
    icon: "Shield",
    title: "Güvenilir Hizmet",
    description: "Tüm finansal işlemleriniz gizlilik ve güvenlik garantisi altında.",
    isActive: true
  },
  {
    id: "default-3",
    icon: "Users",
    title: "Uzman Kadro",
    description: "Alanında uzman, sertifikalı mali müşavirler ile çalışıyoruz.",
    isActive: true
  },
  {
    id: "default-4",
    icon: "TrendingUp",
    title: "Sürekli Gelişim",
    description: "Güncel mevzuat ve teknoloji takibi ile hizmet kalitemizi artırıyoruz.",
    isActive: true
  }
]

const DEFAULT_ABOUT = {
  title: "Hakkımızda",
  subtitle: "Serbest Muhasebeci Mali Müşavir olarak, işletmelerin finansal süreçlerini en verimli şekilde yönetmelerine yardımcı oluyoruz.",
  description: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
  features: DEFAULT_FEATURES
}

export function AboutTab() {
  const [aboutData, setAboutData] = useState<any>(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingFeature, setEditingFeature] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [featureToDelete, setFeatureToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const itemsPerPage = 5

  // Fetch about section data from API
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/content/about')
        if (response.ok) {
          const data = await response.json()
          if (data && data.id) {
            // Ensure all features have isActive property
            if (data.features) {
              data.features = data.features.map((feature: any) => ({
                ...feature,
                isActive: feature.isActive ?? true
              }))
            }
            setAboutData(data)
            setIsDatabaseEmpty(false)
          } else {
            setAboutData(DEFAULT_ABOUT)
            setIsDatabaseEmpty(true)
          }
        } else {
          // If there's an error, use default values
          setAboutData(DEFAULT_ABOUT)
          setIsDatabaseEmpty(true)
        }
      } catch (error) {
        console.error('Error fetching about data:', error)
        // If there's an error, use default values
        setAboutData(DEFAULT_ABOUT)
        setIsDatabaseEmpty(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutData()
    
    // Cleanup function to close dialogs on unmount
    return () => {
      setIsDialogOpen(false)
      setIsDeleteDialogOpen(false)
      setIsResetDialogOpen(false)
    }
  }, [])

  // Filter features based on search term
  const filteredFeatures = aboutData.features.filter((feature: any) =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFeatures = filteredFeatures.slice(startIndex, startIndex + itemsPerPage)

  // Handle input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAboutData({ ...aboutData, title: e.target.value })
  }

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAboutData({ ...aboutData, subtitle: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAboutData({ ...aboutData, description: e.target.value })
  }

  // Handle feature changes
  const handleFeatureChange = (field: string, value: string | boolean) => {
    setEditingFeature({ ...editingFeature, [field]: value })
  }

  // Add a new feature
  const addFeature = () => {
    const newFeature = {
      id: `feature-${Date.now()}`, // Unique ID for new features
      icon: "Award",
      title: "",
      description: "",
      isActive: true // Add default active status
    }
    setEditingFeature(newFeature)
    setIsDialogOpen(true)
  }

  // Edit a feature
  const editFeature = (feature: any) => {
    // Create a deep copy of the feature to edit
    const featureCopy = JSON.parse(JSON.stringify(feature))
    // Ensure isActive property exists
    if (featureCopy.isActive === undefined) {
      featureCopy.isActive = true
    }
    setEditingFeature(featureCopy)
    setIsDialogOpen(true)
  }

  // Save feature (new or edited)
  const saveFeature = () => {
    if (!editingFeature.title.trim()) {
      toast.error("Başlık alanı boş olamaz")
      return
    }

    // Mevcut bir özelliği mi düzenliyoruz yoksa yeni bir özellik mi ekliyoruz?
    // editingFeature.id'si aboutData.features dizisinde varsa mevcut bir özelliği düzenliyoruz
    const isExistingFeature = aboutData.features.some((f: any) => f.id === editingFeature.id);
    
    if (isExistingFeature) {
      // Mevcut özelliği güncelle
      const updatedFeatures = aboutData.features.map((f: any) => {
        if (f.id === editingFeature.id) {
          return { ...editingFeature }
        }
        return f
      })
      setAboutData({ ...aboutData, features: updatedFeatures })
      toast.success("Özellik başarıyla güncellendi")
    } else {
      // Yeni özelliği ekle
      setAboutData({
        ...aboutData,
        features: [...aboutData.features, { ...editingFeature }]
      })
      toast.success("Yeni özellik başarıyla eklendi")
    }

    setIsDialogOpen(false)
    setEditingFeature(null)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (feature: any) => {
    setFeatureToDelete(feature)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete feature
  const confirmDeleteFeature = () => {
    if (featureToDelete) {
      const updatedFeatures = aboutData.features.filter((f: any) => f.id !== featureToDelete.id)
      setAboutData({ ...aboutData, features: updatedFeatures })
      toast.success("Özellik başarıyla silindi")
    }
    setIsDeleteDialogOpen(false)
    setFeatureToDelete(null)
  }

  // Save about section data
  const saveAboutData = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/content/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutData),
      })

      if (response.ok) {
        const savedData = await response.json()
        setAboutData(savedData)
        setIsDatabaseEmpty(false)
        toast.success('Hakkımızda bölümü başarıyla kaydedildi.')
      } else {
        toast.error('Hakkımızda bölümü kaydedilemedi.')
      }
    } catch (error) {
      console.error('Error saving about data:', error)
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  // Reset to default values (state only - no database change)
  const handleReset = () => {
    // Form'a default değerleri yükle
    setAboutData(DEFAULT_ABOUT)
    setIsDatabaseEmpty(true)
    
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const saveDefaultsToDatabase = async () => {
    setIsSavingDefaults(true)
    try {
      const response = await fetch('/api/content/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(DEFAULT_ABOUT),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Varsayılan değerler veritabanına kaydedildi!')
        // Reload data
        setAboutData(data)
        setIsDatabaseEmpty(false)
      } else {
        toast.error('Varsayılan değerler kaydedilemedi.')
      }
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error('Varsayılan değerler kaydedilemedi.')
    } finally {
      setIsSavingDefaults(false)
    }
  }

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hakkımızda Bölümü</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Başlık</label>
              <Input
                value={aboutData.title}
                onChange={handleTitleChange}
                placeholder="Hakkımızda başlığı"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Alt Başlık</label>
              <Textarea
                value={aboutData.subtitle}
                onChange={handleSubtitleChange}
                placeholder="Hakkımızda alt başlığı"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <Textarea
                value={aboutData.description}
                onChange={handleDescriptionChange}
                placeholder="Hakkımızda açıklaması"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Özellikler
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Özellik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={addFeature} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Özellik Ekle
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İkon</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFeatures.length > 0 ? (
                paginatedFeatures.map((feature: any) => {
                  const IconComponent = AVAILABLE_ICONS.find(icon => icon.name === feature.icon)?.component || Award
                  return (
                    <TableRow key={feature.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          <span>{feature.icon}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{feature.title}</TableCell>
                      <TableCell>
                        {feature.description.length > 50 
                          ? `${feature.description.substring(0, 50)}...` 
                          : feature.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={feature.isActive 
                          ? "bg-green-100 text-green-700 border-green-300" 
                          : "bg-amber-100 text-amber-700 border-amber-300"
                        }>
                          {feature.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editFeature(feature)}
                            title="Düzenle"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteDialog(feature)}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Hiç özellik bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredFeatures.length} özellikten {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredFeatures.length)} arası gösteriliyor
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setEditingFeature(null)
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingFeature?.id?.startsWith("feature-") ? "Yeni Özellik Ekle" : "Özellik Düzenle"}
            </DialogTitle>
            <DialogDescription>
              {editingFeature?.id?.startsWith("feature-") 
                ? "Yeni bir özellik ekleyin" 
                : `ID: #${editingFeature?.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {editingFeature && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="icon" className="text-sm font-medium">
                    İkon
                  </Label>
                  <Select
                    value={editingFeature.icon}
                    onValueChange={(value) => handleFeatureChange("icon", value)}
                  >
                    <SelectTrigger id="icon">
                      <SelectValue placeholder="Bir ikon seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map((icon) => {
                        const IconComponent = icon.component
                        return (
                          <SelectItem key={icon.name} value={icon.name}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{icon.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Başlık
                  </Label>
                  <Input
                    id="title"
                    value={editingFeature.title}
                    onChange={(e) => handleFeatureChange("title", e.target.value)}
                    placeholder="Özellik başlığı"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Açıklama
                  </Label>
                  <Textarea
                    id="description"
                    value={editingFeature.description}
                    onChange={(e) => handleFeatureChange("description", e.target.value)}
                    placeholder="Özellik açıklaması"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingFeature.isActive ?? true}
                    onChange={(e) => handleFeatureChange("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Aktif
                  </Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={saveFeature} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              {editingFeature?.id?.startsWith("feature-") ? "Kaydet" : "Güncelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setFeatureToDelete(null)
        }}
        onConfirm={confirmDeleteFeature}
        title="Özelliği Sil"
        description={`"${featureToDelete?.title}" adlı özelliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />

      {/* Reset Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Hakkımızda bölümünü varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm özelleştirilmiş içerik kaybolacaktır."
      />

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
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Varsayılan Değerleri Veritabanına Kaydet
              </>
            )}
          </Button>
          {!isDatabaseEmpty && (
            <span className="text-sm text-muted-foreground">
              Varsayılan değerler zaten kaydedilmiş
            </span>
          )}
        </div>
        <Button onClick={saveAboutData} disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700">
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
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
  )
}
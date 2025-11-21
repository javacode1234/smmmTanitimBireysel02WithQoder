"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
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
  Loader2,
  Star
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

// Color gradients
const COLOR_GRADIENTS = [
  { value: "from-blue-500 to-blue-600", label: "Mavi", preview: "bg-gradient-to-r from-blue-500 to-blue-600" },
  { value: "from-green-500 to-green-600", label: "Yeşil", preview: "bg-gradient-to-r from-green-500 to-green-600" },
  { value: "from-purple-500 to-purple-600", label: "Mor", preview: "bg-gradient-to-r from-purple-500 to-purple-600" },
  { value: "from-orange-500 to-orange-600", label: "Turuncu", preview: "bg-gradient-to-r from-orange-500 to-orange-600" },
  { value: "from-red-500 to-red-600", label: "Kırmızı", preview: "bg-gradient-to-r from-red-500 to-red-600" },
  { value: "from-cyan-500 to-cyan-600", label: "Camgöbeği", preview: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
]

interface Testimonial {
  id: string
  name: string
  position: string
  company: string
  content: string
  avatar: string
  initials: string
  color: string
  rating: number
  isActive: boolean
  order: number
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "default-1",
    name: "Ahmet Yılmaz",
    position: "Genel Müdür",
    company: "TechVision A.Ş.",
    content: "15 yıldır birlikte çalışıyoruz. Profesyonel yaklaşımları ve güvenilirlikleri sayesinde mali süreçlerimiz her zaman kontrol altında. Kesinlikle tavsiye ederim.",
    avatar: "",
    initials: "AY",
    color: "from-blue-500 to-blue-600",
    rating: 5,
    isActive: true,
    order: 0
  },
  {
    id: "default-2",
    name: "Zeynep Kaya",
    position: "İşletme Sahibi",
    company: "Kaya Tekstil",
    content: "Şirket kuruluş sürecimizde baştan sona yanımızda oldular. Tüm resmi işlemler sorunsuz tamamlandı. Muhasebe hizmetlerinden de çok memnunuz.",
    avatar: "",
    initials: "ZK",
    color: "from-purple-500 to-purple-600",
    rating: 5,
    isActive: true,
    order: 1
  },
  {
    id: "default-3",
    name: "Mehmet Demir",
    position: "Kurucu Ortak",
    company: "Demir E-Ticaret",
    content: "E-ticaret işimiz için özel çözümler sundular. Vergi optimizasyonu konusundaki tavsiyeleri ile önemli tasarruf sağladık. Çok teşekkür ederiz.",
    avatar: "",
    initials: "MD",
    color: "from-green-500 to-green-600",
    rating: 5,
    isActive: true,
    order: 2
  },
  {
    id: "default-4",
    name: "Ayşe Şahin",
    position: "Yönetim Kurulu Başkanı",
    company: "Şahin Danışmanlık",
    content: "7/24 destek hizmeti gerçekten çok değerli. Acil durumlarda her zaman ulaşabiliyoruz. Profesyonel ekipleri ve hızlı çözümleri için teşekkürler.",
    avatar: "",
    initials: "AŞ",
    color: "from-orange-500 to-orange-600",
    rating: 5,
    isActive: true,
    order: 3
  },
  {
    id: "default-5",
    name: "Can Öztürk",
    position: "CEO",
    company: "Öztürk Holding",
    content: "Holdingimizdeki tüm şirketlerin muhasebesini yönetiyorlar. Düzenli raporlama ve analiz hizmetleri stratejik kararlarımızda çok önemli rol oynuyor.",
    avatar: "",
    initials: "CÖ",
    color: "from-red-500 to-red-600",
    rating: 5,
    isActive: true,
    order: 4
  },
  {
    id: "default-6",
    name: "Elif Yıldız",
    position: "Muhasebe Müdürü",
    company: "Yıldız İnşaat",
    content: "Dijital altyapıları ve modern yaklaşımları sayesinde tüm işlemlerimiz çok hızlı ilerliyor. Ekibin bilgisi ve deneyimi gerçekten fark yaratıyor.",
    avatar: "",
    initials: "EY",
    color: "from-cyan-500 to-cyan-600",
    rating: 5,
    isActive: true,
    order: 5
  }
]

const DEFAULT_SECTION_DATA = {
  title: "Müşterilerimiz Ne Diyor?",
  paragraph: "500'den fazla mutlu müşterimizin deneyimleri. Güven ve memnuniyet odaklı hizmet anlayışımızın en büyük kanıtı."
}

export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS)
  const [sectionData, setSectionData] = useState(DEFAULT_SECTION_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)

  useEffect(() => {
    fetchTestimonials()
    fetchSectionData()
    
    return () => {
      setIsDialogOpen(false)
      setIsDeleteDialogOpen(false)
      setIsResetDialogOpen(false)
    }
  }, [])

  const fetchSectionData = async () => {
    try {
      const response = await fetch('/api/content/testimonials/section')
      if (response.ok) {
        const data: Testimonial[] = await response.json()
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

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/testimonials')
      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          const allDefaults = data.every((t: Testimonial) => t.id?.startsWith('default-'))
          setTestimonials(data)
          setIsDatabaseEmpty(allDefaults)
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS)
          setIsDatabaseEmpty(true)
        }
      } else {
        setTestimonials(DEFAULT_TESTIMONIALS)
        setIsDatabaseEmpty(true)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Yorumlar yüklenirken hata oluştu')
      setTestimonials(DEFAULT_TESTIMONIALS)
      setIsDatabaseEmpty(true)
    } finally {
      setLoading(false)
    }
  }

  const saveAllChanges = async () => {
    setSaving(true)
    try {
      // 1. Delete all existing testimonials
      const existingTestimonials = await fetch('/api/content/testimonials')
      if (existingTestimonials.ok) {
        const existingData = await existingTestimonials.json()
        for (const testimonial of existingData) {
          await fetch(`/api/content/testimonials?id=${testimonial.id}`, { method: 'DELETE' })
        }
      }

      // 2. Create all testimonials
      for (let i = 0; i < testimonials.length; i++) {
        const testimonial = testimonials[i]
        const payload = {
          name: testimonial.name,
          position: testimonial.position,
          company: testimonial.company,
          content: testimonial.content,
          avatar: testimonial.avatar,
          initials: testimonial.initials,
          color: testimonial.color,
          rating: testimonial.rating,
          isActive: testimonial.isActive,
          order: i
        }

        const response = await fetch('/api/content/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('Yorum oluşturulamadı')
        }
      }

      // 3. Save section data
      const sectionResponse = await fetch('/api/content/testimonials/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      })

      if (sectionResponse.ok) {
        toast.success('Tüm değişiklikler başarıyla kaydedildi!')
        setIsDatabaseEmpty(false)
        await fetchTestimonials()
        await fetchSectionData()
      } else {
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
      const response = await fetch('/api/content/testimonials')
      if (response.ok) {
        const existingData = await response.json()
        for (const testimonial of existingData) {
          await fetch(`/api/content/testimonials?id=${testimonial.id}`, { method: 'DELETE' })
        }
      }

      for (let i = 0; i < DEFAULT_TESTIMONIALS.length; i++) {
        const testimonial = DEFAULT_TESTIMONIALS[i]
        await fetch('/api/content/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...testimonial, order: i })
        })
      }

      await fetch('/api/content/testimonials/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_SECTION_DATA)
      })

      toast.success('Varsayılan değerler veritabanına kaydedildi!')
      setIsDatabaseEmpty(false)
      await fetchTestimonials()
      await fetchSectionData()
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error('Varsayılan değerler kaydedilemedi')
    } finally {
      setIsSavingDefaults(false)
    }
  }

  const handleReset = () => {
    setTestimonials(DEFAULT_TESTIMONIALS)
    setSectionData(DEFAULT_SECTION_DATA)
    setIsDatabaseEmpty(true)
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const handleOpenDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial({ ...testimonial })
    } else {
      setEditingTestimonial({
        name: "",
        position: "",
        company: "",
        content: "",
        avatar: "",
        initials: "??",
        color: "from-blue-500 to-blue-600",
        rating: 5,
        isActive: true,
        order: testimonials.length
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!editingTestimonial.name || !editingTestimonial.content) {
      toast.error('İsim ve içerik zorunludur')
      return
    }

    // Ensure rating is a number
    const payload = { 
      ...editingTestimonial,
      rating: Number(editingTestimonial.rating)
    }

    if (editingTestimonial.id) {
      // Update existing testimonial (both default and custom)
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? payload : t))
      toast.success('Yorum güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    } else {
      // Add new testimonial
      const newTestimonial = { ...payload, id: `temp-${Date.now()}`, order: testimonials.length }
      setTestimonials([...testimonials, newTestimonial])
      toast.success('Yeni yorum eklendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    }
    
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setTestimonials(testimonials.filter(t => t.id !== id))
    toast.success('Yorum silindi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsDeleteDialogOpen(false)
    setTestimonialToDelete(null)
  }

  const moveTestimonial = (testimonial: Testimonial, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(t => t.id === testimonial.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= testimonials.length) return

    const newTestimonials = [...testimonials]
    const [movedTestimonial] = newTestimonials.splice(currentIndex, 1)
    newTestimonials.splice(newIndex, 0, movedTestimonial)

    setTestimonials(newTestimonials.map((t, index) => ({ ...t, order: index })))
    toast.success('Sıralama güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
  }

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
          <CardTitle>Yorumlar Bölümü Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Bölüm Başlığı</Label>
              <Input
                value={sectionData.title}
                onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
                placeholder="Müşterilerimiz Ne Diyor?"
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={sectionData.paragraph || ""}
                onChange={(e) => setSectionData({ ...sectionData, paragraph: e.target.value })}
                placeholder="Bölüm açıklaması"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Yorumlar Tablosu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Yorum ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Yorum Ekle
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Avatar</TableHead>
                <TableHead>İsim</TableHead>
                <TableHead>Pozisyon</TableHead>
                <TableHead>Şirket</TableHead>
                <TableHead className="w-[100px]">Puan</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[200px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTestimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Arama sonucu bulunamadı" : "Henüz yorum eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTestimonials.map((testimonial) => {
                  const actualIndex = testimonials.findIndex(t => t.id === testimonial.id)
                  
                  return (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={`bg-gradient-to-br ${testimonial.color} text-white font-semibold`}>
                            {testimonial.initials}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{testimonial.name}</TableCell>
                      <TableCell>{testimonial.position}</TableCell>
                      <TableCell>{testimonial.company}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {testimonial.isActive ? (
                          <Badge variant="default">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveTestimonial(testimonial, 'up')}
                            disabled={actualIndex === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveTestimonial(testimonial, 'down')}
                            disabled={actualIndex === testimonials.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(testimonial)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setTestimonialToDelete(testimonial)
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

          {filteredTestimonials.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredTestimonials.length} kayıttan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTestimonials.length)} arası gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  Önceki
                </Button>
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
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
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
          <Button onClick={() => setIsResetDialogOpen(true)} variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
            <RotateCcw className="h-4 w-4 mr-2" />
            Varsayılan Değerlere Sıfırla
          </Button>
          
          <Button onClick={saveDefaultsToDatabase} disabled={!isDatabaseEmpty || isSavingDefaults} variant="default" className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
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

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) setEditingTestimonial(null)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingTestimonial?.id ? 'Yorum Düzenle' : 'Yeni Yorum Ekle'}</DialogTitle>
          </DialogHeader>
          
          {editingTestimonial && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>İsim *</Label>
                  <Input
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                
                <div>
                  <Label>Pozisyon *</Label>
                  <Input
                    value={editingTestimonial.position}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, position: e.target.value })}
                    placeholder="Genel Müdür"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Şirket</Label>
                  <Input
                    value={editingTestimonial.company}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                    placeholder="ABC Şirketi"
                  />
                </div>
                
                <div>
                  <Label>İlk Harfler</Label>
                  <Input
                    value={editingTestimonial.initials}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, initials: e.target.value.toUpperCase() })}
                    placeholder="AY"
                    maxLength={2}
                  />
                </div>
                
                <div>
                  <Label>Renk</Label>
                  <Select value={editingTestimonial.color} onValueChange={(value) => setEditingTestimonial({ ...editingTestimonial, color: value })}>
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
                <Label>Yorum İçeriği *</Label>
                <Textarea
                  value={editingTestimonial.content}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                  placeholder="Müşteri yorumu..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Puan</Label>
                <Select value={editingTestimonial.rating.toString()} onValueChange={(value) => setEditingTestimonial({ ...editingTestimonial, rating: Number(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex gap-1">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="testimonialActive"
                  checked={editingTestimonial.isActive}
                  onCheckedChange={(checked) => setEditingTestimonial({ ...editingTestimonial, isActive: checked === true })}
                />
                <Label htmlFor="testimonialActive" className="cursor-pointer">Yorum aktif</Label>
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
              {editingTestimonial?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setTestimonialToDelete(null)
        }}
        onConfirm={() => testimonialToDelete && handleDelete(testimonialToDelete.id)}
        title="Yorum Sil"
        description={testimonialToDelete ? `"${testimonialToDelete.name}" yorumunu silmek istediğinizden emin misiniz?` : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Tüm yorum verilerini silmek ve varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText,
  Calculator,
  Building2,
  TrendingUp,
  Shield,
  Users,
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
  { name: "FileText", component: FileText, label: "Dosya" },
  { name: "Calculator", component: Calculator, label: "Hesap Makinesi" },
  { name: "Building2", component: Building2, label: "Bina" },
  { name: "TrendingUp", component: TrendingUp, label: "Grafik" },
  { name: "Shield", component: Shield, label: "Kalkan" },
  { name: "Users", component: Users, label: "Kullanıcılar" },
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

interface Service {
  id: string
  icon: string
  title: string
  description: string
  features: string[]
  color: string
  isActive: boolean
  order: number
}

// Default services
const DEFAULT_SERVICES: Service[] = [
  {
    id: "default-1",
    icon: "FileText",
    title: "Beyanname Hazırlama",
    description: "Tüm vergi beyannamelerinizi zamanında ve eksiksiz hazırlıyoruz.",
    features: [
      "Gelir vergisi beyannameleri",
      "KDV beyannameleri",
      "Muhtasar beyannameler",
      "Yıllık gelir beyannameleri"
    ],
    color: "from-blue-500 to-blue-600",
    isActive: true,
    order: 0
  },
  {
    id: "default-2",
    icon: "Calculator",
    title: "Muhasebe Hizmetleri",
    description: "Günlük muhasebe işlemlerinizi profesyonel ekibimizle yönetiyoruz.",
    features: [
      "Günlük muhasebe kayıtları",
      "Defter tutma işlemleri",
      "Mali tablo hazırlama",
      "Envanter çalışmaları"
    ],
    color: "from-green-500 to-green-600",
    isActive: true,
    order: 1
  },
  {
    id: "default-3",
    icon: "Building2",
    title: "Şirket Kuruluşu",
    description: "Şirket kuruluş süreçlerinizde baştan sona yanınızdayız.",
    features: [
      "Limited/Anonim şirket kuruluşu",
      "Ticaret sicil işlemleri",
      "Vergi dairesi işlemleri",
      "SGK işveren kayıt işlemleri"
    ],
    color: "from-purple-500 to-purple-600",
    isActive: true,
    order: 2
  },
  {
    id: "default-4",
    icon: "TrendingUp",
    title: "Mali Danışmanlık",
    description: "İşletmenizin büyümesi için stratejik mali danışmanlık sunuyoruz.",
    features: [
      "Finansal analiz ve raporlama",
      "Bütçe ve planlama",
      "Yatırım danışmanlığı",
      "Maliyet optimizasyonu"
    ],
    color: "from-orange-500 to-orange-600",
    isActive: true,
    order: 3
  },
  {
    id: "default-5",
    icon: "Shield",
    title: "Denetim ve Revizyon",
    description: "Mali tablolarınızın doğruluğunu garanti altına alıyoruz.",
    features: [
      "Mali tablo denetimi",
      "Bağımsız denetim hizmetleri",
      "İç kontrol sistemleri",
      "Risk analizi ve değerlendirme"
    ],
    color: "from-red-500 to-red-600",
    isActive: true,
    order: 4
  },
  {
    id: "default-6",
    icon: "Users",
    title: "Bordro Hizmetleri",
    description: "Personel bordro ve SGK işlemlerinizi eksiksiz yönetiyoruz.",
    features: [
      "Aylık bordro hesaplama",
      "SGK prim bildirgeleri",
      "Personel giriş/çıkış işlemleri",
      "İzin ve ücret hesaplamaları"
    ],
    color: "from-cyan-500 to-cyan-600",
    isActive: true,
    order: 5
  }
]

const DEFAULT_SECTION_DATA = {
  title: "Hizmetlerimiz",
  paragraph: "İşletmenizin tüm mali ihtiyaçları için kapsamlı ve profesyonel çözümler sunuyoruz.",
  valuesTitle: "Hizmet Değerlerimiz",
  footerText: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
  footerSignature: "SMMM Ekibi",
  values: [
    { id: "value-1", text: "Müşteri memnuniyeti odaklı hizmet anlayışı", isActive: true, order: 0 },
    { id: "value-2", text: "Güncel mevzuat takibi ve uygulaması", isActive: true, order: 1 },
    { id: "value-3", text: "Hızlı ve güvenilir çözümler", isActive: true, order: 2 },
    { id: "value-4", text: "7/24 destek ve danışmanlık", isActive: true, order: 3 }
  ]
}

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES)
  const [sectionData, setSectionData] = useState(DEFAULT_SECTION_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [editingService, setEditingService] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [featureInput, setFeatureInput] = useState("")
  const [editingValue, setEditingValue] = useState<any>(null)
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false)
  const [valueToDelete, setValueToDelete] = useState<any>(null)
  const [isDeleteValueDialogOpen, setIsDeleteValueDialogOpen] = useState(false)
  const [valueSearchTerm, setValueSearchTerm] = useState("")
  const [valueCurrentPage, setValueCurrentPage] = useState(1)
  const [valueItemsPerPage, setValueItemsPerPage] = useState(5)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)

  useEffect(() => {
    fetchServices()
    fetchSectionData()
    
    return () => {
      setIsDialogOpen(false)
      setIsDeleteDialogOpen(false)
      setIsResetDialogOpen(false)
      setIsValueDialogOpen(false)
      setIsDeleteValueDialogOpen(false)
    }
  }, [])

  const fetchSectionData = async () => {
    try {
      const response = await fetch('/api/content/services/section')
      if (response.ok) {
        const data = await response.json()
        // Database'den gelen gerçek veriler varsa kullan, yoksa default'ları kullan
        if (data && data.id) {
          setSectionData({
            title: data.title || DEFAULT_SECTION_DATA.title,
            paragraph: data.paragraph || DEFAULT_SECTION_DATA.paragraph,
            valuesTitle: data.valuesTitle || DEFAULT_SECTION_DATA.valuesTitle,
            footerText: data.footerText || DEFAULT_SECTION_DATA.footerText,
            footerSignature: data.footerSignature || DEFAULT_SECTION_DATA.footerSignature,
            values: data.values && data.values.length > 0 ? data.values : DEFAULT_SECTION_DATA.values
          })
        } else {
          // Database boş - default'ları kullan
          setSectionData(DEFAULT_SECTION_DATA)
        }
      } else {
        // API hatası - default'ları kullan
        setSectionData(DEFAULT_SECTION_DATA)
      }
    } catch (error) {
      console.error('Error fetching section data:', error)
      // Hata durumunda default değerleri kullan
      setSectionData(DEFAULT_SECTION_DATA)
    }
  }

  const saveAllChanges = async () => {
    setSaving(true)
    try {
      console.log('Starting save process...')
      console.log('Current services:', services)
      
      // 1. Önce TÜM hizmetleri sil (default dahil)
      const existingServices = await fetch('/api/content/services')
      if (existingServices.ok) {
        const existingData = await existingServices.json()
        console.log('Existing services from DB:', existingData)
        
        for (const service of existingData) {
          console.log('Deleting service:', service.id)
          const deleteResponse = await fetch(`/api/content/services?id=${service.id}`, {
            method: 'DELETE'
          })
          if (!deleteResponse.ok) {
            console.error('Failed to delete service:', service.id)
          }
        }
      }

      // 2. Tüm hizmetleri yeniden oluştur (HEPSİNİ CREATE)
      for (let i = 0; i < services.length; i++) {
        const service = services[i]
        console.log(`Creating service ${i + 1}/${services.length}:`, service.title)
        
        const payload = {
          icon: service.icon,
          title: service.title,
          description: service.description,
          features: service.features, // Array olarak gönder, API'de JSON.stringify yapılacak
          color: service.color,
          isActive: service.isActive,
          order: i
        }
        
        console.log('Service payload:', payload)

        const createResponse = await fetch('/api/content/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        console.log('Create response status:', createResponse.status)
        console.log('Create response ok:', createResponse.ok)
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          console.error('Failed to create service - Response text:', errorText)
          
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch (e) {
            errorData = { error: 'Parse error', details: errorText }
          }
          
          console.error('Failed to create service - Parsed error:', errorData)
          toast.error(`Hizmet oluşturulamadı: ${errorData.details || errorData.error || 'Bilinmeyen hata'}`)
          throw new Error(`Failed to create service: ${JSON.stringify(errorData)}`)
        }
        
        const created = await createResponse.json()
        console.log('Service created:', created.id)
      }

      // 3. Section data'yı kaydet
      console.log('Saving section data...')
      const sectionResponse = await fetch('/api/content/services/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      })

      if (sectionResponse.ok) {
        const savedData = await sectionResponse.json()
        console.log('All changes saved successfully!')
        toast.success('Tüm değişiklikler başarıyla kaydedildi!')
        setIsDatabaseEmpty(false)
        // Fresh data çek
        await fetchServices()
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
      
      // 1. Tüm mevcut hizmetleri sil
      const existingServices = await fetch('/api/content/services')
      if (existingServices.ok) {
        const existingData = await existingServices.json()
        for (const service of existingData) {
          await fetch(`/api/content/services?id=${service.id}`, {
            method: 'DELETE'
          })
        }
      }

      // 2. Varsayılan hizmetleri kaydet
      for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
        const service = DEFAULT_SERVICES[i]
        const payload = {
          icon: service.icon,
          title: service.title,
          description: service.description,
          features: service.features,
          color: service.color,
          isActive: service.isActive,
          order: i
        }

        const createResponse = await fetch('/api/content/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!createResponse.ok) {
          throw new Error('Varsayılan hizmet kaydedilemedi')
        }
      }

      // 3. Varsayılan section data'yı kaydet
      const sectionResponse = await fetch('/api/content/services/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_SECTION_DATA),
      })

      if (!sectionResponse.ok) {
        throw new Error('Bölüm bilgileri kaydedilemedi')
      }

      toast.success('Varsayılan değerler veritabanına kaydedildi!')
      setIsDatabaseEmpty(false)
      
      // Fresh data çek
      await fetchServices()
      await fetchSectionData()
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error(`Varsayılan değerler kaydedilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setIsSavingDefaults(false)
    }
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/services')
      if (response.ok) {
        const data = await response.json()
        console.log('Services data:', data) // Debug
        
        // Eğer gerçek veri varsa kullan, yoksa default'ları kullan
        if (data && data.length > 0) {
          // Check if all services are defaults (id starts with 'default-')
          const allDefaults = data.every((s: any) => s.id?.startsWith('default-'))
          
          const parsedData = data.map((service: any) => ({
            ...service,
            features: typeof service.features === 'string' 
              ? JSON.parse(service.features) 
              : service.features || []
          }))
          
          setServices(parsedData)
          
          // If all services are defaults, database is considered empty
          if (allDefaults) {
            setIsDatabaseEmpty(true)
            console.log('Database IS empty - all services are defaults')
          } else {
            setIsDatabaseEmpty(false)
            console.log('Database NOT empty - count:', data.length)
          }
        } else {
          setServices(DEFAULT_SERVICES)
          setIsDatabaseEmpty(true) // Database boş
          console.log('Database IS empty - showing defaults')
        }
      } else {
        setServices(DEFAULT_SERVICES)
        setIsDatabaseEmpty(true)
        console.log('Database IS empty - API error')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Hizmetler yüklenirken hata oluştu, varsayılan değerler gösteriliyor')
      setServices(DEFAULT_SERVICES)
      setIsDatabaseEmpty(true)
      console.log('Database IS empty - exception')
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Reset value page when search changes
  useEffect(() => {
    setValueCurrentPage(1)
  }, [valueSearchTerm])

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService({ ...service })
    } else {
      setEditingService({
        icon: "FileText",
        title: "",
        description: "",
        features: [],
        color: "from-blue-500 to-blue-600",
        isActive: true,
        order: services.length
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingService.title || !editingService.description) {
      toast.error('Başlık ve açıklama zorunludur')
      return
    }

    // Sadece local state'i güncelle, database'e kaydetme
    const payload = {
      ...editingService,
      features: editingService.features
    }

    if (editingService.id && !editingService.id.startsWith('default-')) {
      // Mevcut hizmeti güncelle (local state'te)
      setServices(services.map(s => 
        s.id === editingService.id ? payload : s
      ))
      toast.success('Hizmet güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    } else {
      // Yeni hizmet ekle (local state'te)
      const newService = {
        ...payload,
        id: `temp-${Date.now()}`, // Geçici ID
        order: services.length
      }
      setServices([...services, newService])
      toast.success('Yeni hizmet eklendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    }
    
    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    // Sadece local state'ten sil, database'den silme
    setServices(services.filter(s => s.id !== id))
    toast.success('Hizmet silindi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsDeleteDialogOpen(false)
    setServiceToDelete(null)
  }

  const handleReset = () => {
    // Sadece local state'i varsayılan değerlere sıfırla, database'e dokunma
    setServices(DEFAULT_SERVICES)
    setSectionData(DEFAULT_SECTION_DATA)
    setIsDatabaseEmpty(true)
    
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const moveService = (service: Service, direction: 'up' | 'down') => {
    const currentIndex = services.findIndex(s => s.id === service.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= services.length) return

    const newServices = [...services]
    const [movedService] = newServices.splice(currentIndex, 1)
    newServices.splice(newIndex, 0, movedService)

    const servicesWithNewOrder = newServices.map((s, index) => ({
      ...s,
      order: index
    }))

    handleReorder(servicesWithNewOrder)
  }

  const handleReorder = async (newServices: Service[]) => {
    // Sadece local state'i güncelle
    setServices(newServices)
    toast.success('Sıralama güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    
    setEditingService({
      ...editingService,
      features: [...editingService.features, featureInput]
    })
    setFeatureInput("")
  }

  const removeFeature = (index: number) => {
    setEditingService({
      ...editingService,
      features: editingService.features.filter((_: any, i: number) => i !== index)
    })
  }



  // Value management functions
  const addValueDialog = () => {
    setEditingValue({
      id: `value-${Date.now()}`,
      text: "",
      isActive: true
    })
    setIsValueDialogOpen(true)
  }

  const editValueDialog = (value: any) => {
    setEditingValue({ ...value })
    setIsValueDialogOpen(true)
  }

  const saveValue = () => {
    if (!editingValue.text.trim()) {
      toast.error("Değer alanı boş olamaz")
      return
    }

    const isExistingValue = sectionData.values.some((v: any) => v.id === editingValue.id)
    
    if (isExistingValue) {
      const updatedValues = sectionData.values.map((v: any) =>
        v.id === editingValue.id ? { ...editingValue } : v
      )
      setSectionData({ ...sectionData, values: updatedValues })
      toast.success("Değer güncellendi")
    } else {
      setSectionData({
        ...sectionData,
        values: [...sectionData.values, { ...editingValue }]
      })
      toast.success("Yeni değer eklendi")
    }

    setIsValueDialogOpen(false)
    setEditingValue(null)
  }

  const openDeleteValueDialog = (value: any) => {
    setValueToDelete(value)
    setIsDeleteValueDialogOpen(true)
  }

  const confirmDeleteValue = () => {
    if (valueToDelete) {
      setSectionData({
        ...sectionData,
        values: sectionData.values.filter((v: any) => v.id !== valueToDelete.id)
      })
      toast.success("Değer silindi")
    }
    setIsDeleteValueDialogOpen(false)
    setValueToDelete(null)
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
      {/* Bölüm Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Hizmetler Bölümü Ayarları</CardTitle>
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
                placeholder="Hizmetlerimiz"
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={sectionData.paragraph || ""}
                onChange={(e) => {
                  setSectionData({ ...sectionData, paragraph: e.target.value })
                }}
                placeholder="Hizmetler bölümü açıklaması"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hizmetler Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Hizmetler Tablosu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Hizmet ara..."
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
              Yeni Hizmet Ekle
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Icon</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="w-[100px]">Özellikler</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[200px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Arama kriterlerine uygun sonuç bulunamadı" : "Henüz hizmet eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => {
                  const IconComponent = AVAILABLE_ICONS.find(i => i.name === service.icon)?.component || FileText
                  const actualIndex = services.findIndex(s => s.id === service.id)
                  
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground" title={service.description}>
                          {service.description.length > 80 
                            ? `${service.description.substring(0, 80)}...` 
                            : service.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {service.features?.length || 0} özellik
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {service.isActive ? (
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
                            onClick={() => moveService(service, 'up')}
                            disabled={actualIndex === 0}
                            title="Yukarı Taşı"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveService(service, 'down')}
                            disabled={actualIndex === services.length - 1}
                            title="Aşağı Taşı"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(service)}
                            title="Düzenle"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setServiceToDelete(service)
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
          {filteredServices.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredServices.length} kayıttan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredServices.length)} arası gösteriliyor
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

      {/* Hizmet Değerleri */}
      <Card>
        <CardHeader>
          <CardTitle>Hizmet Değerleri Bölümü</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Başlık</Label>
              <Input
                value={sectionData.valuesTitle || ""}
                onChange={(e) => {
                  setSectionData({ ...sectionData, valuesTitle: e.target.value })
                }}
                placeholder="Hizmet Değerlerimiz"
              />
            </div>
            <div>
              <Label>Alt Metin</Label>
              <Textarea
                value={sectionData.footerText || ""}
                onChange={(e) => {
                  setSectionData({ ...sectionData, footerText: e.target.value })
                }}
                placeholder="Alt metin"
                rows={2}
              />
            </div>
          </div>
          
          <div>
            <Label>İmza</Label>
            <Input
              value={sectionData.footerSignature || ""}
              onChange={(e) => {
                setSectionData({ ...sectionData, footerSignature: e.target.value })
              }}
              placeholder="SMMM Ekibi"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Değerler Tablosu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Değer ara..."
                  value={valueSearchTerm}
                  onChange={(e) => setValueSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">Sayfa başına:</Label>
                <Select
                  value={valueItemsPerPage.toString()}
                  onValueChange={(value) => {
                    setValueItemsPerPage(Number(value))
                    setValueCurrentPage(1)
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
            <Button onClick={addValueDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Değer Ekle
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Değer</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[150px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const filteredValues = (sectionData.values || []).filter((value: any) =>
                  value.text.toLowerCase().includes(valueSearchTerm.toLowerCase())
                )
                const totalValuePages = Math.ceil(filteredValues.length / valueItemsPerPage)
                const startValueIndex = (valueCurrentPage - 1) * valueItemsPerPage
                const paginatedValues = filteredValues.slice(startValueIndex, startValueIndex + valueItemsPerPage)

                return paginatedValues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      {valueSearchTerm ? "Arama kriterlerine uygun sonuç bulunamadı" : "Henüz değer eklenmemiş"}
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {paginatedValues.map((value: any) => (
                      <TableRow key={value.id}>
                        <TableCell className="font-medium">{value.text}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {value.isActive ? (
                              <Badge className="bg-green-100 text-green-700 border-green-300">Aktif</Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pasif</Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => editValueDialog(value)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => openDeleteValueDialog(value)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )
              })()}
            </TableBody>
          </Table>

          {/* Pagination */}
          {(() => {
            const filteredValues = (sectionData.values || []).filter((value: any) =>
              value.text.toLowerCase().includes(valueSearchTerm.toLowerCase())
            )
            const totalValuePages = Math.ceil(filteredValues.length / valueItemsPerPage)
            const startValueIndex = (valueCurrentPage - 1) * valueItemsPerPage

            return filteredValues.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Toplam {filteredValues.length} kayıttan {startValueIndex + 1}-{Math.min(startValueIndex + valueItemsPerPage, filteredValues.length)} arası gösteriliyor
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setValueCurrentPage(valueCurrentPage - 1)}
                    disabled={valueCurrentPage === 1}
                  >
                    Önceki
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalValuePages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={valueCurrentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8"
                        onClick={() => setValueCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setValueCurrentPage(valueCurrentPage + 1)}
                    disabled={valueCurrentPage === totalValuePages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )
          })()}
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
        if (!open) setEditingService(null)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingService?.id ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
            </DialogTitle>
          </DialogHeader>
          
          {editingService && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Icon</Label>
                  <Select
                    value={editingService.icon}
                    onValueChange={(value) => setEditingService({ ...editingService, icon: value })}
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
                    value={editingService.color}
                    onValueChange={(value) => setEditingService({ ...editingService, color: value })}
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
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  placeholder="Hizmet başlığı"
                />
              </div>
              
              <div>
                <Label>Açıklama *</Label>
                <Textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Hizmet açıklaması"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Özellikler</Label>
                <div className="space-y-2">
                  {editingService.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} readOnly className="flex-1" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Yeni özellik ekle..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="serviceActive"
                  checked={editingService.isActive}
                  onCheckedChange={(checked) => 
                    setEditingService({ ...editingService, isActive: checked === true })
                  }
                />
                <Label htmlFor="serviceActive" className="cursor-pointer">
                  Hizmet aktif
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
              {editingService?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Value Edit Dialog */}
      <Dialog open={isValueDialogOpen} onOpenChange={(open) => {
        setIsValueDialogOpen(open)
        if (!open) setEditingValue(null)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingValue?.id?.startsWith("value-") ? "Yeni Değer Ekle" : "Değer Düzenle"}
            </DialogTitle>
          </DialogHeader>
          
          {editingValue && (
            <div className="space-y-4 p-6">
              <div>
                <Label htmlFor="valueText">Değer Metni</Label>
                <Textarea
                  id="valueText"
                  value={editingValue.text}
                  onChange={(e) => setEditingValue({ ...editingValue, text: e.target.value })}
                  placeholder="Değer açıklaması"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="valueActive"
                  checked={editingValue.isActive ?? true}
                  onCheckedChange={(checked) => 
                    setEditingValue({ ...editingValue, isActive: checked === true })
                  }
                />
                <Label htmlFor="valueActive" className="cursor-pointer">
                  Değer aktif
                </Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsValueDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={saveValue} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              {editingValue?.id?.startsWith("value-") ? "Kaydet" : "Güncelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setServiceToDelete(null)
        }}
        onConfirm={() => serviceToDelete && handleDelete(serviceToDelete.id)}
        title="Hizmet Sil"
        description={serviceToDelete ? `"${serviceToDelete.title}" hizmetini silmek istediğinizden emin misiniz?` : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Tüm hizmetleri silmek ve bölümü varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteValueDialogOpen}
        onClose={() => {
          setIsDeleteValueDialogOpen(false)
          setValueToDelete(null)
        }}
        onConfirm={confirmDeleteValue}
        title="Değeri Sil"
        description={valueToDelete ? `"${valueToDelete.text}" adlı değeri silmek istediğinizden emin misiniz?` : undefined}
      />
    </div>
  )
}

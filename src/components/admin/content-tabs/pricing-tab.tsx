"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Star,
  Zap,
  Crown,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Available icons
const AVAILABLE_ICONS = [
  { name: "Star", component: Star, label: "Yıldız" },
  { name: "Zap", component: Zap, label: "Şimşek" },
  { name: "Crown", component: Crown, label: "Taç" },
]

// Color gradients
const COLOR_GRADIENTS = [
  { value: "from-blue-500 to-blue-600", label: "Mavi", preview: "bg-gradient-to-r from-blue-500 to-blue-600" },
  { value: "from-green-500 to-green-600", label: "Yeşil", preview: "bg-gradient-to-r from-green-500 to-green-600" },
  { value: "from-purple-500 to-purple-600", label: "Mor", preview: "bg-gradient-to-r from-purple-500 to-purple-600" },
  { value: "from-orange-500 to-orange-600", label: "Turuncu", preview: "bg-gradient-to-r from-orange-500 to-orange-600" },
  { value: "from-red-500 to-red-600", label: "Kırmızı", preview: "bg-gradient-to-r from-red-500 to-red-600" },
  { value: "from-cyan-500 to-cyan-600", label: "Camgöbeği", preview: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
]

interface PricingPlan {
  id: string
  name: string
  icon: string
  price: string
  period: string
  description: string
  color: string
  features: string[]
  isPopular: boolean
  isActive: boolean
  order: number
}

interface AdditionalService {
  id: string
  text: string
  isActive: boolean
  order: number
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: "default-1",
    name: "Başlangıç",
    icon: "Star",
    price: "2.500",
    period: "/ay",
    description: "Küçük işletmeler için ideal paket",
    color: "from-blue-500 to-blue-600",
    isPopular: false,
    isActive: true,
    order: 0,
    features: [
      "Aylık beyanname hazırlama",
      "Temel muhasebe kayıtları",
      "E-posta desteği",
      "Aylık mali raporlama",
      "Vergi takvimi takibi"
    ]
  },
  {
    id: "default-2",
    name: "Profesyonel",
    icon: "Zap",
    price: "4.500",
    period: "/ay",
    description: "Orta ölçekli işletmeler için",
    color: "from-purple-500 to-purple-600",
    isPopular: true,
    isActive: true,
    order: 1,
    features: [
      "Tüm Başlangıç özellikleri",
      "Tam muhasebe hizmeti",
      "SGK ve bordro işlemleri",
      "7/24 telefon desteği",
      "Haftalık mali raporlama",
      "Stratejik mali danışmanlık",
      "Vergi optimizasyonu"
    ]
  },
  {
    id: "default-3",
    name: "Kurumsal",
    icon: "Crown",
    price: "Özel Fiyat",
    period: "",
    description: "Büyük işletmeler için özel çözüm",
    color: "from-orange-500 to-orange-600",
    isPopular: false,
    isActive: true,
    order: 2,
    features: [
      "Tüm Profesyonel özellikleri",
      "Özel hesap yöneticisi",
      "Denetim ve revizyon",
      "Gelişmiş finansal analiz",
      "Yatırım danışmanlığı",
      "İç kontrol sistemleri",
      "Özel eğitim programları",
      "Sınırsız danışmanlık"
    ]
  }
]

const DEFAULT_SERVICES: AdditionalService[] = [
  {
    id: "default-1",
    text: "Şirket kuruluş işlemleri (2.500₺ - 5.000₺)",
    isActive: true,
    order: 0
  },
  {
    id: "default-2",
    text: "E-Dönüşüm danışmanlığı (1.500₺/ay)",
    isActive: true,
    order: 1
  },
  {
    id: "default-3",
    text: "Özel proje bazlı finansal analiz",
    isActive: true,
    order: 2
  },
  {
    id: "default-4",
    text: "Vergi incelemesi desteği",
    isActive: true,
    order: 3
  }
]

const DEFAULT_SECTION_DATA = {
  title: "Fiyatlandırma",
  paragraph: "İşletmenizin büyüklüğüne ve ihtiyaçlarına göre esnek paketler. Tüm paketlerde şeffaf fiyatlandırma, gizli ücret yok.",
  additionalTitle: "Ek Hizmetler",
  additionalParagraph: "Tüm paketlere eklenebilecek özel hizmetler",
  footerText: "* Tüm fiyatlar KDV hariçtir. Özel ihtiyaçlarınız için size özel paket oluşturabiliriz. İlk ay ücretsiz danışmanlık hizmeti ile başlayabilirsiniz."
}

export function PricingTab() {
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS)
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>(DEFAULT_SERVICES)
  const [sectionData, setSectionData] = useState(DEFAULT_SECTION_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Plans table state
  const [planSearchTerm, setPlanSearchTerm] = useState("")
  const [planCurrentPage, setPlanCurrentPage] = useState(1)
  const [planItemsPerPage, setPlanItemsPerPage] = useState(5)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null)
  const [isPlanDeleteDialogOpen, setIsPlanDeleteDialogOpen] = useState(false)
  const [featureInput, setFeatureInput] = useState("")
  
  // Additional services table state
  const [serviceSearchTerm, setServiceSearchTerm] = useState("")
  const [serviceCurrentPage, setServiceCurrentPage] = useState(1)
  const [serviceItemsPerPage, setServiceItemsPerPage] = useState(5)
  const [editingService, setEditingService] = useState<any>(null)
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<AdditionalService | null>(null)
  const [isServiceDeleteDialogOpen, setIsServiceDeleteDialogOpen] = useState(false)
  
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)

  useEffect(() => {
    fetchData()
    
    return () => {
      setIsPlanDialogOpen(false)
      setIsPlanDeleteDialogOpen(false)
      setIsServiceDialogOpen(false)
      setIsServiceDeleteDialogOpen(false)
      setIsResetDialogOpen(false)
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchPlans(),
        fetchAdditionalServices(),
        fetchSectionData()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSectionData = async () => {
    try {
      const response = await fetch('/api/content/pricing/section')
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          setSectionData({
            title: data.title || DEFAULT_SECTION_DATA.title,
            paragraph: data.paragraph || DEFAULT_SECTION_DATA.paragraph,
            additionalTitle: data.additionalTitle || DEFAULT_SECTION_DATA.additionalTitle,
            additionalParagraph: data.additionalParagraph || DEFAULT_SECTION_DATA.additionalParagraph,
            footerText: data.footerText || DEFAULT_SECTION_DATA.footerText
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

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/content/pricing')
      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          const allDefaults = data.every((p: any) => p.id?.startsWith('default-'))
          
          const parsedData = data.map((plan: any) => ({
            ...plan,
            features: plan.features && Array.isArray(plan.features)
              ? plan.features.map((f: any) => f.text || f)
              : []
          }))
          
          setPlans(parsedData)
          setIsDatabaseEmpty(allDefaults)
        } else {
          setPlans(DEFAULT_PLANS)
          setIsDatabaseEmpty(true)
        }
      } else {
        setPlans(DEFAULT_PLANS)
        setIsDatabaseEmpty(true)
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error)
      setPlans(DEFAULT_PLANS)
      setIsDatabaseEmpty(true)
    }
  }

  const fetchAdditionalServices = async () => {
    try {
      const response = await fetch('/api/content/pricing/additional-services')
      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          setAdditionalServices(data)
        } else {
          setAdditionalServices(DEFAULT_SERVICES)
        }
      } else {
        setAdditionalServices(DEFAULT_SERVICES)
      }
    } catch (error) {
      console.error('Error fetching additional services:', error)
      setAdditionalServices(DEFAULT_SERVICES)
    }
  }

  const saveAllChanges = async () => {
    setSaving(true)
    try {
      // 1. Delete all existing plans
      const existingPlans = await fetch('/api/content/pricing')
      if (existingPlans.ok) {
        const existingData = await existingPlans.json()
        for (const plan of existingData) {
          await fetch(`/api/content/pricing?id=${plan.id}`, { method: 'DELETE' })
        }
      }

      // 2. Create all plans
      for (let i = 0; i < plans.length; i++) {
        const plan = plans[i]
        const payload = {
          name: plan.name,
          icon: plan.icon,
          price: plan.price,
          period: plan.period,
          description: plan.description,
          color: plan.color,
          features: plan.features,
          isPopular: plan.isPopular,
          isActive: plan.isActive,
          order: i
        }

        const response = await fetch('/api/content/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('Plan oluşturulamadı')
        }
      }

      // 3. Delete all existing additional services
      const existingServices = await fetch('/api/content/pricing/additional-services')
      if (existingServices.ok) {
        const existingData = await existingServices.json()
        for (const service of existingData) {
          await fetch(`/api/content/pricing/additional-services?id=${service.id}`, { method: 'DELETE' })
        }
      }

      // 4. Create all additional services
      for (let i = 0; i < additionalServices.length; i++) {
        const service = additionalServices[i]
        const payload = {
          text: service.text,
          isActive: service.isActive,
          order: i
        }

        const response = await fetch('/api/content/pricing/additional-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('Ek hizmet oluşturulamadı')
        }
      }

      // 5. Save section data
      const sectionResponse = await fetch('/api/content/pricing/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      })

      if (sectionResponse.ok) {
        toast.success('Tüm değişiklikler başarıyla kaydedildi!')
        setIsDatabaseEmpty(false)
        await fetchData()
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
      // Delete and recreate all data with defaults
      const plansResponse = await fetch('/api/content/pricing')
      if (plansResponse.ok) {
        const existingData = await plansResponse.json()
        for (const plan of existingData) {
          await fetch(`/api/content/pricing?id=${plan.id}`, { method: 'DELETE' })
        }
      }

      for (let i = 0; i < DEFAULT_PLANS.length; i++) {
        const plan = DEFAULT_PLANS[i]
        await fetch('/api/content/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...plan, order: i })
        })
      }

      const servicesResponse = await fetch('/api/content/pricing/additional-services')
      if (servicesResponse.ok) {
        const existingData = await servicesResponse.json()
        for (const service of existingData) {
          await fetch(`/api/content/pricing/additional-services?id=${service.id}`, { method: 'DELETE' })
        }
      }

      for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
        const service = DEFAULT_SERVICES[i]
        await fetch('/api/content/pricing/additional-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...service, order: i })
        })
      }

      await fetch('/api/content/pricing/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_SECTION_DATA)
      })

      toast.success('Varsayılan değerler veritabanına kaydedildi!')
      setIsDatabaseEmpty(false)
      await fetchData()
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error('Varsayılan değerler kaydedilemedi')
    } finally {
      setIsSavingDefaults(false)
    }
  }

  const handleReset = () => {
    setPlans(DEFAULT_PLANS)
    setAdditionalServices(DEFAULT_SERVICES)
    setSectionData(DEFAULT_SECTION_DATA)
    setIsDatabaseEmpty(true)
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  // Plan handlers
  const handleOpenPlanDialog = (plan?: PricingPlan) => {
    if (plan) {
      setEditingPlan({ ...plan })
    } else {
      setEditingPlan({
        name: "",
        icon: "Star",
        price: "",
        period: "/ay",
        description: "",
        color: "from-blue-500 to-blue-600",
        features: [],
        isPopular: false,
        isActive: true,
        order: plans.length
      })
    }
    setIsPlanDialogOpen(true)
  }

  const handleSavePlan = () => {
    if (!editingPlan.name || !editingPlan.price) {
      toast.error('İsim ve fiyat zorunludur')
      return
    }

    const payload = { ...editingPlan }

    if (editingPlan.id && !editingPlan.id.startsWith('default-')) {
      setPlans(plans.map(p => p.id === editingPlan.id ? payload : p))
      toast.success('Plan güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    } else {
      const newPlan = { ...payload, id: `temp-${Date.now()}`, order: plans.length }
      setPlans([...plans, newPlan])
      toast.success('Yeni plan eklendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    }
    
    setIsPlanDialogOpen(false)
  }

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id))
    toast.success('Plan silindi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsPlanDeleteDialogOpen(false)
    setPlanToDelete(null)
  }

  const movePlan = (plan: PricingPlan, direction: 'up' | 'down') => {
    const currentIndex = plans.findIndex(p => p.id === plan.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= plans.length) return

    const newPlans = [...plans]
    const [movedPlan] = newPlans.splice(currentIndex, 1)
    newPlans.splice(newIndex, 0, movedPlan)

    setPlans(newPlans.map((p, index) => ({ ...p, order: index })))
    toast.success('Sıralama güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, featureInput]
    })
    setFeatureInput("")
  }

  const removeFeature = (index: number) => {
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_: any, i: number) => i !== index)
    })
  }

  // Additional service handlers
  const handleOpenServiceDialog = (service?: AdditionalService) => {
    if (service) {
      setEditingService({ ...service })
    } else {
      setEditingService({
        text: "",
        isActive: true,
        order: additionalServices.length
      })
    }
    setIsServiceDialogOpen(true)
  }

  const handleSaveService = () => {
    if (!editingService.text.trim()) {
      toast.error('Metin zorunludur')
      return
    }

    if (editingService.id && !editingService.id.startsWith('default-')) {
      setAdditionalServices(additionalServices.map(s => s.id === editingService.id ? editingService : s))
      toast.success('Hizmet güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    } else {
      const newService = { ...editingService, id: `temp-${Date.now()}`, order: additionalServices.length }
      setAdditionalServices([...additionalServices, newService])
      toast.success('Yeni hizmet eklendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    }
    
    setIsServiceDialogOpen(false)
  }

  const handleDeleteService = (id: string) => {
    setAdditionalServices(additionalServices.filter(s => s.id !== id))
    toast.success('Hizmet silindi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsServiceDeleteDialogOpen(false)
    setServiceToDelete(null)
  }

  const moveService = (service: AdditionalService, direction: 'up' | 'down') => {
    const currentIndex = additionalServices.findIndex(s => s.id === service.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= additionalServices.length) return

    const newServices = [...additionalServices]
    const [movedService] = newServices.splice(currentIndex, 1)
    newServices.splice(newIndex, 0, movedService)

    setAdditionalServices(newServices.map((s, index) => ({ ...s, order: index })))
    toast.success('Sıralama güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
  }

  // Pagination
  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(planSearchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(planSearchTerm.toLowerCase())
  )
  const planTotalPages = Math.ceil(filteredPlans.length / planItemsPerPage)
  const planStartIndex = (planCurrentPage - 1) * planItemsPerPage
  const paginatedPlans = filteredPlans.slice(planStartIndex, planStartIndex + planItemsPerPage)

  const filteredServices = additionalServices.filter(service =>
    service.text.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  )
  const serviceTotalPages = Math.ceil(filteredServices.length / serviceItemsPerPage)
  const serviceStartIndex = (serviceCurrentPage - 1) * serviceItemsPerPage
  const paginatedServices = filteredServices.slice(serviceStartIndex, serviceStartIndex + serviceItemsPerPage)

  useEffect(() => {
    setPlanCurrentPage(1)
  }, [planSearchTerm])

  useEffect(() => {
    setServiceCurrentPage(1)
  }, [serviceSearchTerm])

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
          <CardTitle>Fiyatlandırma Bölümü Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Bölüm Başlığı</Label>
              <Input
                value={sectionData.title}
                onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
                placeholder="Fiyatlandırma"
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Ek Hizmetler Başlığı</Label>
              <Input
                value={sectionData.additionalTitle}
                onChange={(e) => setSectionData({ ...sectionData, additionalTitle: e.target.value })}
                placeholder="Ek Hizmetler"
              />
            </div>
            <div>
              <Label>Ek Hizmetler Açıklaması</Label>
              <Textarea
                value={sectionData.additionalParagraph || ""}
                onChange={(e) => setSectionData({ ...sectionData, additionalParagraph: e.target.value })}
                placeholder="Ek hizmetler açıklaması"
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label>Alt Metin (Footer)</Label>
            <Textarea
              value={sectionData.footerText || ""}
              onChange={(e) => setSectionData({ ...sectionData, footerText: e.target.value })}
              placeholder="* Tüm fiyatlar KDV hariçtir..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Plans and Additional Services */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="plans">Paket Fiyatları</TabsTrigger>
          <TabsTrigger value="services">Ek Hizmetler</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fiyat Paketleri Tablosu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Paket ara..."
                      value={planSearchTerm}
                      onChange={(e) => setPlanSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={planItemsPerPage.toString()} onValueChange={(v) => setPlanItemsPerPage(Number(v))}>
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
                <Button onClick={() => handleOpenPlanDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Paket Ekle
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Icon</TableHead>
                    <TableHead>İsim</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Özellikler</TableHead>
                    <TableHead className="w-[100px]">Durum</TableHead>
                    <TableHead className="w-[200px] text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {planSearchTerm ? "Arama sonucu bulunamadı" : "Henüz paket eklenmemiş"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPlans.map((plan) => {
                      const IconComponent = AVAILABLE_ICONS.find(i => i.name === plan.icon)?.component || Star
                      const actualIndex = plans.findIndex(p => p.id === plan.id)
                      
                      return (
                        <TableRow key={plan.id}>
                          <TableCell>
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{plan.name}</div>
                            {plan.isPopular && (
                              <Badge className="mt-1 bg-purple-100 text-purple-700 border-purple-300">Popüler</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">{plan.price}₺{plan.period}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{plan.features.length} özellik</span>
                          </TableCell>
                          <TableCell>
                            {plan.isActive ? (
                              <Badge className="bg-green-100 text-green-700 border-green-300">Aktif</Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pasif</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => movePlan(plan, 'up')}
                                disabled={actualIndex === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => movePlan(plan, 'down')}
                                disabled={actualIndex === plans.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenPlanDialog(plan)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setPlanToDelete(plan)
                                  setIsPlanDeleteDialogOpen(true)
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

              {filteredPlans.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Toplam {filteredPlans.length} kayıttan {planStartIndex + 1}-{Math.min(planStartIndex + planItemsPerPage, filteredPlans.length)} arası gösteriliyor
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPlanCurrentPage(planCurrentPage - 1)} disabled={planCurrentPage === 1}>
                      Önceki
                    </Button>
                    {Array.from({ length: planTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={planCurrentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8"
                        onClick={() => setPlanCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setPlanCurrentPage(planCurrentPage + 1)} disabled={planCurrentPage === planTotalPages}>
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ek Hizmetler Tablosu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Hizmet ara..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={serviceItemsPerPage.toString()} onValueChange={(v) => setServiceItemsPerPage(Number(v))}>
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
                <Button onClick={() => handleOpenServiceDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Hizmet Ekle
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hizmet</TableHead>
                    <TableHead className="w-[100px]">Durum</TableHead>
                    <TableHead className="w-[200px] text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        {serviceSearchTerm ? "Arama sonucu bulunamadı" : "Henüz hizmet eklenmemiş"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedServices.map((service) => {
                      const actualIndex = additionalServices.findIndex(s => s.id === service.id)
                      
                      return (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.text}</TableCell>
                          <TableCell>
                            {service.isActive ? (
                              <Badge className="bg-green-100 text-green-700 border-green-300">Aktif</Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pasif</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveService(service, 'up')}
                                disabled={actualIndex === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveService(service, 'down')}
                                disabled={actualIndex === additionalServices.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenServiceDialog(service)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setServiceToDelete(service)
                                  setIsServiceDeleteDialogOpen(true)
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

              {filteredServices.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Toplam {filteredServices.length} kayıttan {serviceStartIndex + 1}-{Math.min(serviceStartIndex + serviceItemsPerPage, filteredServices.length)} arası gösteriliyor
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setServiceCurrentPage(serviceCurrentPage - 1)} disabled={serviceCurrentPage === 1}>
                      Önceki
                    </Button>
                    {Array.from({ length: serviceTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={serviceCurrentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8"
                        onClick={() => setServiceCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setServiceCurrentPage(serviceCurrentPage + 1)} disabled={serviceCurrentPage === serviceTotalPages}>
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* Plan Dialog */}
      <Dialog open={isPlanDialogOpen} onOpenChange={(open) => {
        setIsPlanDialogOpen(open)
        if (!open) setEditingPlan(null)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingPlan?.id ? 'Paket Düzenle' : 'Yeni Paket Ekle'}</DialogTitle>
          </DialogHeader>
          
          {editingPlan && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>İsim *</Label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="Başlangıç"
                  />
                </div>
                
                <div>
                  <Label>Icon</Label>
                  <Select value={editingPlan.icon} onValueChange={(value) => setEditingPlan({ ...editingPlan, icon: value })}>
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
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Fiyat *</Label>
                  <Input
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                    placeholder="2.500"
                  />
                </div>
                
                <div>
                  <Label>Periyot</Label>
                  <Input
                    value={editingPlan.period}
                    onChange={(e) => setEditingPlan({ ...editingPlan, period: e.target.value })}
                    placeholder="/ay"
                  />
                </div>
                
                <div>
                  <Label>Renk</Label>
                  <Select value={editingPlan.color} onValueChange={(value) => setEditingPlan({ ...editingPlan, color: value })}>
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
                <Label>Açıklama</Label>
                <Textarea
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  placeholder="Paket açıklaması"
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Özellikler</Label>
                <div className="space-y-2">
                  {editingPlan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} readOnly className="flex-1" />
                      <Button variant="outline" size="icon" onClick={() => removeFeature(index)}>
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
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="planPopular"
                    checked={editingPlan.isPopular}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, isPopular: checked === true })}
                  />
                  <Label htmlFor="planPopular" className="cursor-pointer">Popüler paket</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="planActive"
                    checked={editingPlan.isActive}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, isActive: checked === true })}
                  />
                  <Label htmlFor="planActive" className="cursor-pointer">Paket aktif</Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSavePlan} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              {editingPlan?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={(open) => {
        setIsServiceDialogOpen(open)
        if (!open) setEditingService(null)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService?.id ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</DialogTitle>
          </DialogHeader>
          
          {editingService && (
            <div className="space-y-4 p-6">
              <div>
                <Label>Hizmet Açıklaması *</Label>
                <Textarea
                  value={editingService.text}
                  onChange={(e) => setEditingService({ ...editingService, text: e.target.value })}
                  placeholder="Örn: Şirket kuruluş işlemleri (2.500₺ - 5.000₺)"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="serviceActive"
                  checked={editingService.isActive}
                  onCheckedChange={(checked) => setEditingService({ ...editingService, isActive: checked === true })}
                />
                <Label htmlFor="serviceActive" className="cursor-pointer">Hizmet aktif</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSaveService} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              {editingService?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <DeleteConfirmationDialog
        isOpen={isPlanDeleteDialogOpen}
        onClose={() => {
          setIsPlanDeleteDialogOpen(false)
          setPlanToDelete(null)
        }}
        onConfirm={() => planToDelete && handleDeletePlan(planToDelete.id)}
        title="Paket Sil"
        description={planToDelete ? `"${planToDelete.name}" paketini silmek istediğinizden emin misiniz?` : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={isServiceDeleteDialogOpen}
        onClose={() => {
          setIsServiceDeleteDialogOpen(false)
          setServiceToDelete(null)
        }}
        onConfirm={() => serviceToDelete && handleDeleteService(serviceToDelete.id)}
        title="Hizmet Sil"
        description={serviceToDelete ? `"${serviceToDelete.text}" hizmetini silmek istediğinizden emin misiniz?` : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Tüm fiyatlandırma verilerini silmek ve varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  )
}

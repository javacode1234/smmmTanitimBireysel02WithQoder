"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Camera, Loader2, RotateCcw, Save } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

// Ana sayfa section linkleri
const PAGE_SECTIONS = [
  { value: "#hero", label: "Ana Sayfa (En Üst)" },
  { value: "#services", label: "Hizmetlerimiz" },
  { value: "#about", label: "Hakkımızda" },
  { value: "#clients", label: "Kurumlar" },
  { value: "#testimonials", label: "Müşteri Yorumları" },
  { value: "#faq", label: "Sıkça Sorulan Sorular" },
  { value: "#contact", label: "İletişim" },
  { value: "/teklif-al", label: "Teklif Al Sayfası" },
  { value: "/iletisim", label: "İletişim Sayfası" },
  { value: "custom", label: "Özel Link" },
]

const DEFAULT_HERO_DATA = {
  title: "Profesyonel Muhasebe Çözümleri",
  subtitle: "Güvenilir Mali Müşavirlik Hizmetleri",
  description: "25 yıllık deneyimimizle işletmenizin mali süreçlerini en iyi şekilde yönetiyoruz. Uzman kadromuz ve modern teknolojimizle yanınızdayız.",
  buttonText: "Hizmetlerimiz",
  buttonUrl: "#services",
  image: "",
}

export function HeroSectionTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [heroId, setHeroId] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>("#services")
  const [customUrl, setCustomUrl] = useState("")
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_HERO_DATA)

  useEffect(() => {
    fetchHeroData()
    
    // Listen for close-all-dialogs event
    const handleCloseAllDialogs = () => {
      // Use setTimeout to ensure the DOM is ready for cleanup
      setTimeout(() => {
        setIsResetDialogOpen(false)
      }, 0)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('close-all-dialogs', handleCloseAllDialogs)
    }
    
    // Cleanup function to close dialogs on unmount
    return () => {
      // Ensure dialogs are closed before unmounting
      setIsResetDialogOpen(false)
      
      // Remove event listener
      if (typeof window !== 'undefined') {
        window.removeEventListener('close-all-dialogs', handleCloseAllDialogs)
      }
    }
  }, [])

  useEffect(() => {
    // Seçilen section değiştiğinde buttonUrl'i güncelle
    if (selectedSection !== "custom") {
      setFormData(prev => ({ ...prev, buttonUrl: selectedSection }))
      setCustomUrl("")
    } else {
      setFormData(prev => ({ ...prev, buttonUrl: customUrl }))
    }
  }, [selectedSection, customUrl])

  const fetchHeroData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content/hero')
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const hero = data[0]
          setHeroId(hero.id)
          setFormData({
            title: hero.title || DEFAULT_HERO_DATA.title,
            subtitle: hero.subtitle || DEFAULT_HERO_DATA.subtitle,
            description: hero.description || DEFAULT_HERO_DATA.description,
            buttonText: hero.buttonText || DEFAULT_HERO_DATA.buttonText,
            buttonUrl: hero.buttonUrl || DEFAULT_HERO_DATA.buttonUrl,
            image: hero.image || DEFAULT_HERO_DATA.image,
          })
          
          // Mevcut URL'in hangi section olduğunu belirle
          const matchingSection = PAGE_SECTIONS.find(s => s.value === hero.buttonUrl)
          if (matchingSection) {
            setSelectedSection(matchingSection.value)
          } else if (hero.buttonUrl) {
            setSelectedSection("custom")
            setCustomUrl(hero.buttonUrl)
          }
          setIsDatabaseEmpty(false)
        } else {
          setFormData(DEFAULT_HERO_DATA)
          setIsDatabaseEmpty(true)
        }
      } else {
        setFormData(DEFAULT_HERO_DATA)
        setIsDatabaseEmpty(true)
      }
    } catch (error) {
      console.error('Error fetching hero data:', error)
      setFormData(DEFAULT_HERO_DATA)
      setIsDatabaseEmpty(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData(prev => ({ ...prev, image: reader.result as string }))
      toast.success('Görsel yüklendi')
    }
    reader.onerror = () => {
      toast.error('Dosya okunamadı')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.subtitle) {
      toast.error('Başlık ve alt başlık zorunludur')
      return
    }

    setIsSaving(true)
    try {
      const url = heroId ? `/api/content/hero?id=${heroId}` : '/api/content/hero'
      const method = heroId ? 'PATCH' : 'POST'

      const payload = {
        ...formData,
        isActive: true,
        order: 0,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedData = await response.json()
        setHeroId(savedData.id)
        toast.success('Hero bölümü başarıyla kaydedildi!')
        await fetchHeroData()
      } else {
        let message = 'Kaydetme sırasında bir hata oluştu'
        try {
          const ct = response.headers.get('content-type') || ''
          const err = ct.includes('application/json') ? await response.json() : await response.text()
          if (typeof err === 'string' && err.trim().length > 0) message = err
          else if (err && typeof err === 'object') message = err.error || message
        } catch {}
        if (response.status === 501) {
          message = 'Geliştirme (SQLite) şemasında hero yönetimi desteklenmiyor'
        }
        toast.error(message)
      }
    } catch (error) {
      console.error('Error saving hero:', error)
      toast.error('Kaydetme sırasında bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to default values (state only - no database change)
  const handleReset = () => {
    // Form'a default değerleri yükle
    setFormData(DEFAULT_HERO_DATA)
    setHeroId(null)
    setIsDatabaseEmpty(true)
    setSelectedSection("#services")
    setCustomUrl("")
    
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const saveDefaultsToDatabase = async () => {
    setIsSavingDefaults(true)
    try {
      // 1. Database'i temizle
      await fetch('/api/content/hero/reset', {
        method: 'DELETE',
      })

      // 2. Varsayılan değerleri kaydet
      const payload = {
        ...DEFAULT_HERO_DATA,
        isActive: true,
        order: 0,
      }

      const response = await fetch('/api/content/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedData = await response.json()
        setHeroId(savedData.id)
        setIsDatabaseEmpty(false)
        toast.success('Varsayılan değerler veritabanına kaydedildi!')
        await fetchHeroData()
      } else {
        let message = 'Varsayılan değerler kaydedilemedi'
        try {
          const ct = response.headers.get('content-type') || ''
          const err = ct.includes('application/json') ? await response.json() : await response.text()
          if (typeof err === 'string' && err.trim().length > 0) message = err
          else if (err && typeof err === 'object') message = err.error || message
        } catch {}
        if (response.status === 501) {
          message = 'Geliştirme (SQLite) şemasında hero yönetimi desteklenmiyor'
        }
        toast.error(message)
      }
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
        <CardHeader>
          <CardTitle>Hero Bölümü</CardTitle>
          <CardDescription>Ana sayfa hero bölümü içeriğini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hero Bölümü</CardTitle>
          <CardDescription>Ana sayfa hero bölümü içeriğini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Profesyonel Mali Müşavirlik Hizmetleri"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Alt Başlık *</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Güvenilir, deneyimli ve profesyonel ekibimizle yanınızdayız"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detaylı açıklama metni..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Buton Metni</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                placeholder="Hemen Başla"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonSection">Buton Linki</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger id="buttonSection">
                  <SelectValue placeholder="Sayfa bölümü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SECTIONS.map((section) => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSection === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customUrl">Özel Link URL</Label>
              <Input
                id="customUrl"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value)
                  setFormData(prev => ({ ...prev, buttonUrl: e.target.value }))
                }}
                placeholder="https://ornek.com veya /sayfa-yolu"
              />
              <p className="text-xs text-muted-foreground">
                Dahili sayfa için &quot;/&quot; ile başlayın (örn: /hakkimizda), harici link için tam URL girin
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Hero Görseli</Label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <Image src={formData.image} alt="Hero" width={128} height={128} className="h-32 w-32 rounded object-cover border" unoptimized />
              )}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('hero-image-upload')?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {formData.image ? 'Görseli Değiştir' : 'Görsel Yükle'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Önerilen boyut: 600x400 piksel, maksimum 2MB
                </p>
              </div>
              <input
                id="hero-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Hero bölümünü varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm özelleştirilmiş içerik kaybolacaktır."
      />

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setIsResetDialogOpen(true)} 
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-50 w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Varsayılan Değerlere Sıfırla
          </Button>
          
          <Button 
            onClick={saveDefaultsToDatabase} 
            disabled={!isDatabaseEmpty || isSavingDefaults}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
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
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Tüm Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  )
}

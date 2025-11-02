"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Loader2 } from "lucide-react"
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

export function HeroSectionTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [heroId, setHeroId] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>("#services")
  const [customUrl, setCustomUrl] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    image: "",
  })

  useEffect(() => {
    fetchHeroData()
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
            title: hero.title || "",
            subtitle: hero.subtitle || "",
            description: hero.description || "",
            buttonText: hero.buttonText || "",
            buttonUrl: hero.buttonUrl || "",
            image: hero.image || "",
          })
          
          // Mevcut URL'in hangi section olduğunu belirle
          const matchingSection = PAGE_SECTIONS.find(s => s.value === hero.buttonUrl)
          if (matchingSection) {
            setSelectedSection(matchingSection.value)
          } else if (hero.buttonUrl) {
            setSelectedSection("custom")
            setCustomUrl(hero.buttonUrl)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching hero data:', error)
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
        const error = await response.json()
        toast.error(error.error || 'Kaydetme sırasında bir hata oluştu')
      }
    } catch (error) {
      console.error('Error saving hero:', error)
      toast.error('Kaydetme sırasında bir hata oluştu')
    } finally {
      setIsSaving(false)
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
                Dahili sayfa için "/" ile başlayın (örn: /hakkimizda), harici link için tam URL girin
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Hero Görseli</Label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <img src={formData.image} alt="Hero" className="h-32 w-32 rounded object-cover border" />
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

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Kaydet
        </Button>
      </div>
    </div>
  )
}

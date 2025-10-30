"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"

export function SiteSettingsTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [tempCoordinates, setTempCoordinates] = useState({ lat: 41.0082, lng: 28.9784 }) // Default: Istanbul
  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    favicon: "",
    brandIcon: "",
    phone: "",
    email: "",
    address: "",
    mapLatitude: "",
    mapLongitude: "",
    mapEmbedUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content/site-settings')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSettingsId(data.id || null)
          setFormData({
            siteName: data.siteName || "",
            siteDescription: data.siteDescription || "",
            favicon: data.favicon || "",
            brandIcon: data.brandIcon || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            mapLatitude: data.mapLatitude || "",
            mapLongitude: data.mapLongitude || "",
            mapEmbedUrl: data.mapEmbedUrl || "",
            facebookUrl: data.facebookUrl || "",
            twitterUrl: data.twitterUrl || "",
            linkedinUrl: data.linkedinUrl || "",
            instagramUrl: data.instagramUrl || "",
            youtubeUrl: data.youtubeUrl || "",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Ayarlar yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'favicon' | 'brandIcon') => {
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
      const base64String = reader.result as string
      console.log(`${field} uploaded - Size: ${base64String.length} chars, Type: ${file.type}`)
      
      // Verify the image can be loaded
      const img = new Image()
      img.onload = () => {
        console.log(`✅ ${field} is valid - Dimensions: ${img.width}x${img.height}`)
        setFormData(prev => ({ ...prev, [field]: base64String }))
        toast.success(`${field === 'favicon' ? 'Favicon' : 'Marka ikonu'} yüklendi`)
      }
      img.onerror = () => {
        console.error(`❌ ${field} is invalid or corrupted`)
        toast.error('Resim yüklenemedi, lütfen başka bir resim deneyin')
      }
      img.src = base64String
    }
    reader.onerror = () => {
      toast.error('Dosya okunamadı')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        id: settingsId,
      }

      const response = await fetch('/api/content/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedData = await response.json()
        setSettingsId(savedData.id)
        toast.success('Site ayarları başarıyla güncellendi!')
        // Refresh to get updated data
        await fetchSettings()
      } else {
        const error = await response.json()
        console.error('Save error:', error)
        toast.error(error.error || 'Ayarlar kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Ayarlar kaydedilirken bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMapClick = (e: any) => {
    const lat = e.latlng.lat
    const lng = e.latlng.lng
    setTempCoordinates({ lat, lng })
  }

  const handleMapConfirm = () => {
    if (!formData.mapEmbedUrl) {
      toast.error('Lütfen Google Maps linkini girin')
      return
    }
    setMapModalOpen(false)
    toast.success('Harita linki kaydedildi!')
  }

  const openMapModal = () => {
    setMapModalOpen(true)
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Genel Bilgiler</CardTitle>
          <CardDescription>Site genel ayarlarını düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Adı</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="SMMM Ofisi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Açıklaması</Label>
            <Textarea
              id="siteDescription"
              value={formData.siteDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
              placeholder="Site hakkında kısa açıklama..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Favicon</Label>
              <p className="text-xs text-muted-foreground">En iyi sonuç için 32x32 veya 64x64 piksel PNG/ICO kullanın</p>
              <div className="flex items-center gap-4">
                {formData.favicon && (
                  <img src={formData.favicon} alt="Favicon" className="h-12 w-12 rounded object-cover border" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('favicon-upload')?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {formData.favicon ? 'Değiştir' : 'Yükle'}
                </Button>
                <input
                  id="favicon-upload"
                  type="file"
                  accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'favicon')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Marka İkonu</Label>
              <p className="text-xs text-muted-foreground">En iyi sonuç için 32x32 veya 64x64 piksel PNG/ICO kullanın</p>
              <div className="flex items-center gap-4">
                {formData.brandIcon && (
                  <img src={formData.brandIcon} alt="Brand Icon" className="h-12 w-12 rounded object-cover border" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('brand-icon-upload')?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {formData.brandIcon ? 'Değiştir' : 'Yükle'}
                </Button>
                <input
                  id="brand-icon-upload"
                  type="file"
                  accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'brandIcon')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İletişim Bilgileri</CardTitle>
          <CardDescription>İletişim ve sosyal medya bilgilerini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0555 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="İstanbul, Türkiye"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Google Maps Konumu</Label>
            <p className="text-xs text-muted-foreground">Google Maps embed linkini buraya yapıştırın</p>
            <div className="flex gap-2">
              <Input
                value={formData.mapEmbedUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, mapEmbedUrl: e.target.value }))}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="font-mono text-xs flex-1"
              />
              <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Nasıl Alınır?
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Google Maps Embed Linkini Nasıl Alırsınız?</DialogTitle>
                    <DialogDescription>
                      Aşağıdaki adımları takip edin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-1">Google Maps'i Açın</h3>
                          <p className="text-sm text-blue-800">
                            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">https://www.google.com/maps</a> adresine gidin
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                        <div>
                          <h3 className="font-semibold text-green-900 mb-1">Konumu Seçin</h3>
                          <p className="text-sm text-green-800">İstediğiniz konuma gidin (arama yapın veya haritada tıklayın)</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <div>
                          <h3 className="font-semibold text-purple-900 mb-1">"Paylaş" Butonuna Tıklayın</h3>
                          <p className="text-sm text-purple-800">Sol taraftaki yan panelde <strong>"Paylaş"</strong> veya <strong>"Share"</strong> butonunu bulun</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                        <div>
                          <h3 className="font-semibold text-orange-900 mb-1">"Harita Göm" Sekmesine Geçin</h3>
                          <p className="text-sm text-orange-800"><strong>"Harita göm"</strong> veya <strong>"Embed a map"</strong> sekmesine tıklayın</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                        <div>
                          <h3 className="font-semibold text-red-900 mb-1">Link'i Kopyalayın</h3>
                          <p className="text-sm text-red-800 mb-2">HTML kodundaki <code className="bg-red-100 px-1 rounded">src="..."</code> içindeki linki kopyalayın</p>
                          <p className="text-xs text-red-700"><strong>Örnek:</strong> <code className="bg-red-100 px-1 rounded text-[10px]">https://www.google.com/maps/embed?pb=...</code></p>
                        </div>
                      </div>
                    </div>

                    {formData.mapEmbedUrl && (
                      <div className="space-y-2">
                        <Label>Harita Önizlemesi</Label>
                        <div className="relative w-full h-[350px] bg-gray-100 rounded-lg overflow-hidden border-2">
                          <iframe
                            src={formData.mapEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Map Preview"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={() => setMapModalOpen(false)}>Kapat</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {formData.mapEmbedUrl && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Harita linki kaydedildi
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sosyal Medya</CardTitle>
          <CardDescription>Sosyal medya hesap linklerini düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={formData.facebookUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter URL</Label>
              <Input
                id="twitterUrl"
                value={formData.twitterUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={formData.instagramUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input
              id="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
              placeholder="https://youtube.com/channel/..."
            />
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

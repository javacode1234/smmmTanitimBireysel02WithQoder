"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Camera, Loader2, MapPin, RotateCcw, Save } from "lucide-react"
import NextImage from "next/image"
import { toast } from "sonner"

// Default values
const DEFAULT_SETTINGS = {
  siteName: "SMMM Ofisi",
  siteDescription: "Profesyonel muhasebe ve mali müşavirlik hizmetleri",
  favicon: "",
  brandIcon: "",
  phone: "+90 (212) 123 45 67",
  email: "info@smmmofisi.com",
  address: "İstanbul, Türkiye",
  mapLatitude: "41.0082",
  mapLongitude: "28.9784",
  mapEmbedUrl: "",
  facebookUrl: "",
  xUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  threadsUrl: "",
}

export function SiteSettingsTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_SETTINGS)

  // Refs for file inputs to ensure proper cleanup
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const brandIconInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()

    const handleCloseAllDialogs = () => {
      requestAnimationFrame(() => {
        setMapModalOpen(false)
        setIsResetDialogOpen(false)
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('close-all-dialogs', handleCloseAllDialogs)
    }

    const faviconEl = faviconInputRef.current
    const brandIconEl = brandIconInputRef.current

    return () => {
      if (faviconEl) {
        faviconEl.value = ''
      }
      if (brandIconEl) {
        brandIconEl.value = ''
      }

      requestAnimationFrame(() => {
        setMapModalOpen(false)
        setIsResetDialogOpen(false)
      })

      if (typeof window !== 'undefined') {
        window.removeEventListener('close-all-dialogs', handleCloseAllDialogs)
      }
    }
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content/site-settings')
      if (response.ok) {
        const data = await response.json()
        console.log('Site settings data:', data) // Debug
        
        // null veya boş obje döndüğünde
        if (!data || !data.id) {
          setFormData(DEFAULT_SETTINGS)
          setSettingsId(null)
          setIsDatabaseEmpty(true)
          console.log('Database IS empty - no data or ID')
        } else {
          // Veri var
          setSettingsId(data.id)
          setFormData({
            siteName: data.siteName || DEFAULT_SETTINGS.siteName,
            siteDescription: data.siteDescription || DEFAULT_SETTINGS.siteDescription,
            favicon: data.favicon || DEFAULT_SETTINGS.favicon,
            brandIcon: data.brandIcon || DEFAULT_SETTINGS.brandIcon,
            phone: data.phone || DEFAULT_SETTINGS.phone,
            email: data.email || DEFAULT_SETTINGS.email,
            address: data.address || DEFAULT_SETTINGS.address,
            mapLatitude: data.mapLatitude || DEFAULT_SETTINGS.mapLatitude,
            mapLongitude: data.mapLongitude || DEFAULT_SETTINGS.mapLongitude,
            mapEmbedUrl: data.mapEmbedUrl || DEFAULT_SETTINGS.mapEmbedUrl,
            facebookUrl: data.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
            xUrl: data.xUrl || DEFAULT_SETTINGS.xUrl,
            linkedinUrl: data.linkedinUrl || DEFAULT_SETTINGS.linkedinUrl,
            instagramUrl: data.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
            youtubeUrl: data.youtubeUrl || DEFAULT_SETTINGS.youtubeUrl,
            threadsUrl: data.threadsUrl || DEFAULT_SETTINGS.threadsUrl,
          })
          setIsDatabaseEmpty(false)
          console.log('Database NOT empty - ID:', data.id)
        }
      } else {
        setFormData(DEFAULT_SETTINGS)
        setSettingsId(null)
        setIsDatabaseEmpty(true)
        console.log('Database IS empty - API error')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Ayarlar yüklenirken hata oluştu')
      setFormData(DEFAULT_SETTINGS)
      setSettingsId(null)
      setIsDatabaseEmpty(true)
      console.log('Database IS empty - exception')
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
        // More detailed error handling
        const errorText = await response.text()
        console.error('Save error response:', response.status, response.statusText, errorText)
        
        let errorMessage = 'Ayarlar kaydedilirken bir hata oluştu'
        
        // Try to parse the error response as JSON
        try {
          if (errorText) {
            const error = JSON.parse(errorText)
            console.error('Save error parsed:', error)
            errorMessage = error.error || error.message || errorText || errorMessage
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
        }
        
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Ayarlar kaydedilirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setIsSaving(false)
    }
  }

  

  // Reset to default values (state only - no database change)
  const handleReset = () => {
    // Form'a default değerleri yükle
    setFormData(DEFAULT_SETTINGS)
    setSettingsId(null)
    setIsDatabaseEmpty(true)
    
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const saveDefaultsToDatabase = async () => {
    setIsSavingDefaults(true)
    try {
      // 1. Database'i temizle
      await fetch('/api/content/site-settings', {
        method: 'DELETE',
      })

      // 2. Varsayılan değerleri kaydet
      const payload = {
        ...DEFAULT_SETTINGS,
        id: null,
      }

      const response = await fetch('/api/content/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedData = await response.json()
        setSettingsId(savedData.id)
        setIsDatabaseEmpty(false)
        toast.success('Varsayılan değerler veritabanına kaydedildi!')
        await fetchSettings()
      } else {
        // More detailed error handling
        const errorText = await response.text()
        console.error('Save error response:', response.status, response.statusText, errorText)
        
        let errorMessage = 'Varsayılan değerler kaydedilemedi'
        
        // Try to parse the error response as JSON
        try {
          if (errorText) {
            const error = JSON.parse(errorText)
            console.error('Save error parsed:', error)
            errorMessage = error.error || error.message || errorText || errorMessage
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
        }
        
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error('Varsayılan değerler kaydedilemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
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
                  <NextImage 
                    src={formData.favicon} 
                    alt="Favicon" 
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded object-cover border" 
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target && typeof target.style !== 'undefined') {
                        target.style.display = 'none'
                      }
                    }}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => faviconInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {formData.favicon ? 'Değiştir' : 'Yükle'}
                </Button>
                <input
                  ref={faviconInputRef}
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
                  <NextImage 
                    src={formData.brandIcon} 
                    alt="Brand Icon" 
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded object-cover border" 
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target && typeof target.style !== 'undefined') {
                        target.style.display = 'none'
                      }
                    }}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => brandIconInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {formData.brandIcon ? 'Değiştir' : 'Yükle'}
                </Button>
                <input
                  ref={brandIconInputRef}
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
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Google Maps Embed Linkini Nasıl Alırsınız?</DialogTitle>
                    <DialogDescription>
                      Aşağıdaki adımları takip edin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                          <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Google Maps&rsquo;i Açın</h3>
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
                            <h3 className="font-semibold text-purple-900 mb-1">&quot;Paylaş&quot; Butonuna Tıklayın</h3>
                            <p className="text-sm text-purple-800">Sol taraftaki yan panelde <strong>&quot;Paylaş&quot;</strong> veya <strong>&quot;Share&quot;</strong> butonunu bulun</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                          <div>
                            <h3 className="font-semibold text-orange-900 mb-1">&quot;Harita Göm&quot; Sekmesine Geçin</h3>
                            <p className="text-sm text-orange-800"><strong>&quot;Harita göm&quot;</strong> veya <strong>&quot;Embed a map&quot;</strong> sekmesine tıklayın</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                          <div>
                            <h3 className="font-semibold text-red-900 mb-1">Link&rsquo;i Kopyalayın</h3>
                            <p className="text-sm text-red-800 mb-2">HTML kodundaki <code className="bg-red-100 px-1 rounded">src=&quot;...&quot;</code> içindeki linki kopyalayın</p>
                            <p className="text-xs text-red-700"><strong>Örnek:</strong> <code className="bg-red-100 px-1 rounded text-[10px]">https://www.google.com/maps/embed?pb=...</code></p>
                          </div>
                        </div>
                      </div>

                      {formData.mapEmbedUrl && (
                        <div className="space-y-2">
                          <Label>Harita Önizlemesi</Label>
                          <div className="relative w-full h-[350px] bg-gray-100 rounded-lg overflow-hidden border-2">
                            {/* Added key to force re-render when URL changes */}
                            {formData.mapEmbedUrl && (
                              <iframe
                                key={formData.mapEmbedUrl}
                                src={formData.mapEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Map Preview"
                                onError={() => {
                                  // Handle iframe loading errors
                                  console.error('Map iframe failed to load')
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end p-6 border-t">
                    <Button onClick={() => setMapModalOpen(false)}>Kapat</Button>
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
              <Label htmlFor="xUrl">X (Twitter) URL</Label>
              <Input
                id="xUrl"
                value={formData.xUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, xUrl: e.target.value }))}
                placeholder="https://x.com/..."
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="https://youtube.com/channel/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threadsUrl">Nsosyal URL</Label>
              <Input
                id="threadsUrl"
                value={formData.threadsUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, threadsUrl: e.target.value }))}
                placeholder="https://www.nsosyal.com/..."
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
        description="Site ayarlarını varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm özelleştirilmiş ayarlar kaybolacaktır."
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsResetDialogOpen(true)} 
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
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
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="bg-green-600 hover:bg-green-700">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Tüm Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  )
}

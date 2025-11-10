"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { User, Mail, Phone, Building, Shield, Camera, Save, Lock } from "lucide-react"

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock user data - will be replaced with actual session data
  const [profileData, setProfileData] = useState({
    name: "Admin Kullanıcı",
    email: "admin@smmm.com",
    phone: "0532 123 4567",
    company: "SMMM Ofisi",
    role: "ADMIN",
    avatar: "",
    initials: "AK",
    createdAt: "2024-01-15",
  })

  const [formData, setFormData] = useState(profileData)
  const [previewAvatar, setPreviewAvatar] = useState(profileData.avatar)

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          cache: 'no-store'
        }).catch(() => null)
        
        if (response && response.ok) {
          const data = await response.json()
          const userData = {
            name: data.name || "Admin Kullanıcı",
            email: data.email || "admin@smmm.com",
            phone: "0532 123 4567", // TODO: Add phone to User model
            company: "SMMM Ofisi", // TODO: Add company to User model
            role: data.role || "ADMIN",
            avatar: data.image || "",
            initials: data.name ? data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : "AK",
            createdAt: data.createdAt || "2024-01-15",
          }
          setProfileData(userData)
          setFormData(userData)
          setPreviewAvatar(userData.avatar)
        }
      } catch (error) {
        // Silently ignore profile fetch errors
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData(profileData)
    setIsEditing(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen sadece resim dosyası yükleyin')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Resim boyutu en fazla 2MB olabilir')
      return
    }

    try {
      // Convert to base64 for preview and storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreviewAvatar(base64String)
        setFormData(prev => ({ ...prev, avatar: base64String }))
      }
      reader.readAsDataURL(file)
      toast.success('Resim yüklendi! Değişiklikleri kaydetmeyi unutmayın.')
    } catch (error) {
      toast.error('Resim yüklenirken bir hata oluştu')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          image: formData.avatar,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update both profileData and formData with fresh data from API
        const updatedData = {
          ...formData,
          name: result.name,
          email: result.email,
          avatar: result.image || formData.avatar,
        }
        setProfileData(updatedData)
        setFormData(updatedData)
        setPreviewAvatar(result.image || formData.avatar)
        setIsEditing(false)
        toast.success('Profil bilgileri başarıyla güncellendi!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Profil güncellenirken bir hata oluştu' }))
        toast.error(errorData.error || 'Profil güncellenirken bir hata oluştu')
      }
    } catch (error) {
      toast.error('Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-muted-foreground mt-2">
          Hesap bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Yükleniyorr...</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Info Card */}
          <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profil Fotoğrafı</CardTitle>
            <CardDescription>Avatar görüntünüz</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewAvatar || profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="bg-primary text-white text-3xl">
                  {profileData.initials}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg hover:scale-110 transition-transform"
                onClick={handleAvatarClick}
                title="Profil resmi değiştir"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">{profileData.name}</h3>
              <Badge className="bg-primary">
                <Shield className="h-3 w-3 mr-1" />
                Yönetici
              </Badge>
            </div>

            <Separator />

            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{profileData.company}</span>
              </div>
            </div>

            <Separator />

            <div className="w-full text-center text-xs text-muted-foreground">
              Üyelik Tarihi: {new Date(profileData.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hesap Bilgileri</CardTitle>
                <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit}>
                  <User className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Ad Soyad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="0532 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Şirket</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Şirket Adı"
                />
              </div>
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Güvenlik</CardTitle>
            <CardDescription>Şifre ve güvenlik ayarlarınız</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Şifre Değiştir</h4>
                  <p className="text-sm text-muted-foreground">
                    Son değişiklik: 2 ay önce
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Değiştir
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">İki Faktörlü Kimlik Doğrulama</h4>
                  <p className="text-sm text-muted-foreground">
                    Hesabınız için ekstra güvenlik katmanı
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Yakında
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}

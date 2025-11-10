"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface EditBasicInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  customerId: string
  initialData: {
    logoUrl: string | null
    companyName: string
    taxNumber: string | null
    status: string
    onboardingStage: string
  }
}

export function EditBasicInfoModal({ isOpen, onClose, onSave, customerId, initialData }: EditBasicInfoModalProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [taxNumber, setTaxNumber] = useState("")
  const [status, setStatus] = useState("")
  const [onboardingStage, setOnboardingStage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setLogoUrl(initialData.logoUrl)
      setCompanyName(initialData.companyName)
      setTaxNumber(initialData.taxNumber || "")
      setStatus(initialData.status)
      setOnboardingStage(initialData.onboardingStage)
      setLogoFile(null)
    }
  }, [isOpen, initialData])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoUrl(null)
    setLogoFile(null)
  }

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("Ünvan alanı zorunludur")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl: logoUrl || null,
          companyName,
          taxNumber: taxNumber || null,
          status,
          onboardingStage,
        }),
      })

      if (response.ok) {
        toast.success("Temel bilgiler güncellendi")
        onSave({
          logoUrl: logoUrl || null,
          companyName,
          taxNumber: taxNumber || null,
          status,
          onboardingStage,
        })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating basic info:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Temel Bilgileri Düzenle</DialogTitle>
          <DialogDescription>
            Müşterinin temel bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          {/* Logo Upload */}
          <div>
            <Label>Şirket Logosu</Label>
            <div className="mt-2 flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={100}
                    height={100}
                    className="rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG veya JPEG (Max. 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="companyName">Ünvan *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ABC Teknoloji A.Ş."
              required
            />
          </div>

          {/* Tax Number */}
          <div>
            <Label htmlFor="taxNumber">TCKN / VKN</Label>
            <Input
              id="taxNumber"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          {/* Status and Onboarding Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="onboardingStage">Müşteri Aşaması</Label>
              <Select value={onboardingStage} onValueChange={setOnboardingStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEAD">Aday</SelectItem>
                  <SelectItem value="PROSPECT">Potansiyel</SelectItem>
                  <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

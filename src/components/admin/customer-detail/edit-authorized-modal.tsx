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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface EditAuthorizedModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  customerId: string
  initialData: {
    authorizedName: string | null
    authorizedTCKN: string | null
    authorizedPhone: string | null
    authorizedEmail: string | null
    authorizedAddress: string | null
    authorizationDate: string | null
    authorizationPeriod: string | null
  }
}

export function EditAuthorizedModal({ isOpen, onClose, onSave, customerId, initialData }: EditAuthorizedModalProps) {
  const [authorizedName, setAuthorizedName] = useState("")
  const [authorizedTCKN, setAuthorizedTCKN] = useState("")
  const [authorizedPhone, setAuthorizedPhone] = useState("")
  const [authorizedEmail, setAuthorizedEmail] = useState("")
  const [authorizedAddress, setAuthorizedAddress] = useState("")
  const [authorizationDate, setAuthorizationDate] = useState("")
  const [authorizationPeriod, setAuthorizationPeriod] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setAuthorizedName(initialData.authorizedName || "")
      setAuthorizedTCKN(initialData.authorizedTCKN || "")
      setAuthorizedPhone(initialData.authorizedPhone || "")
      setAuthorizedEmail(initialData.authorizedEmail || "")
      setAuthorizedAddress(initialData.authorizedAddress || "")
      setAuthorizationDate(initialData.authorizationDate ? initialData.authorizationDate.split('T')[0] : "")
      setAuthorizationPeriod(initialData.authorizationPeriod || "")
    }
  }, [isOpen, initialData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizedName,
          authorizedTCKN,
          authorizedPhone,
          authorizedEmail,
          authorizedAddress,
          authorizationDate: authorizationDate || null,
          authorizationPeriod,
        }),
      })

      if (response.ok) {
        toast.success("Yetkili bilgileri güncellendi")
        onSave({
          authorizedName,
          authorizedTCKN,
          authorizedPhone,
          authorizedEmail,
          authorizedAddress,
          authorizationDate,
          authorizationPeriod,
        })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating authorized:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Yetkili Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Yetkili kişi bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorizedName">Yetkili Ad Soyad</Label>
              <Input
                id="authorizedName"
                value={authorizedName}
                onChange={(e) => setAuthorizedName(e.target.value)}
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div>
              <Label htmlFor="authorizedTCKN">Yetkili TCKN</Label>
              <Input
                id="authorizedTCKN"
                value={authorizedTCKN}
                onChange={(e) => setAuthorizedTCKN(e.target.value)}
                placeholder="12345678901"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorizedPhone">Yetkili Telefon</Label>
              <Input
                id="authorizedPhone"
                value={authorizedPhone}
                onChange={(e) => setAuthorizedPhone(e.target.value)}
                placeholder="0555 123 4567"
              />
            </div>

            <div>
              <Label htmlFor="authorizedEmail">Yetkili E-posta</Label>
              <Input
                id="authorizedEmail"
                type="email"
                value={authorizedEmail}
                onChange={(e) => setAuthorizedEmail(e.target.value)}
                placeholder="yetkili@firma.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorizationDate">Yetkilendirilme Tarihi</Label>
              <Input
                id="authorizationDate"
                type="date"
                value={authorizationDate}
                onChange={(e) => setAuthorizationDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="authorizationPeriod">Yetki Süresi</Label>
              <Input
                id="authorizationPeriod"
                value={authorizationPeriod}
                onChange={(e) => setAuthorizationPeriod(e.target.value)}
                placeholder="5 yıl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="authorizedAddress">Yetkili Adres</Label>
            <Textarea
              id="authorizedAddress"
              value={authorizedAddress}
              onChange={(e) => setAuthorizedAddress(e.target.value)}
              placeholder="Yetkili kişinin adres bilgisi"
              rows={3}
            />
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

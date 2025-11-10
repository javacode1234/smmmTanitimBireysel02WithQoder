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
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface EditAuthorizedPersonModalProps {
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
  }
}

export function EditAuthorizedPersonModal({ isOpen, onClose, onSave, customerId, initialData }: EditAuthorizedPersonModalProps) {
  const [authorizedName, setAuthorizedName] = useState("")
  const [authorizedTCKN, setAuthorizedTCKN] = useState("")
  const [authorizedPhone, setAuthorizedPhone] = useState("")
  const [authorizedEmail, setAuthorizedEmail] = useState("")
  const [authorizedAddress, setAuthorizedAddress] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setAuthorizedName(initialData.authorizedName || "")
      setAuthorizedTCKN(initialData.authorizedTCKN || "")
      setAuthorizedPhone(initialData.authorizedPhone || "")
      setAuthorizedEmail(initialData.authorizedEmail || "")
      setAuthorizedAddress(initialData.authorizedAddress || "")
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
        }),
      })

      if (response.ok) {
        toast.success("Yetkili kişi bilgileri güncellendi")
        onSave({
          authorizedName,
          authorizedTCKN,
          authorizedPhone,
          authorizedEmail,
          authorizedAddress,
        })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating authorized person:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Yetkili Kişi Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Yetkili kişinin temel bilgilerini güncelleyin
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
              <PhoneInput
                id="authorizedPhone"
                value={authorizedPhone}
                onChange={setAuthorizedPhone}
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

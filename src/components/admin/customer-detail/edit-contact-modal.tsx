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
import { TaxOfficeCombobox } from "@/components/ui/tax-office-combobox"

interface TaxOffice {
  id: string
  name: string
}

interface EditContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ContactUpdate) => void
  customerId: string
  initialData: {
    phone: string | null
    email: string | null
    taxOffice: string | null
    address: string | null
  }
  taxOffices?: TaxOffice[]
}

interface ContactUpdate {
  phone: string
  email: string
  taxOffice: string
  address: string
}

export function EditContactModal({ isOpen, onClose, onSave, customerId, initialData, taxOffices }: EditContactModalProps) {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [taxOffice, setTaxOffice] = useState("")
  const [address, setAddress] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setPhone(initialData.phone || "")
      setEmail(initialData.email || "")
      setTaxOffice(initialData.taxOffice || "")
      setAddress(initialData.address || "")
    }
  }, [isOpen, initialData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, taxOffice, address }),
      })

      if (response.ok) {
        toast.success("İletişim bilgileri güncellendi")
        onSave({ phone, email, taxOffice, address })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating contact:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>İletişim Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Müşteri iletişim bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={setPhone}
            />
          </div>

          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@firma.com"
            />
          </div>

          <div>
            <Label htmlFor="taxOffice">Vergi Dairesi</Label>
            <TaxOfficeCombobox
              value={taxOffice}
              onValueChange={setTaxOffice}
              taxOffices={taxOffices || []}
            />
          </div>

          <div>
            <Label htmlFor="address">Adres</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tam adres bilgisi"
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

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface EditAuthorizedAddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  customerId: string
  initialData: {
    authorizedAddress: string | null
  }
}

export function EditAuthorizedAddressModal({ isOpen, onClose, onSave, customerId, initialData }: EditAuthorizedAddressModalProps) {
  const [authorizedAddress, setAuthorizedAddress] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
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
          authorizedAddress: authorizedAddress || null,
        }),
      })

      if (response.ok) {
        toast.success("Yetkili adres bilgisi güncellendi")
        onSave({
          authorizedAddress: authorizedAddress || null,
        })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating authorized address:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Yetkili Adres Bilgisini Düzenle</DialogTitle>
          <DialogDescription>
            Yetkili kişinin adres bilgisini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div>
            <Label htmlFor="authorizedAddress">Yetkili Adres</Label>
            <Textarea
              id="authorizedAddress"
              value={authorizedAddress}
              onChange={(e) => setAuthorizedAddress(e.target.value)}
              placeholder="Yetkili kişinin adres bilgisi"
              rows={4}
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

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
import { toast } from "sonner"

interface EditAuthorizationInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AuthorizationInfoUpdate) => void
  customerId: string
  initialData: {
    authorizationDate: string | null
    authorizationPeriod: string | null
  }
}

interface AuthorizationInfoUpdate {
  authorizationDate: string
  authorizationPeriod: string
}

export function EditAuthorizationInfoModal({ isOpen, onClose, onSave, customerId, initialData }: EditAuthorizationInfoModalProps) {
  const [authorizationDate, setAuthorizationDate] = useState("")
  const [authorizationPeriod, setAuthorizationPeriod] = useState("")
  const [endDate, setEndDate] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setAuthorizationDate(initialData.authorizationDate ? initialData.authorizationDate.split('T')[0] : "")
      setAuthorizationPeriod(initialData.authorizationPeriod || "")
    }
  }, [isOpen, initialData])

  // Calculate end date when date or period changes
  useEffect(() => {
    if (authorizationDate && authorizationPeriod) {
      const startDate = new Date(authorizationDate)
      const periodInYears = parseInt(authorizationPeriod)
      
      if (!isNaN(periodInYears) && periodInYears > 0) {
        const calculatedEndDate = new Date(startDate)
        calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + periodInYears)
        setEndDate(calculatedEndDate.toLocaleDateString('tr-TR'))
      } else {
        setEndDate(null)
      }
    } else {
      setEndDate(null)
    }
  }, [authorizationDate, authorizationPeriod])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizationDate: authorizationDate || null,
          authorizationPeriod,
        }),
      })

      if (response.ok) {
        toast.success("Yetkilendirme bilgileri güncellendi")
        onSave({
          authorizationDate,
          authorizationPeriod,
        })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating authorization info:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Yetkilendirme Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Yetkilendirme tarihi ve süresi bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
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
            <Label htmlFor="authorizationPeriod">Yetki Süresi (Yıl)</Label>
            <Input
              id="authorizationPeriod"
              type="number"
              min="1"
              value={authorizationPeriod}
              onChange={(e) => setAuthorizationPeriod(e.target.value)}
              placeholder="5"
            />
          </div>

          {/* End Date Display */}
          {endDate && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Yetki Bitiş Tarihi</Label>
              <p className="text-lg font-semibold text-primary mt-1">{endDate}</p>
            </div>
          )}
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

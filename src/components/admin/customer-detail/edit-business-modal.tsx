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

interface EditBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  customerId: string
  initialData: {
    ledgerType: string | null
    subscriptionFee: string | null
    establishmentDate: string | null
    status: "ACTIVE" | "INACTIVE"
    onboardingStage: "LEAD" | "PROSPECT" | "CUSTOMER"
  }
}

export function EditBusinessModal({ isOpen, onClose, onSave, customerId, initialData }: EditBusinessModalProps) {
  const [ledgerType, setLedgerType] = useState("")
  const [subscriptionFee, setSubscriptionFee] = useState("")
  const [establishmentDate, setEstablishmentDate] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [onboardingStage, setOnboardingStage] = useState("LEAD")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setLedgerType(initialData.ledgerType || "")
      setSubscriptionFee(initialData.subscriptionFee || "")
      setEstablishmentDate(initialData.establishmentDate ? initialData.establishmentDate.split('T')[0] : "")
      setStatus(initialData.status || "ACTIVE")
      setOnboardingStage(initialData.onboardingStage || "LEAD")
    }
  }, [isOpen, initialData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ledgerType, subscriptionFee, establishmentDate: establishmentDate || null, status, onboardingStage }),
      })

      if (response.ok) {
        toast.success("İş bilgileri güncellendi")
        onSave({ ledgerType, subscriptionFee, establishmentDate, status, onboardingStage })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating business:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>İş Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Müşteri iş bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div>
            <Label htmlFor="ledgerType">Defter Tipi</Label>
            <Select value={ledgerType} onValueChange={setLedgerType}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bilanço Esası">Bilanço Esası</SelectItem>
                <SelectItem value="İşletme Hesabı Esası">İşletme Hesabı Esası</SelectItem>
                <SelectItem value="Serbest Meslek Kazanç Defteri">Serbest Meslek Kazanç Defteri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subscriptionFee">Aidat</Label>
            <Input
              id="subscriptionFee"
              value={subscriptionFee}
              onChange={(e) => setSubscriptionFee(e.target.value)}
              placeholder="₺5.000"
            />
          </div>

          <div>
            <Label htmlFor="establishmentDate">Şirket Kuruluş Tarihi</Label>
            <Input
              id="establishmentDate"
              type="date"
              value={establishmentDate}
              onChange={(e) => setEstablishmentDate(e.target.value)}
            />
          </div>

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

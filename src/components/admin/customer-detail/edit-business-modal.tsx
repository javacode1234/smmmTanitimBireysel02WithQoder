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
  onSave: (data: BusinessUpdate) => void
  customerId: string
  initialData: {
    ledgerType: string | null
    hasEmployees: boolean | null
    subscriptionFee: string | null
    establishmentDate: string | null
    taxPeriodType: string | null
    status: "ACTIVE" | "INACTIVE"
    onboardingStage: "LEAD" | "PROSPECT" | "CUSTOMER"
  }
}

interface BusinessUpdate {
  ledgerType: string
  hasEmployees: boolean
  subscriptionFee: string
  establishmentDate: string
  taxPeriodType: string | null
  status: "ACTIVE" | "INACTIVE"
  onboardingStage: "LEAD" | "PROSPECT" | "CUSTOMER"
}

export function EditBusinessModal({ isOpen, onClose, onSave, customerId, initialData }: EditBusinessModalProps) {
  const [ledgerType, setLedgerType] = useState("")
  const [hasEmployees, setHasEmployees] = useState<boolean>(false)
  const [subscriptionFee, setSubscriptionFee] = useState("")
  const [establishmentDate, setEstablishmentDate] = useState("")
  const [taxPeriodType, setTaxPeriodType] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [onboardingStage, setOnboardingStage] = useState("LEAD")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setLedgerType(initialData.ledgerType || "")
      setHasEmployees(initialData.hasEmployees || false)
      setSubscriptionFee(initialData.subscriptionFee || "")
      setEstablishmentDate(initialData.establishmentDate ? initialData.establishmentDate.split('T')[0] : "")
      setTaxPeriodType(initialData.taxPeriodType || "")
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
        body: JSON.stringify({ 
          ledgerType, 
          hasEmployees,
          subscriptionFee, 
          establishmentDate: establishmentDate || null, 
          taxPeriodType: taxPeriodType || null,
          status, 
          onboardingStage 
        }),
      })

      if (response.ok) {
        toast.success("İş bilgileri güncellendi")
        onSave({ ledgerType, hasEmployees, subscriptionFee, establishmentDate, taxPeriodType, status, onboardingStage })
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
            <Label htmlFor="hasEmployees">Sigortalı Çalışan</Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="hasEmployeesYes"
                  name="hasEmployees"
                  checked={hasEmployees === true}
                  onChange={() => setHasEmployees(true)}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="hasEmployeesYes" className="cursor-pointer">Var</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="hasEmployeesNo"
                  name="hasEmployees"
                  checked={hasEmployees === false}
                  onChange={() => setHasEmployees(false)}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="hasEmployeesNo" className="cursor-pointer">Yok</Label>
              </div>
            </div>
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
            <Label htmlFor="taxPeriodType">Vergi Dönemi</Label>
            <Select value={taxPeriodType} onValueChange={setTaxPeriodType}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal Dönem (Ocak-Aralık)</SelectItem>
                <SelectItem value="SPECIAL">Özel Dönem</SelectItem>
              </SelectContent>
            </Select>
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

"use client"

import { useState, useEffect } from "react"
import { Plus, Save, Trash2, ArrowRight, ArrowLeft, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface FeeInfoTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

interface MonthlyFees {
  [key: string]: string // month index (1-12) -> amount
}

interface AccountingPeriod {
  year: number
  monthlyFee: string
  feeAccrualDay: number
  monthlyFees: MonthlyFees
}

const MONTHS = [
  { id: 1, name: "Ocak" },
  { id: 2, name: "Şubat" },
  { id: 3, name: "Mart" },
  { id: 4, name: "Nisan" },
  { id: 5, name: "Mayıs" },
  { id: 6, name: "Haziran" },
  { id: 7, name: "Temmuz" },
  { id: 8, name: "Ağustos" },
  { id: 9, name: "Eylül" },
  { id: 10, name: "Ekim" },
  { id: 11, name: "Kasım" },
  { id: 12, name: "Aralık" },
]

export function FeeInfoTab({ customerId, onNext, onBack }: FeeInfoTabProps) {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // New Year Dialog State
  const [isNewYearDialogOpen, setIsNewYearDialogOpen] = useState(false)
  const [newYear, setNewYear] = useState<string>(new Date().getFullYear().toString())
  const [newYearDefaultFee, setNewYearDefaultFee] = useState<string>("")

  useEffect(() => {
    if (customerId) {
      fetchCustomerFees()
    }
  }, [customerId])

  const fetchCustomerFees = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/customers?id=${customerId}`)
      if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
      
      const data = await res.json()
      if (data.accountingperiod) {
        const mappedPeriods = data.accountingperiod.map((p: any) => ({
          year: p.year,
          monthlyFee: p.monthlyFee || "0",
          feeAccrualDay: p.feeAccrualDay || 1,
          monthlyFees: p.monthlyFees ? JSON.parse(p.monthlyFees) : {}
        }))
        setPeriods(mappedPeriods)
        if (mappedPeriods.length > 0 && !selectedYear) {
          // Select current year if exists, otherwise first one
          const currentYear = new Date().getFullYear()
          const hasCurrent = mappedPeriods.find((p: any) => p.year === currentYear)
          setSelectedYear(hasCurrent ? currentYear : mappedPeriods[0].year)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Ücret bilgileri yüklenirken hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (shouldNavigate: boolean = false) => {
    if (!customerId) return

    try {
      setIsSaving(true)
      
      // Prepare payload
      // We send all periods to update
      const payload = {
        accountingPeriods: periods.map(p => ({
          year: p.year,
          monthlyFee: p.monthlyFee,
          monthlyFees: JSON.stringify(p.monthlyFees)
        }))
      }

      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let errorMessage = "Kaydetme başarısız";
        try {
            const errorData = await res.json();
            console.error("Save error details (JSON):", errorData);
            if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                errorMessage = errorData.error || errorData.details || JSON.stringify(errorData);
            } else {
                 // Try to get text if json is empty object
                 throw new Error("Boş veri alındı");
            }
        } catch (e) {
            console.warn("JSON parsing failed or empty, trying text...", e);
            try {
                const errorText = await res.text();
                console.error("Save error details (Text):", errorText);
                errorMessage = `Sunucu hatası (${res.status}): ${errorText.substring(0, 200)}`;
            } catch (textError) {
                 errorMessage = `Sunucu hatası: ${res.status} ${res.statusText}`;
            }
        }
        throw new Error(errorMessage)
      }

      toast.success("Ücret bilgileri kaydedildi")
      if (shouldNavigate) {
        onNext()
      }
    } catch (error) {
      console.error(error)
      toast.error("Kaydetme sırasında hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddYear = () => {
    const year = parseInt(newYear)
    if (periods.some(p => p.year === year)) {
      toast.error("Bu yıl zaten eklenmiş")
      return
    }

    const newPeriod: AccountingPeriod = {
      year,
      monthlyFee: "0",
      feeAccrualDay: 1,
      monthlyFees: {}
    }

    // Initialize monthly fees with default if provided
    if (newYearDefaultFee) {
      MONTHS.forEach(m => {
        newPeriod.monthlyFees[m.id] = newYearDefaultFee
      })
    }

    setPeriods(prev => [...prev, newPeriod].sort((a, b) => b.year - a.year))
    setSelectedYear(year)
    setIsNewYearDialogOpen(false)
    setNewYearDefaultFee("")
  }

  const handleRemoveYear = (year: number) => {
    setPeriods(prev => prev.filter(p => p.year !== year))
    if (selectedYear === year) {
      setSelectedYear(null)
    }
  }

  const updateMonthlyFee = (year: number, monthId: number, amount: string) => {
    setPeriods(prev => prev.map(p => {
      if (p.year !== year) return p
      return {
        ...p,
        monthlyFees: {
          ...p.monthlyFees,
          [monthId]: amount
        }
      }
    }))
  }

  const applyDefaultToAllMonths = (year: number) => {
    const period = periods.find(p => p.year === year)
    if (!period) return

    const defaultFee = period.monthlyFee
    const updatedFees = { ...period.monthlyFees }
    
    MONTHS.forEach(m => {
      updatedFees[m.id] = defaultFee
    })

    setPeriods(prev => prev.map(p => {
      if (p.year !== year) return p
      return {
        ...p,
        monthlyFees: updatedFees
      }
    }))
    toast.success(`${year} yılı için tüm aylara ${defaultFee} TL uygulandı`)
  }

  const currentPeriod = periods.find(p => p.year === selectedYear)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ücret Bilgileri</CardTitle>
          <CardDescription>
            Yıllık ve aylık bazda ücret tutarlarını belirleyin.
          </CardDescription>
        </div>
        <Dialog open={isNewYearDialogOpen} onOpenChange={setIsNewYearDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Yıl Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Yıl Ücreti Tanımla</DialogTitle>
              <DialogDescription>
                Hangi yıl için ücret belirlemek istiyorsunuz?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Yıl</Label>
                <Select value={newYear} onValueChange={setNewYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Varsayılan Aylık Tutar (TL)</Label>
                <Input 
                  type="number" 
                  value={newYearDefaultFee} 
                  onChange={(e) => setNewYearDefaultFee(e.target.value)}
                  placeholder="Örn: 1000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddYear}>Ekle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {periods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            Henüz ücret yılı tanımlanmadı. "Yeni Yıl Ekle" butonu ile başlayın.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Year List */}
            <div className="w-full md:w-48 flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              <Label className="mb-2 sticky top-0 bg-card z-10 py-1">Yıllar</Label>
              {periods.map(p => (
                <div key={p.year} className="flex items-center gap-2">
                  <Button
                    variant={selectedYear === p.year ? "default" : "outline"}
                    className="flex-1 justify-start"
                    onClick={() => setSelectedYear(p.year)}
                  >
                    {p.year}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveYear(p.year)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Monthly Details */}
            {currentPeriod && (
              <div className="flex-1 space-y-6 border rounded-lg p-4 bg-muted/10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {MONTHS.map(month => (
                    <div key={month.id} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{month.name}</Label>
                      <Input 
                        type="number"
                        value={currentPeriod.monthlyFees[month.id] || ""}
                        onChange={(e) => updateMonthlyFee(currentPeriod.year, month.id, e.target.value)}
                        placeholder={currentPeriod.monthlyFee}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4 border-t gap-2 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              Kaydet
            </Button>
            <Button 
              type="button" 
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              İleri
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

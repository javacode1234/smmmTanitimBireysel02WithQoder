"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  CheckCircle2,
  XCircle,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type TaxReturn = {
  id: string
  customerId: string
  type: string
  period: string
  year: number
  month: number | null
  dueDate: string
  submittedDate: string | null
  isSubmitted: boolean
  notes: string | null
  createdAt: string
  customer: {
    id: string
    companyName: string
    taxNumber: string | null
  }
}

type Customer = {
  id: string
  companyName: string
  taxNumber: string | null
}

// Common tax return types in Turkey
const TAX_RETURN_TYPES = [
  "KDV (Katma Değer Vergisi)",
  "Muhtasar (Stopaj Beyannamesi)",
  "Gelir Vergisi",
  "Kurumlar Vergisi",
  "Geçici Vergi",
  "Damga Vergisi",
  "Veraset ve İntikal Vergisi",
  "Diğer"
]

export default function TaxReturnsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("current") // current, all, custom
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString())
  const [customMonth, setCustomMonth] = useState((new Date().getMonth() + 1).toString())
  const [customMonthEnd, setCustomMonthEnd] = useState((new Date().getMonth() + 1).toString())

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTaxReturn, setSelectedTaxReturn] = useState<TaxReturn | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taxReturnToDelete, setTaxReturnToDelete] = useState<TaxReturn | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    customerId: "",
    type: "",
    period: "",
    dueDate: "",
    submittedDate: "",
    isSubmitted: false,
    notes: ""
  })

  useEffect(() => {
    setIsMounted(true)
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchTaxReturns()
    }
  }, [isMounted, periodFilter, customYear, customMonth, typeFilter, statusFilter])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTaxReturns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Period filtering based on due date
      if (periodFilter === "current") {
        // Show tax returns due this month
        params.set("currentPeriod", "true")
      } else if (periodFilter === "custom") {
        params.set("currentPeriod", "false")
        // Custom date range filtering can be added here if needed
        // For now, we'll show all and filter on client side
      } else {
        params.set("currentPeriod", "false")
      }

      if (typeFilter !== "all") {
        params.set("type", typeFilter)
      }

      if (statusFilter !== "all") {
        params.set("isSubmitted", statusFilter)
      }

      const res = await fetch(`/api/tax-returns?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTaxReturns(data)
      } else {
        toast.error("Beyannameler yüklenirken hata oluştu")
      }
    } catch (e) {
      console.error(e)
      toast.error("Beyannameler yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTaxReturn = () => {
    setSelectedTaxReturn(null)
    setFormData({
      customerId: "",
      type: "",
      period: "",
      dueDate: "",
      submittedDate: "",
      isSubmitted: false,
      notes: ""
    })
    setIsModalOpen(true)
  }

  const handleEditTaxReturn = (taxReturn: TaxReturn) => {
    setSelectedTaxReturn(taxReturn)
    setFormData({
      customerId: taxReturn.customerId,
      type: taxReturn.type,
      period: taxReturn.period,
      dueDate: taxReturn.dueDate.split('T')[0],
      submittedDate: taxReturn.submittedDate ? taxReturn.submittedDate.split('T')[0] : "",
      isSubmitted: taxReturn.isSubmitted,
      notes: taxReturn.notes || ""
    })
    setIsModalOpen(true)
  }

  const handleToggleSubmitted = async (taxReturn: TaxReturn) => {
    try {
      const newStatus = !taxReturn.isSubmitted
      const updateData = {
        ...taxReturn,
        isSubmitted: newStatus,
        submittedDate: newStatus ? new Date().toISOString() : null
      }

      const res = await fetch(`/api/tax-returns?id=${taxReturn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        toast.success(newStatus ? "Beyanname verildi olarak işaretlendi" : "Beyanname verilmedi olarak işaretlendi")
        fetchTaxReturns()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (e) {
      console.error(e)
      toast.error("Güncelleme başarısız")
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.customerId || !formData.type || !formData.period || !formData.dueDate) {
        toast.error("Lütfen tüm zorunlu alanları doldurun")
        return
      }

      const url = selectedTaxReturn 
        ? `/api/tax-returns?id=${selectedTaxReturn.id}`
        : '/api/tax-returns'
      
      const method = selectedTaxReturn ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(selectedTaxReturn ? "Beyanname güncellendi" : "Beyanname eklendi")
        setIsModalOpen(false)
        fetchTaxReturns()
      } else {
        const error = await res.json()
        toast.error(error.error || "İşlem başarısız")
      }
    } catch (e) {
      console.error(e)
      toast.error("İşlem başarısız")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tax-returns?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Beyanname silindi")
        setIsDeleteDialogOpen(false)
        setTaxReturnToDelete(null)
        fetchTaxReturns()
      } else {
        toast.error("Silme işlemi başarısız")
      }
    } catch (e) {
      console.error(e)
      toast.error("Silme işlemi başarısız")
    }
  }

  const filteredTaxReturns = taxReturns.filter(tr => {
    const matchesSearch = searchTerm === "" || 
      tr.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tr.customer.taxNumber && tr.customer.taxNumber.includes(searchTerm))
    
    // Custom date range filtering
    if (periodFilter === "custom") {
      const dueDate = new Date(tr.dueDate)
      const startMonth = parseInt(customMonth)
      const endMonth = parseInt(customMonthEnd)
      const year = parseInt(customYear)
      
      const dueDateMonth = dueDate.getMonth() + 1 // 1-12
      const dueDateYear = dueDate.getFullYear()
      
      // Check if year matches
      if (dueDateYear !== year) {
        return false
      }
      
      // Check if month is in range
      if (dueDateMonth < startMonth || dueDateMonth > endMonth) {
        return false
      }
    }
    
    return matchesSearch
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Beyanname Takibi</h1>
        <p className="text-muted-foreground mt-2">
          Bu ay verilmesi gereken beyannameleri görüntüleyin ve yönetin (son tarih bazlı)
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Müşteri veya beyanname ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchTaxReturns}
              disabled={loading}
              title="Yenile"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAddTaxReturn}
              title="Yeni Beyanname"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Beyanname
            </Button>
          </div>
        </div>

        {isMounted && (
          <div className="flex flex-wrap gap-4">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Dönem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Bu Ay Verilecekler</SelectItem>
                <SelectItem value="all">Tüm Beyannameler</SelectItem>
                <SelectItem value="custom">Özel Tarih Aralığı</SelectItem>
              </SelectContent>
            </Select>

            {periodFilter === "custom" && (
              <>
                <Input
                  type="number"
                  placeholder="Yıl"
                  value={customYear}
                  onChange={(e) => setCustomYear(e.target.value)}
                  className="w-[100px]"
                />
                <Select value={customMonth} onValueChange={setCustomMonth}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Başlangıç Ay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ocak</SelectItem>
                    <SelectItem value="2">Şubat</SelectItem>
                    <SelectItem value="3">Mart</SelectItem>
                    <SelectItem value="4">Nisan</SelectItem>
                    <SelectItem value="5">Mayıs</SelectItem>
                    <SelectItem value="6">Haziran</SelectItem>
                    <SelectItem value="7">Temmuz</SelectItem>
                    <SelectItem value="8">Ağustos</SelectItem>
                    <SelectItem value="9">Eylül</SelectItem>
                    <SelectItem value="10">Ekim</SelectItem>
                    <SelectItem value="11">Kasım</SelectItem>
                    <SelectItem value="12">Aralık</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={customMonthEnd} onValueChange={setCustomMonthEnd}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Bitiş Ay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ocak</SelectItem>
                    <SelectItem value="2">Şubat</SelectItem>
                    <SelectItem value="3">Mart</SelectItem>
                    <SelectItem value="4">Nisan</SelectItem>
                    <SelectItem value="5">Mayıs</SelectItem>
                    <SelectItem value="6">Haziran</SelectItem>
                    <SelectItem value="7">Temmuz</SelectItem>
                    <SelectItem value="8">Ağustos</SelectItem>
                    <SelectItem value="9">Eylül</SelectItem>
                    <SelectItem value="10">Ekim</SelectItem>
                    <SelectItem value="11">Kasım</SelectItem>
                    <SelectItem value="12">Aralık</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Beyanname Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                {TAX_RETURN_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="true">Verildi</SelectItem>
                <SelectItem value="false">Verilmedi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Beyannameler ({filteredTaxReturns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Dönem</TableHead>
                  <TableHead>Son Tarih</TableHead>
                  <TableHead>Verildiği Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : filteredTaxReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTaxReturns.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tr.customer.companyName}</div>
                          <div className="text-sm text-muted-foreground">{tr.customer.taxNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tr.type}</Badge>
                      </TableCell>
                      <TableCell>{tr.period}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(tr.dueDate).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tr.submittedDate 
                          ? new Date(tr.submittedDate).toLocaleDateString("tr-TR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSubmitted(tr)}
                          className={tr.isSubmitted ? "text-green-600" : "text-red-600"}
                        >
                          {tr.isSubmitted ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verildi
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Verilmedi
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditTaxReturn(tr)}
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setTaxReturnToDelete(tr)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Return Modal */}
      {isMounted && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTaxReturn ? "Beyanname Düzenle" : "Yeni Beyanname"}
              </DialogTitle>
              <DialogDescription>
                Beyanname bilgilerini girin
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Müşteri *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => setFormData({...formData, customerId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.companyName} {c.taxNumber ? `(${c.taxNumber})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Beyanname Tipi *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tip seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_RETURN_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="period">Dönem *</Label>
                <Input
                  id="period"
                  placeholder="Örn: 2024-11 veya 2024"
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Son Tarih *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="submittedDate">Verildiği Tarih</Label>
                <Input
                  id="submittedDate"
                  type="date"
                  value={formData.submittedDate}
                  onChange={(e) => setFormData({...formData, submittedDate: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSubmitted"
                  checked={formData.isSubmitted}
                  onChange={(e) => setFormData({...formData, isSubmitted: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="isSubmitted">Verildi</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSave}>
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isMounted && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setTaxReturnToDelete(null)
          }}
          onConfirm={() => taxReturnToDelete && handleDelete(taxReturnToDelete.id)}
          title="Beyanname Sil"
          description={taxReturnToDelete ? `"${taxReturnToDelete.customer.companyName}" müşterisinin ${taxReturnToDelete.type} beyannamesi silinecek. Emin misiniz?` : undefined}
        />
      )}
    </div>
  )
}

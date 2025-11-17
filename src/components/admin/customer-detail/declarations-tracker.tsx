"use client"

import { useState, useEffect, Fragment, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { FileText, Check, AlertCircle, Calendar as CalendarIcon, RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"

interface TaxReturn {
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
}

interface DeclarationsTrackerProps {
  customerId: string
}

export function DeclarationsTracker({ customerId }: DeclarationsTrackerProps) {
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  
  // Year options for select
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 1, currentYear, currentYear + 1].map(String)
  }, [])

  const formatPeriod = (tr: TaxReturn) => {
    const t = tr.type.toLowerCase()
    const due = new Date(tr.dueDate)
    if (t.includes('aylık') || t.includes('kdv') || t.includes('damga')) {
      const y = due.getFullYear()
      const m = due.getMonth() + 1
      const prevDate = new Date(y, m - 2, 1)
      const py = prevDate.getFullYear()
      const pm = String(prevDate.getMonth() + 1).padStart(2, '0')
      return `${py}-${pm}`
    }
    if (tr.period.includes('Q')) {
      const parts = tr.period.split('-Q')
      if (parts.length === 2) {
        return `${parts[0]}-${parts[1]}`
      }
    }
    if (t.includes('geçici') || t.includes('3 aylık')) {
      const dm = due.getMonth() + 1
      const map: any = { 5: 1, 8: 2, 11: 3, 2: 4 }
      const q = map[dm] || null
      const dy = due.getFullYear()
      const displayYear = dm === 2 ? dy - 1 : dy
      if (q) return `${displayYear}-${q}`
    }
    return tr.period
  }
  
  useEffect(() => {
    fetchTaxReturns()
  }, [customerId, yearFilter, monthFilter, typeFilter, statusFilter])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [yearFilter, monthFilter, typeFilter, statusFilter])

  // Fetch tax returns with current filters
  const fetchTaxReturns = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append('customerId', customerId)
      
      // Use year and month filters separately
      if (monthFilter !== 'all') {
        const [y, m] = monthFilter.split('-')
        params.append('dueDateYear', y)
        params.append('dueDateMonth', m)
      } else if (yearFilter !== 'all') {
        params.append('year', yearFilter)
      }
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      
      if (statusFilter !== 'all') {
        params.append('isSubmitted', statusFilter === 'submitted' ? 'true' : 'false')
      }

      const response = await fetch(`/api/tax-returns?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTaxReturns(data)
        setCurrentPage(1)
      } else {
        toast.error('Beyannameler alınamadı')
      }
    } catch (error) {
      console.error('Error fetching tax returns:', error)
      toast.error('Beyannameler alınamadı')
    } finally {
      setLoading(false)
    }
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
        toast.success(newStatus ? 'Beyanname verildi olarak işaretlendi' : 'Beyanname verilmedi olarak işaretlendi')
        fetchTaxReturns()
      } else {
        toast.error('Güncelleme başarısız')
      }
    } catch (e) {
      console.error(e)
      toast.error('Güncelleme başarısız')
    }
  }

  const getDeclarationStatus = (taxReturn: TaxReturn): 'pending' | 'submitted' | 'overdue' => {
    if (taxReturn.isSubmitted) return 'submitted'
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(taxReturn.dueDate)
    due.setHours(0, 0, 0, 0)
    
    return today > due ? 'overdue' : 'pending'
  }

  const getStatusBadge = (taxReturn: TaxReturn) => {
    const currentStatus = getDeclarationStatus(taxReturn)
    
    switch (currentStatus) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
            <Check className="h-3 w-3" />
            Verildi
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3" />
            Gecikmiş
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
            <CalendarIcon className="h-3 w-3" />
            Bekliyor
          </span>
        )
    }
  }

  // Get unique types from tax returns
  const [availableTypes, setAvailableTypes] = useState<string[]>([])

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await fetch(`/api/customer-declaration-settings?customerId=${customerId}`)
        if (res.ok) {
          const data = await res.json()
          const types = data.filter((d: any) => d.enabled).map((d: any) => d.type)
          if (types.length > 0) {
            setAvailableTypes(Array.from(new Set(types)))
            return
          }
        }
      } catch {}
    }
    loadTypes()
  }, [customerId])

  // Pagination
  const totalPages = Math.ceil(taxReturns.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTaxReturns = taxReturns.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Status options for select
  const statusOptions = [
    { value: "all", label: "Tümü" },
    { value: "pending", label: "Bekliyor" },
    { value: "submitted", label: "Verildi" },
    { value: "overdue", label: "Gecikmiş" }
  ]

  // Generate period options for the last 2 years
  const periodOptions = useMemo(() => {
    const options = []
    const currentYear = new Date().getFullYear()
    
    // Generate periods for current year and previous year
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      // Add monthly periods only
      for (let month = 1; month <= 12; month++) {
        const monthNames = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                           'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
        options.push({
          value: `${year}-${String(month).padStart(2, '0')}`,
          label: monthNames[month], // Sadece ay ismi
          year: year,
          month: month
        })
      }
    }
    
    return options
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Dönemsel beyanname veriliş takibi
          </p>
          {taxReturns.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Toplam {taxReturns.length} kayıt gösteriliyor
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTaxReturns}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Filters - Converted to comboboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="year-filter" className="text-xs mb-1 block">Yıl</Label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger id="year-filter" className="h-9">
              <SelectValue placeholder="Yıl seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="period-filter" className="text-xs mb-1 block">Ay</Label>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger id="period-filter" className="h-9">
              <SelectValue placeholder="Ay seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Aylar</SelectItem>
              {periodOptions
                .filter(period => period.value.startsWith(yearFilter))
                .map(period => (
                  <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type-filter" className="text-xs mb-1 block">Beyanname Türü</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type-filter" className="h-9">
              <SelectValue placeholder="Tür seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Beyannameler</SelectItem>
              {availableTypes.map((type: string) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status-filter" className="text-xs mb-1 block">Durum</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" className="h-9">
              <SelectValue placeholder="Durum seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-3">Yükleniyor...</p>
        </div>
      ) : paginatedTaxReturns.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beyanname Türü</TableHead>
                <TableHead>Dönem</TableHead>
                <TableHead>Son Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Verilme Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTaxReturns.map((taxReturn) => (
                <TableRow key={taxReturn.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {taxReturn.type}
                    </div>
                  </TableCell>
                  <TableCell>{formatPeriod(taxReturn)}</TableCell>
                  <TableCell>
                    {new Date(taxReturn.dueDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(taxReturn)}
                  </TableCell>
                  <TableCell>
                    {taxReturn.submittedDate
                      ? new Date(taxReturn.submittedDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSubmitted(taxReturn)}
                      className={taxReturn.isSubmitted ? '' : 'bg-green-50 hover:bg-green-100'}
                    >
                      {taxReturn.isSubmitted ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1 text-red-600" />
                          İptal Et
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-600" />
                          Verildi
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {taxReturns.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Toplam {taxReturns.length} kayıttan {startIndex + 1}-{Math.min(endIndex, taxReturns.length)} arası gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  İlk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, current, and adjacent pages
                      if (page === 1 || page === totalPages) return true
                      if (Math.abs(page - currentPage) <= 1) return true
                      return false
                    })
                    .map((page, idx, arr) => (
                      <Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      </Fragment>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Son
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Kayıt bulunamadı</p>
          <p className="text-sm text-muted-foreground mt-1">
            Filtreleri değiştirerek tekrar deneyin veya "Ayarlar" sekmesinden beyanname oluşturun
          </p>
        </div>
      )}
    </div>
  )
}
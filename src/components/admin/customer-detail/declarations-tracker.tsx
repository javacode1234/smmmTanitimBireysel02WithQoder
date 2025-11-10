"use client"

import { useState, useEffect, Fragment } from "react"
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
  const [pageSize] = useState(5)

  useEffect(() => {
    fetchTaxReturns()
  }, [customerId, yearFilter, monthFilter, typeFilter, statusFilter])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [yearFilter, monthFilter, typeFilter, statusFilter])

  const fetchTaxReturns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('customerId', customerId)
      
      // Year filter - filter by period year
      if (yearFilter !== "all") {
        params.set('year', yearFilter)
      }
      
      // Month filter - filter by due date month
      if (monthFilter !== "all") {
        params.set('dueDateYear', yearFilter)
        params.set('dueDateMonth', (parseInt(monthFilter) + 1).toString()) // +1 because filter is 0-11, but API expects 1-12
      }
      
      if (typeFilter !== "all") {
        params.set('type', typeFilter)
      }
      
      if (statusFilter !== "all") {
        params.set('isSubmitted', statusFilter === 'submitted' ? 'true' : 'false')
      }
      
      const res = await fetch(`/api/tax-returns?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTaxReturns(data)
      } else {
        toast.error('Beyannameler yüklenirken hata oluştu')
      }
    } catch (e) {
      console.error(e)
      toast.error('Beyannameler yüklenirken hata oluştu')
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
  const availableTypes = Array.from(new Set(taxReturns.map(tr => tr.type)))

  // Pagination
  const totalPages = Math.ceil(taxReturns.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTaxReturns = taxReturns.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const yearOptions = [
    (new Date().getFullYear() - 1).toString(),
    new Date().getFullYear().toString(),
    (new Date().getFullYear() + 1).toString()
  ]

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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-32">
          <Label className="text-xs">Yıl</Label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Label className="text-xs">Ay (Verilme Ayı)</Label>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Aylar</SelectItem>
              <SelectItem value="0">Ocak</SelectItem>
              <SelectItem value="1">Şubat</SelectItem>
              <SelectItem value="2">Mart</SelectItem>
              <SelectItem value="3">Nisan</SelectItem>
              <SelectItem value="4">Mayıs</SelectItem>
              <SelectItem value="5">Haziran</SelectItem>
              <SelectItem value="6">Temmuz</SelectItem>
              <SelectItem value="7">Ağustos</SelectItem>
              <SelectItem value="8">Eylül</SelectItem>
              <SelectItem value="9">Ekim</SelectItem>
              <SelectItem value="10">Kasım</SelectItem>
              <SelectItem value="11">Aralık</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs">Beyanname Türü</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Beyannameler</SelectItem>
              {availableTypes.map((type: string) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Label className="text-xs">Durum</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="pending">Bekliyor</SelectItem>
              <SelectItem value="submitted">Verildi</SelectItem>
              <SelectItem value="overdue">Gecikmiş</SelectItem>
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
                  <TableCell>{taxReturn.period}</TableCell>
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

"use client"

import { useState, useMemo, Fragment } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  ArrowUpDown,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"

interface TaxReturn {
  id: string
  type: string
  period: string
  year: number
  month: number | null
  dueDate: string // Serialized date
  isSubmitted: boolean
  submittedDate: string | null // Serialized date
  notes: string | null
}

interface Stats {
  total: number
  submitted: number
  pending: number
  upcoming: number
}

interface DeclarationsClientPageProps {
  data: TaxReturn[]
  stats: Stats
  years: number[]
  selectedYear: string
}

export function DeclarationsClientPage({ 
  data, 
  stats, 
  years,
  selectedYear,
}: DeclarationsClientPageProps) {
  const router = useRouter()
  
  // Table State
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof TaxReturn; direction: 'asc' | 'desc' } | null>({ key: 'dueDate', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter handlers (URL updates)
  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value === "all") {
      params.delete("year")
    } else {
      params.set("year", value)
    }
    router.push(`?${params.toString()}`)
  }

  // Client-side filtering & sorting
  const processedData = useMemo(() => {
    let filtered = [...data]

    // Text Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.type.toLowerCase().includes(lower) || 
        item.period.toLowerCase().includes(lower) ||
        (item.notes && item.notes.toLowerCase().includes(lower))
      )
    }

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue === bValue) return 0
        
        // Handle dates or nulls
        if (aValue === null) return 1
        if (bValue === null) return -1

        const comparison = aValue > bValue ? 1 : -1
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSort = (key: keyof TaxReturn) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beyannamelerim</h1>
          <p className="text-muted-foreground mt-2">
            Vergi beyannamelerinizin durumunu ve geçmiş kayıtlarınızı buradan takip edebilirsiniz.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Yıl Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Yıllar</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Beyanname</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Seçili dönemde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">Tamamlanan işlemler</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">İşlem bekleyenler</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yaklaşan Ödemeler</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Son 7 gün içinde</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Beyanname Listesi</CardTitle>
              <CardDescription>
                Tüm beyanname ve bildirgeleriniz aşağıda listelenmiştir.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ara (Tür, dönem, not...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1">
                      Beyanname Türü
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('period')}>
                     <div className="flex items-center gap-1">
                      Dönem
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('dueDate')}>
                     <div className="flex items-center gap-1">
                      Son Ödeme
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('isSubmitted')}>
                     <div className="flex items-center gap-1">
                      Durum
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Onay Tarihi</TableHead>
                  <TableHead className="text-right">Notlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.type}
                      </TableCell>
                      <TableCell>
                        {item.period}
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.dueDate), "d MMMM yyyy", { locale: tr })}
                      </TableCell>
                      <TableCell>
                        {item.isSubmitted ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Onaylandı
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                            <Clock className="w-3 h-3 mr-1" /> Bekliyor
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.submittedDate ? (
                          format(new Date(item.submittedDate), "d MMMM yyyy", { locale: tr })
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right max-w-[200px] truncate">
                        {item.notes || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {processedData.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sayfada</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>Kayıt var. Toplam kayıt sayısı {processedData.length}.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  İlk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
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
                          onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Son
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

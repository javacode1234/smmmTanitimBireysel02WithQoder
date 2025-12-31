"use client"

import React from "react"
import { useEffect, useState, Fragment, useCallback } from "react"
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
  CheckCircle2,
  XCircle,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
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

import { DECLARATION_TYPES } from "@/lib/declaration-logic"

// Common tax return types in Turkey
const TAX_RETURN_TYPES = Object.values(DECLARATION_TYPES)

export default function TaxReturnsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("current") // current, all, custom
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString())
  const [customMonth, setCustomMonth] = useState((new Date().getMonth() + 1).toString())

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)

  

  useEffect(() => {
    setIsMounted(true)
    fetchCustomers()
  }, [])

  const fetchTaxReturns = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (periodFilter === "current") {
        params.set("dueDateYear", new Date().getFullYear().toString())
        params.set("dueDateMonth", (new Date().getMonth() + 1).toString())
      } else if (periodFilter === "custom") {
        params.set("dueDateYear", customYear)
        params.set("dueDateMonth", customMonth)
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
  }, [periodFilter, customYear, customMonth, typeFilter, statusFilter])

  useEffect(() => {
    if (isMounted) {
      fetchTaxReturns()
      setCurrentPage(1)
    }
  }, [isMounted, fetchTaxReturns])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        // API returns { items: [...], total, page, pageSize }
        // Set customers state with the items array
        if (data.items && Array.isArray(data.items)) {
          setCustomers(data.items)
        } else {
          // Fallback: if data is directly an array
          setCustomers(Array.isArray(data) ? data : [])
        }
      }
    } catch (e) {
      console.error(e)
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

  const filteredTaxReturns = taxReturns.filter(tr => {
    const matchesSearch = searchTerm === "" || 
      tr.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tr.customer.taxNumber && tr.customer.taxNumber.includes(searchTerm))
    
    const matchesCustomer = customerFilter === "all" || tr.customerId === customerFilter
    
    return matchesSearch && matchesCustomer
  })

  // Pagination
  const totalPages = Math.ceil(filteredTaxReturns.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTaxReturns = filteredTaxReturns.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Beyanname Takibi</h1>
        <p className="text-muted-foreground mt-2">
          Belirtilen ayda verilmesi gereken beyannameleri görüntüleyin ve yönetin
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
                <SelectItem value="custom">Özel Ay Seç</SelectItem>
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
                    <SelectValue placeholder="Ay" />
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

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Müşteri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Müşteriler</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
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
                ) : paginatedTaxReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTaxReturns.map((tr) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSubmitted(tr)}
                          className={tr.isSubmitted ? '' : 'bg-green-50 hover:bg-green-100'}
                        >
                          {tr.isSubmitted ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1 text-red-600" />
                              İptal Et
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                              Verildi
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredTaxReturns.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredTaxReturns.length} kayıttan {startIndex + 1}-{Math.min(endIndex, filteredTaxReturns.length)} arası gösteriliyor
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
        </CardContent>
      </Card>
    </div>
  )
}

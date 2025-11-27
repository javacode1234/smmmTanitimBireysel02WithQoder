"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Search, RefreshCw, UserPlus, /* Edit, */ Trash2, Eye, Building2, Copy } from "lucide-react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

type Customer = {
  id: string
  logo: string | null
  companyName: string
  taxNumber: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  facebookUrl: string | null
  xUrl: string | null
  linkedinUrl: string | null
  instagramUrl: string | null
  threadsUrl: string | null
  ledgerType: string | null
  subscriptionFee: string | null
  establishmentDate: string | null
  authorizedName: string | null
  authorizedTCKN: string | null
  authorizedEmail: string | null
  authorizedPhone: string | null
  authorizedAddress: string | null
  authorizedFacebookUrl: string | null
  authorizedXUrl: string | null
  authorizedLinkedinUrl: string | null
  authorizedInstagramUrl: string | null
  authorizedThreadsUrl: string | null
  authorizationDate: string | null
  authorizationPeriod: string | null
  declarations: string | null
  documents: string | null
  passwords: string | null
  notes: string | null
  status: "ACTIVE" | "INACTIVE"
  onboardingStage: "LEAD" | "PROSPECT" | "CUSTOMER"
  createdAt: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  useEffect(() => {
    setIsMounted(true)
    
    // Listen for close-all-dialogs event
    const handleCloseAllDialogs = () => {
      // Use setTimeout to ensure the DOM is ready for cleanup
      setTimeout(() => {
        setIsDeleteDialogOpen(false)
        setCustomerToDelete(null)
        setIsNavigating(false)
      }, 0)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('close-all-dialogs', handleCloseAllDialogs)
    }
    
    // Cleanup: Close all modals and reset navigation on unmount to prevent DOM errors
    return () => {
      // Ensure dialogs are closed before unmounting
      setIsNavigating(false)
      setIsDeleteDialogOpen(false)
      setCustomerToDelete(null)
      
      // Remove event listener
      if (typeof window !== 'undefined') {
        window.removeEventListener('close-all-dialogs', handleCloseAllDialogs)
      }
    }
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set("search", searchTerm)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (stageFilter !== "all") params.set("stage", stageFilter)
      params.set("page", currentPage.toString())
      params.set("pageSize", itemsPerPage.toString())

      const res = await fetch(`/api/customers?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'accept': 'application/json' }
      })
      if (res.ok) {
        try {
          const contentType = res.headers.get('content-type') || ''
          const data = contentType.includes('application/json') ? await res.json() : JSON.parse(await res.text())
          
          if (data && data.items && Array.isArray(data.items)) {
            setCustomers(data.items)
          } else if (Array.isArray(data)) {
            setCustomers(data)
          } else if (data && Array.isArray(data.items) === false && Array.isArray(data) === false) {
            setCustomers([])
          }
        } catch (parseError) {
          console.error('Response parse error:', parseError)
          setCustomers([])
        }
      } else {
        let errorMessage = "Müşteriler yüklenirken hata oluştu";
        try {
          const contentType = res.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const errorJson = await res.json()
            if (errorJson && typeof errorJson === 'object') {
              errorMessage = errorJson.error || JSON.stringify(errorJson)
            }
          } else {
            const errorText = await res.text()
            errorMessage = errorText || `HTTP ${res.status}: ${res.statusText || 'Bilinmeyen hata'}`
          }
        } catch {
          errorMessage = `HTTP ${res.status}: ${res.statusText || 'Bilinmeyen hata'}`
        }
        
        toast.error(errorMessage, {
          action: {
            label: <div className="flex items-center gap-1"><Copy className="h-3 w-3" /> Kopyala</div>,
            onClick: () => {
              navigator.clipboard.writeText(errorMessage)
              toast.success('Hata mesajı kopyalandı')
            }
          },
          duration: 10000
        })
      }
    } catch (e) {
      console.error(e)
      const errorMessage = e instanceof Error ? e.message : "Müşteriler yüklenirken hata oluştu"
      toast.error(errorMessage, {
        action: {
          label: <div className="flex items-center gap-1"><Copy className="h-3 w-3" /> Kopyala</div>,
          onClick: () => {
            navigator.clipboard.writeText(errorMessage)
            toast.success('Hata mesajı kopyalandı')
          }
        },
        duration: 10000
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isMounted) {
      fetchCustomers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, searchTerm, statusFilter, stageFilter, currentPage, itemsPerPage])

  const filteredCount = customers.length
  const startIndex = (currentPage - 1) * itemsPerPage
  const totalPages = Math.max(1, Math.ceil(filteredCount / itemsPerPage))

  const handleAddCustomer = () => {
    // Close any open dialogs before navigation
    setIsDeleteDialogOpen(false)
    setCustomerToDelete(null)
    
    // Dispatch event to close any open dialogs across the app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-all-dialogs'))
    }
    
    // Use setTimeout to ensure DOM cleanup before navigation
    setTimeout(() => {
      router.push('/admin/customers/new')
    }, 80)
  }

  const handleViewCustomer = (customerId: string) => {
    if (isNavigating) return // Prevent multiple navigation attempts
    
    // Close all modals before navigation
    setIsDeleteDialogOpen(false)
    setCustomerToDelete(null)
    
    // Dispatch event to close any open dialogs across the app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-all-dialogs'))
    }
    
    // Use setTimeout to ensure DOM cleanup before navigation
    setTimeout(() => {
      router.push(`/admin/customers/${customerId}`)
    }, 80)
  }

  const handleRowDoubleClick = (customerId: string) => {
    if (isNavigating) return // Prevent multiple navigation attempts
    
    // Close all modals before navigation
    setIsDeleteDialogOpen(false)
    setCustomerToDelete(null)
    
    // Dispatch event to close any open dialogs across the app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-all-dialogs'))
    }
    
    // Use setTimeout to ensure DOM cleanup before navigation
    setTimeout(() => {
      router.push(`/admin/customers/${customerId}`)
    }, 80)
  }

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== customerId))
        setIsDeleteDialogOpen(false)
        // Delay clearing state
        setTimeout(() => {
          setCustomerToDelete(null)
        }, 150)
        toast.success('Müşteri silindi')
      } else {
        toast.error('Müşteri silinemedi')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Müşteri silinemedi')
    }
  }

  return (
    <div suppressHydrationWarning>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Müşteriler</h1>
        <p className="text-muted-foreground mt-2">
          Müşteri kayıtlarını görüntüleyin ve yönetin
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Şirket, kişi veya email ara..."
                value={searchTerm}
                onChange={(e) => {
                  setCurrentPage(1)
                  setSearchTerm(e.target.value)
                }}
                className="pl-10"
              />
            </div>
          </div>

          {isMounted && (
            <>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setCurrentPage(1)
                  setStatusFilter(v)
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Durum Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Pasif</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={stageFilter}
                onValueChange={(v) => {
                  setCurrentPage(1)
                  setStageFilter(v)
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Aşama Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Aşamalar</SelectItem>
                  <SelectItem value="LEAD">Aday</SelectItem>
                  <SelectItem value="PROSPECT">Potansiyel</SelectItem>
                  <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(v) => {
                  setItemsPerPage(Number(v))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Kayıt Sayısı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCustomers}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleAddCustomer}
            title="Yeni Müşteri"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Yeni Müşteri
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Logo</TableHead>
                  <TableHead>Şirket</TableHead>
                  <TableHead>VKN/TCKN</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Aşama</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: Math.max(3, itemsPerPage) }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-10 w-10 rounded" />
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  customers
                    .slice(startIndex, startIndex + itemsPerPage)
                    .map((c) => (
                      <TableRow 
                        key={c.id}
                        onDoubleClick={() => !isNavigating && handleRowDoubleClick(c.id)}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                          isNavigating ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        <TableCell>
                          {c.logo ? (
                            <div className="relative w-10 h-10 border rounded overflow-hidden">
                              <Image src={c.logo} alt={c.companyName} fill className="object-contain" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 border rounded bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{c.companyName}</TableCell>
                        <TableCell>{c.taxNumber || "-"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{c.email || "-"}</div>
                            <div className="text-muted-foreground">{c.phone || "-"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded ${
                            c.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {c.status === "ACTIVE" ? "Aktif" : "Pasif"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {c.onboardingStage === "LEAD"
                              ? "Aday"
                              : c.onboardingStage === "PROSPECT"
                              ? "Potansiyel"
                              : "Müşteri"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!isNavigating) handleViewCustomer(c.id)
                              }}
                              disabled={isNavigating}
                              title="Görüntüle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!isNavigating) confirmDelete(c)
                              }}
                              disabled={isNavigating}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredCount} sonuçtan {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredCount)} arası gösteriliyor
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          // Delay clearing state to prevent DOM errors
          setTimeout(() => {
            setCustomerToDelete(null)
          }, 150)
        }}
        onConfirm={() => customerToDelete && handleDelete(customerToDelete.id)}
        title="Müşteriyi Sil"
        description={customerToDelete ? `"${customerToDelete.companyName}" şirketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` : undefined}
      />
    </div>
  )
}

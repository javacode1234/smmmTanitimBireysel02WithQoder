"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Search, Filter, RefreshCw, Edit, Trash2 } from "lucide-react"
import { QuoteRequestModal } from "@/components/admin/quote-request-modal"
import { EditQuoteRequestModal } from "@/components/admin/edit-quote-request-modal"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { toast } from "sonner"
import { exportQuoteRequestToPDF } from "@/lib/pdf-export"

// Mock data - will be replaced with actual API data
const mockQuoteRequests = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    phone: "0555 123 4567",
    company: "ABC Ltd. Şti.",
    serviceType: "Muhasebe",
    message: "Şirketimiz için tam zamanlı muhasebe hizmeti talep ediyoruz.",
    status: "pending",
    createdAt: "2024-01-15T10:30:00",
  },
  {
    id: "2",
    name: "Ayşe Demir",
    email: "ayse@example.com",
    phone: "0532 987 6543",
    company: "XYZ A.Ş.",
    serviceType: "Vergi Danışmanlığı",
    message: "Kurumlar vergisi beyannamesinde danışmanlık ihtiyacımız var.",
    status: "reviewed",
    createdAt: "2024-01-14T14:20:00",
  },
  {
    id: "3",
    name: "Mehmet Kaya",
    email: "mehmet@example.com",
    phone: "0543 456 7890",
    company: "DEF Ticaret",
    serviceType: "Bordrolama",
    message: "Aylık bordro ve SGK işlemleri için destek arıyoruz.",
    status: "contacted",
    createdAt: "2024-01-13T09:15:00",
  },
  {
    id: "4",
    name: "Fatma Özkan",
    email: "fatma@example.com",
    phone: "0533 234 5678",
    company: "GHI Pazarlama",
    serviceType: "Denetim",
    message: "Yıllık mali tablolarımızın denetimi için teklif istiyoruz.",
    status: "pending",
    createdAt: "2024-01-12T16:45:00",
  },
  {
    id: "5",
    name: "Ali Şahin",
    email: "ali@example.com",
    phone: "0544 876 5432",
    company: "JKL İnşaat",
    serviceType: "Muhasebe",
    message: "İnşaat sektörüne özel muhasebe danışmanlığı talep ediyoruz.",
    status: "completed",
    createdAt: "2024-01-11T11:00:00",
  },
]

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
}

const statusLabels = {
  NEW: "Yeni",
  PENDING: "Beklemede",
  REVIEWED: "İncelendi",
  CONTACTED: "İletişime Geçildi",
  COMPLETED: "Tamamlandı",
}

export default function QuoteRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Fetch requests from API
  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/quote-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        toast.error('Teklif talepleri yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching quote requests:', error)
      toast.error('Teklif talepleri yüklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  // Ensure component is mounted on client before fetching
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchRequests()
    }
  }, [isMounted])

  // Filter data
  const filteredData = requests.filter((request) => {
    const matchesSearch = 
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesService = serviceFilter === "all" || request.serviceType === serviceFilter
    
    return matchesSearch && matchesStatus && matchesService
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handleEditStatus = (request: any) => {
    setSelectedRequest(request)
    setIsEditModalOpen(true)
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/quote-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: newStatus }),
      })

      if (response.ok) {
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: newStatus } 
              : req
          )
        )
        setIsEditModalOpen(false)
        toast.success('Teklif talebi durumu başarıyla güncellendi!')
      } else {
        toast.error('Durum güncellenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Durum güncellenirken bir hata oluştu')
    }
  }

  const handleDelete = async (requestId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/quote-requests?id=${requestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== requestId))
        setIsDeleteDialogOpen(false)
        setRequestToDelete(null)
        toast.success('Teklif talebi başarıyla silindi!')
      } else {
        toast.error('Teklif talebi silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      toast.error('Teklif talebi silinirken bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (request: any) => {
    setRequestToDelete(request)
    setIsDeleteDialogOpen(true)
  }

  const handleExportPDF = (request: any) => {
    try {
      exportQuoteRequestToPDF(request)
      toast.success('Teklif talebi başarıyla dışa aktarıldı!')
    } catch (error) {
      console.error('Error exporting request:', error)
      toast.error('Dışa aktarma sırasında bir hata oluştu')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const serviceTypes = [...new Set(requests.map(r => r.serviceType))]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teklif Talepleri</h1>
          <p className="text-muted-foreground mt-2">
            Anasayfadan gelen teklif taleplerini görüntüleyin ve yönetin
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchRequests}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teklif Talepleri Listesi</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ad, email veya şirket ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Durum Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="NEW">Yeni</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
                <SelectItem value="REVIEWED">İncelendi</SelectItem>
                <SelectItem value="CONTACTED">İletişime Geçildi</SelectItem>
                <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Hizmet Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hizmetler</SelectItem>
                {serviceTypes.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Kayıt Sayısı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Kayıt</SelectItem>
                <SelectItem value="10">10 Kayıt</SelectItem>
                <SelectItem value="25">25 Kayıt</SelectItem>
                <SelectItem value="50">50 Kayıt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Şirket</TableHead>
                  <TableHead>Hizmet Türü</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Yüklen iyor...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Sonuç bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.company}</TableCell>
                      <TableCell>{request.serviceType}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.email}</div>
                          <div className="text-muted-foreground">{request.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(request.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                          {statusLabels[request.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditStatus(request)}
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewDetails(request)}
                            title="Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleExportPDF(request)}
                            title="PDF İndir"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDelete(request)}
                            title="Sil"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredData.length} sonuçtan {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredData.length)} arası gösteriliyor
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <QuoteRequestModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExportPDF={handleExportPDF}
      />

      {/* Edit Status Modal */}
      <EditQuoteRequestModal
        request={selectedRequest}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setRequestToDelete(null)
        }}
        onConfirm={() => requestToDelete && handleDelete(requestToDelete.id)}
        title="Teklif Talebini Sil"
        description={requestToDelete ? `"${requestToDelete.company}" firmasının "${requestToDelete.serviceType}" hizmeti için yaptığı teklif talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  )
}

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
import { Eye, Download, Search, RefreshCw, Edit, Trash2 } from "lucide-react"
import { JobApplicationModal } from "@/components/admin/job-application-modal"
import { EditJobApplicationModal } from "@/components/admin/edit-job-application-modal"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { toast } from "sonner"
import { exportJobApplicationToPDF } from "@/lib/pdf-export"

// Mock data
const mockJobApplications = [
  {
    id: "1",
    name: "Selin Akar",
    email: "selin@example.com",
    phone: "0555 111 2233",
    position: "Mali Müşavir Yardımcısı",
    experience: "3 yıl",
    education: "İktisat Fakültesi",
    coverLetter: "Muhasebe alanında 3 yıllık tecrübem ve SMMM sınavına hazırlanıyor olmam nedeniyle ekibinizde yer almak istiyorum.",
    cvFileName: "selin_akar_cv.pdf",
    status: "new",
    createdAt: "2024-01-15T10:00:00",
  },
  {
    id: "2",
    name: "Murat Çelik",
    email: "murat@example.com",
    phone: "0532 444 5566",
    position: "Muhasebe Elemanı",
    experience: "5 yıl",
    education: "İşletme Fakültesi",
    coverLetter: "Şirketinizde muhasebe departmanında çalışmak ve kendimi geliştirmek istiyorum.",
    cvFileName: "murat_celik_cv.pdf",
    status: "reviewing",
    createdAt: "2024-01-14T09:30:00",
  },
  {
    id: "3",
    name: "Deniz Yılmaz",
    email: "deniz@example.com",
    phone: "0543 777 8899",
    position: "Stajyer",
    experience: "Yeni Mezun",
    education: "Muhasebe ve Finans Yönetimi",
    coverLetter: "Yeni mezun olarak pratik tecrübe kazanmak ve SMMM olma yolunda ilerlemek istiyorum.",
    cvFileName: "deniz_yilmaz_cv.pdf",
    status: "interviewed",
    createdAt: "2024-01-13T14:20:00",
  },
  {
    id: "4",
    name: "Ayşe Demir",
    email: "ayse.demir@example.com",
    phone: "0533 222 3344",
    position: "Mali Müşavir",
    experience: "8 yıl",
    education: "İktisat Fakültesi - Yüksek Lisans",
    coverLetter: "SMMM ruhsatına sahip, 8 yıllık tecrübeli bir mali müşavir olarak ekibinize katılmak istiyorum.",
    cvFileName: "ayse_demir_cv.pdf",
    status: "rejected",
    createdAt: "2024-01-12T11:00:00",
  },
]

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  REVIEWING: "bg-yellow-100 text-yellow-800",
  INTERVIEWED: "bg-purple-100 text-purple-800",
  REJECTED: "bg-red-100 text-red-800",
  ACCEPTED: "bg-green-100 text-green-800",
}

const statusLabels = {
  NEW: "Yeni",
  REVIEWING: "İnceleniyor",
  INTERVIEWED: "Görüşme Yapıldı",
  REJECTED: "Reddedildi",
  ACCEPTED: "Kabul Edildi",
}

export default function JobApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Fetch applications from API
  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/job-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        toast.error('Başvurular yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Başvurular yüklenirken bir hata oluştu')
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
      fetchApplications()
    }
  }, [isMounted])

  // Filter data
  const filteredData = applications.filter((application) => {
    const matchesSearch = 
      application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || application.status === statusFilter
    const matchesPosition = positionFilter === "all" || application.position === positionFilter
    
    return matchesSearch && matchesStatus && matchesPosition
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleEditStatus = (application: any) => {
    setSelectedApplication(application)
    setIsEditModalOpen(true)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/job-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: newStatus }),
      })

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus } 
              : app
          )
        )
        setIsEditModalOpen(false)
        toast.success('Başvuru durumu başarıyla güncellendi!')
      } else {
        toast.error('Durum güncellenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Durum güncellenirken bir hata oluştu')
    }
  }

  const handleDelete = async (applicationId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/job-applications?id=${applicationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationId))
        setIsDeleteDialogOpen(false)
        setApplicationToDelete(null)
        toast.success('Başvuru başarıyla silindi!')
      } else {
        toast.error('Başvuru silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      toast.error('Başvuru silinirken bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (application: any) => {
    setApplicationToDelete(application)
    setIsDeleteDialogOpen(true)
  }

  const handleExportPDF = (application: any) => {
    try {
      exportJobApplicationToPDF(application)
      toast.success('Başvuru başarıyla dışa aktarıldı!')
    } catch (error) {
      console.error('Error exporting application:', error)
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

  const positions = [...new Set(applications.map(a => a.position))]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İş Müracaatları</h1>
          <p className="text-muted-foreground mt-2">
            Anasayfadan gelen iş başvurularını görüntüleyin ve yönetin
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchApplications}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Başvurular Listesi</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ad, email veya pozisyon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {isMounted && (
              <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Durum Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="NEW">Yeni</SelectItem>
                    <SelectItem value="REVIEWING">İnceleniyor</SelectItem>
                    <SelectItem value="INTERVIEWED">Görüşme Yapıldı</SelectItem>
                    <SelectItem value="REJECTED">Reddedildi</SelectItem>
                    <SelectItem value="ACCEPTED">Kabul Edildi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Pozisyon Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Pozisyonlar</SelectItem>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
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
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Deneyim</TableHead>
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
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Sonuç bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell>{application.position}</TableCell>
                      <TableCell>{application.experience}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{application.email}</div>
                          <div className="text-muted-foreground">{application.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(application.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                          {statusLabels[application.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditStatus(application)}
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewDetails(application)}
                            title="Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleExportPDF(application)}
                            title="PDF İndir"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDelete(application)}
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
      <JobApplicationModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExportPDF={handleExportPDF}
      />

      {/* Edit Status Modal */}
      <EditJobApplicationModal
        application={selectedApplication}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setApplicationToDelete(null)
        }}
        onConfirm={() => applicationToDelete && handleDelete(applicationToDelete.id)}
        title="Başvuruyu Sil"
        description={applicationToDelete ? `"${applicationToDelete.name}" adlı adayın "${applicationToDelete.position}" pozisyonu için yaptığı başvuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  )
}

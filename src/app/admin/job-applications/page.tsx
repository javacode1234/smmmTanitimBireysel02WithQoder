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
import { Skeleton } from "@/components/ui/skeleton"

type ApplicationStatus = 'NEW' | 'REVIEWING' | 'INTERVIEWED' | 'REJECTED' | 'ACCEPTED'

interface JobApplication {
  id: string
  name: string
  email: string
  phone: string
  position: string
  experience: string
  education: string
  coverLetter?: string
  cvFileName?: string
  createdAt: string
  status: ApplicationStatus
}


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
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<JobApplication | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Fetch applications from API
  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/job-applications')
      if (response.ok) {
        const data = await response.json() as Array<{ id: string; name: string; email: string; phone: string; position: string; experience: string; education: string; coverLetter?: string; cvFileName?: string; createdAt: string; status: string }>
        const allowed: ApplicationStatus[] = ['NEW','REVIEWING','INTERVIEWED','REJECTED','ACCEPTED']
        const normalized: JobApplication[] = (data || []).map(d => {
          const up = String(d.status || '').toUpperCase()
          const status = (allowed as string[]).includes(up) ? (up as ApplicationStatus) : 'NEW'
          return { ...d, status }
        })
        setApplications(normalized)
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

  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleEditStatus = (application: JobApplication) => {
    setSelectedApplication(application)
    setIsEditModalOpen(true)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const response = await fetch('/api/job-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status: newStatus }),
      })

      if (response.ok) {
        setApplications(prev => prev.map(app => (app.id === applicationId ? { ...app, status: newStatus } : app)))
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

  const confirmDelete = (application: JobApplication) => {
    setApplicationToDelete(application)
    setIsDeleteDialogOpen(true)
  }

  const handleExportPDF = (application: JobApplication) => {
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
                  Array.from({ length: Math.max(3, itemsPerPage) }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell className="font-medium"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
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

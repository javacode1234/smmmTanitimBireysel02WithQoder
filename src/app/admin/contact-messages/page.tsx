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
import { ContactMessageModal } from "@/components/admin/contact-message-modal"
import { EditContactMessageModal } from "@/components/admin/edit-contact-message-modal"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { toast } from "sonner"
import { exportContactMessageToPDF } from "@/lib/pdf-export"

// Mock data
const mockContactMessages = [
  {
    id: "1",
    name: "Zeynep Kara",
    email: "zeynep@example.com",
    phone: "0555 789 1234",
    subject: "Hizmetleriniz Hakkında",
    message: "Şirketimiz için sunduğunuz hizmetler hakkında detaylı bilgi almak istiyorum.",
    status: "new",
    createdAt: "2024-01-15T09:30:00",
  },
  {
    id: "2",
    name: "Can Aydın",
    email: "can@example.com",
    phone: "0532 456 7890",
    subject: "Fiyat Teklifi",
    message: "KDV beyannamesi hazırlama hizmetiniz için ücret bilgisi rica ediyorum.",
    status: "replied",
    createdAt: "2024-01-14T11:20:00",
  },
  {
    id: "3",
    name: "Elif Yıldız",
    email: "elif@example.com",
    phone: "0543 123 4567",
    subject: "Randevu Talebi",
    message: "Ofise gelerek görüşmek istiyorum. Uygun bir randevu tarihi alabir miyim?",
    status: "pending",
    createdAt: "2024-01-13T14:45:00",
  },
  {
    id: "4",
    name: "Burak Özdemir",
    email: "burak@example.com",
    phone: "0533 987 6543",
    subject: "Şikayet",
    message: "Geçen ay gönderdiğim belgelerin işlenmesiyle ilgili bir sorun yaşadım.",
    status: "resolved",
    createdAt: "2024-01-12T16:10:00",
  },
]

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REPLIED: "bg-green-100 text-green-800",
  RESOLVED: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  NEW: "Yeni",
  PENDING: "Beklemede",
  REPLIED: "Yanıtlandı",
  RESOLVED: "Çözüldü",
}

export default function ContactMessagesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Fetch messages from API
  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/contact-messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        toast.error('Mesajlar yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      toast.error('Mesajlar yüklenirken bir hata oluştu')
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
      fetchMessages()
    }
  }, [isMounted])

  // Filter data
  const filteredData = messages.filter((message) => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (message: any) => {
    setSelectedMessage(message)
    setIsModalOpen(true)
  }

  const handleEditStatus = (message: any) => {
    setSelectedMessage(message)
    setIsEditModalOpen(true)
  }

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId, status: newStatus }),
      })

      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: newStatus } 
              : msg
          )
        )
        setIsEditModalOpen(false)
        toast.success('Mesaj durumu başarıyla güncellendi!')
      } else {
        toast.error('Durum güncellenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Durum güncellenirken bir hata oluştu')
    }
  }

  const handleDelete = async (messageId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/contact-messages?id=${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
        setIsDeleteDialogOpen(false)
        setMessageToDelete(null)
        toast.success('Mesaj başarıyla silindi!')
      } else {
        toast.error('Mesaj silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Mesaj silinirken bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (message: any) => {
    setMessageToDelete(message)
    setIsDeleteDialogOpen(true)
  }

  const handleExportPDF = (message: any) => {
    try {
      exportContactMessageToPDF(message)
      toast.success('Mesaj başarıyla dışa aktarıldı!')
    } catch (error) {
      console.error('Error exporting message:', error)
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İletişim Mesajları</h1>
          <p className="text-muted-foreground mt-2">
            Anasayfadan gelen iletişim mesajlarını görüntüleyin ve yönetin
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchMessages}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mesajlar Listesi</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ad, email veya konu ara..."
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
                <SelectItem value="REPLIED">Yanıtlandı</SelectItem>
                <SelectItem value="RESOLVED">Çözüldü</SelectItem>
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
                  <TableHead>Konu</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Yüklen iyor...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Sonuç bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{message.email}</div>
                          <div className="text-muted-foreground">{message.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                          {statusLabels[message.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditStatus(message)}
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewDetails(message)}
                            title="Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleExportPDF(message)}
                            title="PDF İndir"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDelete(message)}
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
      <ContactMessageModal
        message={selectedMessage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExportPDF={handleExportPDF}
      />

      {/* Edit Status Modal */}
      <EditContactMessageModal
        message={selectedMessage}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setMessageToDelete(null)
        }}
        onConfirm={() => messageToDelete && handleDelete(messageToDelete.id)}
        title="Mesajı Sil"
        description={messageToDelete ? `"${messageToDelete.subject}" konulu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, Phone, Calendar, FileText, Briefcase, GraduationCap, Clock, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

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
  cvFileData?: string
  cvMimeType?: string
  cvFilePath?: string
  createdAt: string
  status: ApplicationStatus
}

interface JobApplicationModalProps {
  application: JobApplication | null
  isOpen: boolean
  onClose: () => void
  onExportPDF: (application: JobApplication) => void
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

export function JobApplicationModal({ application, isOpen, onClose, onExportPDF }: JobApplicationModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  if (!application) return null

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

  const downloadBase64 = (base64Data: string, mimeType: string, fileName: string) => {
    try {
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'cv.pdf'
      
      if (document.body) {
        document.body.appendChild(link)
        link.click()
        
        setTimeout(() => {
          try {
            if (link && link.parentNode && link.parentNode.contains(link)) {
              link.parentNode.removeChild(link)
            } else if (link && typeof link.remove === 'function') {
              link.remove()
            }
          } catch (removeError) {
            console.warn('Error removing download link:', removeError)
          }
        }, 100)
      }
    } catch (error) {
      console.warn('Error handling download:', error)
      toast.error('Dosya indirilirken hata oluştu')
    }
  }

  const handleDownloadCV = async () => {
    // Check if application has cvFileData (base64)
    if (application.cvFileData && application.cvMimeType) {
      downloadBase64(application.cvFileData, application.cvMimeType, application.cvFileName || 'cv.pdf')
      return
    }

    // Check if legacy path exists
    if (application.cvFilePath) {
      window.open(application.cvFilePath, '_blank')
      return
    }

    // If no data locally, try fetching from API
    if (application.cvFileName) {
      try {
        setIsDownloading(true)
        const res = await fetch(`/api/job-applications?id=${application.id}`)
        if (!res.ok) throw new Error('Başvuru detayları alınamadı')
        
        const fullApp = await res.json()
        
        if (fullApp.cvFileData && fullApp.cvMimeType) {
          downloadBase64(fullApp.cvFileData, fullApp.cvMimeType, fullApp.cvFileName || 'cv.pdf')
        } else {
          toast.error('CV dosyası bulunamadı')
        }
      } catch (err) {
        console.error(err)
        toast.error('İndirme sırasında hata oluştu')
      } finally {
        setIsDownloading(false)
      }
    } else {
       toast.error('CV dosyası bulunamadı')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">İş Başvurusu Detayları</DialogTitle>
          <DialogDescription>
            Başvuru ID: #{application.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(application.createdAt)}
                </span>
              </div>
              <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                {statusLabels[application.status as keyof typeof statusLabels]}
              </Badge>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Başvuran Bilgileri</h3>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Ad Soyad</div>
                    <div className="text-base font-semibold">{application.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">E-posta</div>
                    <div className="text-base font-semibold">
                      <a href={`mailto:${application.email}`} className="text-primary hover:underline">
                        {application.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Telefon</div>
                    <div className="text-base font-semibold">
                      <a href={`tel:${application.phone}`} className="text-primary hover:underline">
                        {application.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Başvurulan Pozisyon</div>
                    <div className="text-base font-semibold">{application.position}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Deneyim</div>
                    <div className="text-base font-semibold">{application.experience}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Eğitim</div>
                    <div className="text-base font-semibold">{application.education}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cover Letter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Ön Yazı</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </div>

            <Separator />

            {/* CV File */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">CV Belgesi</h3>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium">{application.cvFileName}</div>
                    <div className="text-xs text-muted-foreground">CV Dosyası</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownloadCV}>
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button onClick={() => onExportPDF(application)}>
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

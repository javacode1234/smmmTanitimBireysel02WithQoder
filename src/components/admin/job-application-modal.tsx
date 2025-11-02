"use client"

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
import { Download, Mail, Phone, Calendar, FileText, Briefcase, GraduationCap, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface JobApplicationModalProps {
  application: any
  isOpen: boolean
  onClose: () => void
  onExportPDF: (application: any) => void
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  REVIEWING: "bg-yellow-100 text-yellow-800",
  INTERVIEWED: "bg-purple-100 text-purple-800",
  REJECTED: "bg-red-100 text-red-800",
  ACCEPTED: "bg-green-100 text-green-800",
  // Lowercase variants for compatibility
  new: "bg-blue-100 text-blue-800",
  reviewing: "bg-yellow-100 text-yellow-800",
  interviewed: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-green-100 text-green-800",
}

const statusLabels = {
  NEW: "Yeni",
  REVIEWING: "İnceleniyor",
  INTERVIEWED: "Görüşme Yapıldı",
  REJECTED: "Reddedildi",
  ACCEPTED: "Kabul Edildi",
  // Lowercase variants for compatibility
  new: "Yeni",
  reviewing: "İnceleniyor",
  interviewed: "Görüşme Yapıldı",
  rejected: "Reddedildi",
  accepted: "Kabul Edildi",
}

export function JobApplicationModal({ application, isOpen, onClose, onExportPDF }: JobApplicationModalProps) {
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

  const handleDownloadCV = () => {
    // Check if application has cvFileData (base64) or cvFilePath (legacy)
    if (application.cvFileData && application.cvMimeType) {
      // Convert base64 to blob and download
      const byteCharacters = atob(application.cvFileData)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: application.cvMimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = application.cvFileName || 'cv.pdf'
      
      // Safely append, click, and remove the link
      try {
        if (document.body) {
          document.body.appendChild(link)
          link.click()
          
          // Use setTimeout to ensure click is processed before removal
          setTimeout(() => {
            try {
              // Check if link still has a parent before removing
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
      } finally {
        // Revoke URL after a delay to ensure download starts
        setTimeout(() => {
          try {
            window.URL.revokeObjectURL(url)
          } catch (revokeError) {
            console.warn('Error revoking URL:', revokeError)
          }
        }, 1000)
      }
    } else if (application.cvFilePath) {
      // Legacy: Open CV file path in new tab
      window.open(application.cvFilePath, '_blank')
    } else {
      // No CV available
      alert('CV dosyası bulunamadı')
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
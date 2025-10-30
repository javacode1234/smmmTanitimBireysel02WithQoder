"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, Phone, Building2, Briefcase, Calendar, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface QuoteRequestModalProps {
  request: any
  isOpen: boolean
  onClose: () => void
  onExportPDF: (request: any) => void
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  // Lowercase variants for compatibility
  new: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
}

const statusLabels = {
  NEW: "Yeni",
  PENDING: "Beklemede",
  REVIEWED: "İncelendi",
  CONTACTED: "İletişime Geçildi",
  COMPLETED: "Tamamlandı",
  // Lowercase variants for compatibility
  new: "Yeni",
  pending: "Beklemede",
  reviewed: "İncelendi",
  contacted: "İletişime Geçildi",
  completed: "Tamamlandı",
}

export function QuoteRequestModal({ request, isOpen, onClose, onExportPDF }: QuoteRequestModalProps) {
  if (!request) return null

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Teklif Talebi Detayları</DialogTitle>
          <DialogDescription>
            Talep ID: #{request.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(request.createdAt)}
                </span>
              </div>
              <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                {statusLabels[request.status as keyof typeof statusLabels]}
              </Badge>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">İletişim Bilgileri</h3>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Ad Soyad</div>
                    <div className="text-base font-semibold">{request.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Şirket</div>
                    <div className="text-base font-semibold">{request.company}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">E-posta</div>
                    <div className="text-base font-semibold">
                      <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                        {request.email}
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
                      <a href={`tel:${request.phone}`} className="text-primary hover:underline">
                        {request.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Hizmet Türü</div>
                    <div className="text-base font-semibold">{request.serviceType}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Message */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Talep Mesajı</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {request.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Footer */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button onClick={() => onExportPDF(request)}>
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

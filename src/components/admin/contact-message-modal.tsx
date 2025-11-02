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
import { Download, Mail, Phone, Calendar, FileText, MessageSquare } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface ContactMessageModalProps {
  message: any
  isOpen: boolean
  onClose: () => void
  onExportPDF: (message: any) => void
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REPLIED: "bg-green-100 text-green-800",
  RESOLVED: "bg-gray-100 text-gray-800",
  // Lowercase variants for compatibility
  new: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  replied: "bg-green-100 text-green-800",
  resolved: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  NEW: "Yeni",
  PENDING: "Beklemede",
  REPLIED: "Yanıtlandı",
  RESOLVED: "Çözüldü",
  // Lowercase variants for compatibility
  new: "Yeni",
  pending: "Beklemede",
  replied: "Yanıtlandı",
  resolved: "Çözüldü",
}

export function ContactMessageModal({ message, isOpen, onClose, onExportPDF }: ContactMessageModalProps) {
  if (!message) return null

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
          <DialogTitle className="text-2xl">İletişim Mesajı Detayları</DialogTitle>
          <DialogDescription>
            Mesaj ID: #{message.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                {statusLabels[message.status as keyof typeof statusLabels]}
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
                    <div className="text-base font-semibold">{message.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">E-posta</div>
                    <div className="text-base font-semibold">
                      <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                        {message.email}
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
                      <a href={`tel:${message.phone}`} className="text-primary hover:underline">
                        {message.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Konu</div>
                    <div className="text-base font-semibold">{message.subject}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Message */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Mesaj İçeriği</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button onClick={() => onExportPDF(message)}>
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
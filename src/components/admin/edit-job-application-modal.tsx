"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface EditJobApplicationModalProps {
  application: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (applicationId: string, newStatus: string) => void
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

export function EditJobApplicationModal({ application, isOpen, onClose, onStatusUpdate }: EditJobApplicationModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(application?.status || "NEW")

  // Update selected status when application changes or modal opens
  useEffect(() => {
    if (application?.status) {
      setSelectedStatus(application.status)
    }
  }, [application?.status, isOpen])

  if (!application) return null

  const handleSave = () => {
    onStatusUpdate(application.id, selectedStatus)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>İş Başvurusu Durumunu Güncelle</DialogTitle>
          <DialogDescription>
            Başvuru ID: #{application.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Current Status */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2">
              Mevcut Durum
            </Label>
            <div className="mt-2">
              <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                {statusLabels[application.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </div>

          {/* Application Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 mt-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Pozisyon:</span>
              <span className="text-sm text-muted-foreground">{application.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">E-posta:</span>
              <span className="text-sm text-muted-foreground">{application.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Telefon:</span>
              <span className="text-sm text-muted-foreground">{application.phone}</span>
            </div>
          </div>

          {/* Status Selector */}
          <div className="mt-4">
            <Label htmlFor="status" className="text-sm font-medium">
              Yeni Durum Seçin
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    Yeni
                  </div>
                </SelectItem>
                <SelectItem value="REVIEWING">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                    İnceleniyor
                  </div>
                </SelectItem>
                <SelectItem value="INTERVIEWED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    Görüşme Yapıldı
                  </div>
                </SelectItem>
                <SelectItem value="ACCEPTED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Kabul Edildi
                  </div>
                </SelectItem>
                <SelectItem value="REJECTED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    Reddedildi
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions - Footer */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            İptal
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1"
            disabled={selectedStatus === application.status}
          >
            Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

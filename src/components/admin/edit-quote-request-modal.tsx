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

interface EditQuoteRequestModalProps {
  request: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (requestId: string, newStatus: string) => void
}

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

export function EditQuoteRequestModal({ request, isOpen, onClose, onStatusUpdate }: EditQuoteRequestModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(request?.status || "NEW")

  // Update selected status when request changes or modal opens
  useEffect(() => {
    if (request?.status) {
      setSelectedStatus(request.status)
    }
  }, [request?.status, isOpen])

  if (!request) return null

  const handleSave = () => {
    onStatusUpdate(request.id, selectedStatus)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Teklif Talebi Durumunu Güncelle</DialogTitle>
          <DialogDescription>
            Talep ID: #{request.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Current Status */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2">
              Mevcut Durum
            </Label>
            <div className="mt-2">
              <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                {statusLabels[request.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </div>

          {/* Request Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 mt-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Şirket:</span>
              <span className="text-sm text-muted-foreground">{request.company}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Hizmet Türü:</span>
              <span className="text-sm text-muted-foreground">{request.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">E-posta:</span>
              <span className="text-sm text-muted-foreground">{request.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Telefon:</span>
              <span className="text-sm text-muted-foreground">{request.phone}</span>
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
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                    Beklemede
                  </div>
                </SelectItem>
                <SelectItem value="REVIEWED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    İncelendi
                  </div>
                </SelectItem>
                <SelectItem value="CONTACTED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    İletişime Geçildi
                  </div>
                </SelectItem>
                <SelectItem value="COMPLETED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Tamamlandı
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
            disabled={selectedStatus === request.status}
          >
            Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

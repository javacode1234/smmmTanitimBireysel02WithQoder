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

interface EditContactMessageModalProps {
  message: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (messageId: string, newStatus: string) => void
}

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

export function EditContactMessageModal({ message, isOpen, onClose, onStatusUpdate }: EditContactMessageModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(message?.status || "NEW")

  // Update selected status when message changes or modal opens
  useEffect(() => {
    if (message?.status) {
      setSelectedStatus(message.status)
    }
  }, [message?.status, isOpen])

  if (!message) return null

  const handleSave = () => {
    onStatusUpdate(message.id, selectedStatus)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Mesaj Durumunu Düzenle</DialogTitle>
          <DialogDescription>
            {message.name} - Mesaj ID: #{message.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current Status */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2">
              Mevcut Durum
            </Label>
            <div className="mt-2">
              <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                {statusLabels[message.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </div>

          {/* Message Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Konu:</span>
              <span className="text-sm text-muted-foreground">{message.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">E-posta:</span>
              <span className="text-sm text-muted-foreground">{message.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Telefon:</span>
              <span className="text-sm text-muted-foreground">{message.phone}</span>
            </div>
          </div>

          {/* Status Selector */}
          <div>
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
                <SelectItem value="REPLIED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Yanıtlandı
                  </div>
                </SelectItem>
                <SelectItem value="RESOLVED">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    Çözüldü
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              disabled={selectedStatus === message.status}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

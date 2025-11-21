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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

type ContactMessageStatus = 'NEW' | 'PENDING' | 'REPLIED' | 'RESOLVED'

interface ContactMessage {
  id: string
  email: string
  phone: string
  subject: string
  status: ContactMessageStatus
}

interface EditContactMessageModalProps {
  message: ContactMessage | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (messageId: string, newStatus: ContactMessageStatus) => void
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
  const [selectedStatus, setSelectedStatus] = useState<ContactMessageStatus>(message?.status || "NEW")

  if (!message) return null

  const handleSave = () => {
    onStatusUpdate(message.id, selectedStatus)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>İletişim Mesajı Durumunu Güncelle</DialogTitle>
          <DialogDescription>
            Mesaj ID: #{message.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
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
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 mt-4">
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
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSave}
            disabled={selectedStatus === message.status}
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

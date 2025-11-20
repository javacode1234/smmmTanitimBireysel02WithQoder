"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Silme Onayı",
  description,
  itemName,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const defaultDescription = itemName
    ? `"${itemName}" kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    : "Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."

  // Safe close handler
  const handleClose = () => {
    if (!isDeleting && onClose) {
      onClose()
    }
  }

  // Safe confirm handler
  const handleConfirm = () => {
    if (!isDeleting && onConfirm) {
      onConfirm()
    }
  }

  // Handle escape key and other close events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        handleClose()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, isDeleting])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isDeleting) {
        handleClose()
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3 text-base">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
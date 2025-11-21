"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface EditAuthorizedSocialMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AuthorizedSocialMediaUpdate) => void
  customerId: string
  initialData: {
    authorizedFacebookUrl: string | null
    authorizedXUrl: string | null
    authorizedLinkedinUrl: string | null
    authorizedInstagramUrl: string | null
    authorizedThreadsUrl: string | null
  }
}

interface AuthorizedSocialMediaUpdate {
  authorizedFacebookUrl: string | null
  authorizedXUrl: string | null
  authorizedLinkedinUrl: string | null
  authorizedInstagramUrl: string | null
  authorizedThreadsUrl: string | null
}

export function EditAuthorizedSocialMediaModal({ isOpen, onClose, onSave, customerId, initialData }: EditAuthorizedSocialMediaModalProps) {
  const [authorizedFacebookUrl, setAuthorizedFacebookUrl] = useState("")
  const [authorizedXUrl, setAuthorizedXUrl] = useState("")
  const [authorizedLinkedinUrl, setAuthorizedLinkedinUrl] = useState("")
  const [authorizedInstagramUrl, setAuthorizedInstagramUrl] = useState("")
  const [authorizedThreadsUrl, setAuthorizedThreadsUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setAuthorizedFacebookUrl(initialData.authorizedFacebookUrl || "")
      setAuthorizedXUrl(initialData.authorizedXUrl || "")
      setAuthorizedLinkedinUrl(initialData.authorizedLinkedinUrl || "")
      setAuthorizedInstagramUrl(initialData.authorizedInstagramUrl || "")
      setAuthorizedThreadsUrl(initialData.authorizedThreadsUrl || "")
    }
  }, [isOpen, initialData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizedFacebookUrl: authorizedFacebookUrl || null,
          authorizedXUrl: authorizedXUrl || null,
          authorizedLinkedinUrl: authorizedLinkedinUrl || null,
          authorizedInstagramUrl: authorizedInstagramUrl || null,
          authorizedThreadsUrl: authorizedThreadsUrl || null,
        }),
      })

      if (response.ok) {
        toast.success("Yetkili sosyal medya bilgileri güncellendi")
        onSave({
          authorizedFacebookUrl: authorizedFacebookUrl || null,
          authorizedXUrl: authorizedXUrl || null,
          authorizedLinkedinUrl: authorizedLinkedinUrl || null,
          authorizedInstagramUrl: authorizedInstagramUrl || null,
          authorizedThreadsUrl: authorizedThreadsUrl || null,
        })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating authorized social media:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    setAuthorizedFacebookUrl("")
    setAuthorizedXUrl("")
    setAuthorizedLinkedinUrl("")
    setAuthorizedInstagramUrl("")
    setAuthorizedThreadsUrl("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Yetkili Sosyal Medya Hesaplarını Düzenle</DialogTitle>
          <DialogDescription>
            Yetkili kişinin sosyal medya hesaplarını ekleyin veya güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorizedFacebookUrl">Facebook</Label>
              <Input
                id="authorizedFacebookUrl"
                value={authorizedFacebookUrl}
                onChange={(e) => setAuthorizedFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <Label htmlFor="authorizedXUrl">X (Twitter)</Label>
              <Input
                id="authorizedXUrl"
                value={authorizedXUrl}
                onChange={(e) => setAuthorizedXUrl(e.target.value)}
                placeholder="https://x.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorizedLinkedinUrl">LinkedIn</Label>
              <Input
                id="authorizedLinkedinUrl"
                value={authorizedLinkedinUrl}
                onChange={(e) => setAuthorizedLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div>
              <Label htmlFor="authorizedInstagramUrl">Instagram</Label>
              <Input
                id="authorizedInstagramUrl"
                value={authorizedInstagramUrl}
                onChange={(e) => setAuthorizedInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="authorizedThreadsUrl">Nsosyal</Label>
            <Input
              id="authorizedThreadsUrl"
              value={authorizedThreadsUrl}
              onChange={(e) => setAuthorizedThreadsUrl(e.target.value)}
              placeholder="https://www.nsosyal.com/..."
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={handleClear}>
            Temizle
          </Button>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

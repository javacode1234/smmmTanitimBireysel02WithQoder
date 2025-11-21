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

interface EditSocialMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SocialMediaUpdate) => void
  customerId: string
  initialData: {
    facebookUrl: string | null
    xUrl: string | null
    linkedinUrl: string | null
    instagramUrl: string | null
    threadsUrl: string | null
  }
}

interface SocialMediaUpdate {
  facebookUrl: string | null
  xUrl: string | null
  linkedinUrl: string | null
  instagramUrl: string | null
  threadsUrl: string | null
}

export function EditSocialMediaModal({ isOpen, onClose, onSave, customerId, initialData }: EditSocialMediaModalProps) {
  const [facebookUrl, setFacebookUrl] = useState("")
  const [xUrl, setXUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [threadsUrl, setThreadsUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setFacebookUrl(initialData.facebookUrl || "")
      setXUrl(initialData.xUrl || "")
      setLinkedinUrl(initialData.linkedinUrl || "")
      setInstagramUrl(initialData.instagramUrl || "")
      setThreadsUrl(initialData.threadsUrl || "")
    }
  }, [isOpen, initialData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebookUrl: facebookUrl || null,
          xUrl: xUrl || null,
          linkedinUrl: linkedinUrl || null,
          instagramUrl: instagramUrl || null,
          threadsUrl: threadsUrl || null,
        }),
      })

      if (response.ok) {
        toast.success("Sosyal medya bilgileri güncellendi")
        onSave({
          facebookUrl: facebookUrl || null,
          xUrl: xUrl || null,
          linkedinUrl: linkedinUrl || null,
          instagramUrl: instagramUrl || null,
          threadsUrl: threadsUrl || null,
        })
        onClose()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error('Error updating social media:', error)
      toast.error("Bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    setFacebookUrl("")
    setXUrl("")
    setLinkedinUrl("")
    setInstagramUrl("")
    setThreadsUrl("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Sosyal Medya Hesaplarını Düzenle</DialogTitle>
          <DialogDescription>
            Şirketin sosyal medya hesaplarını ekleyin veya güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebookUrl">Facebook</Label>
              <Input
                id="facebookUrl"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <Label htmlFor="xUrl">X (Twitter)</Label>
              <Input
                id="xUrl"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                placeholder="https://x.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div>
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="threadsUrl">Nsosyal</Label>
            <Input
              id="threadsUrl"
              value={threadsUrl}
              onChange={(e) => setThreadsUrl(e.target.value)}
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

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface KVKKModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KVKKModal({ open, onOpenChange }: KVKKModalProps) {
  const [content, setContent] = useState<string>("")
  const [title, setTitle] = useState<string>("KVKK Aydınlatma Metni")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchContent()
    }
  }, [open])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/legal-documents?type=KVKK')
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title || "KVKK Aydınlatma Metni")
        setContent(data.content || "")
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('tr-TR') : "")
      }
    } catch (error) {
      console.error('Error fetching KVKK:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 border-b relative">
          <DialogTitle className="text-2xl font-bold">
            {title}
          </DialogTitle>
          {lastUpdated ? (
            <DialogDescription>
              Son Güncelleme: {lastUpdated}
            </DialogDescription>
          ) : (
            <DialogDescription>
              KVKK aydınlatma metni içeriğini aşağıda görüntüleyebilirsiniz.
            </DialogDescription>
          )}
          <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={() => onOpenChange(false)} aria-label="Kapat">
            ✕
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
        <DialogFooter className="sticky bottom-0 z-10 bg-muted p-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Kapat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
